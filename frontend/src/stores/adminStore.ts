"use client";

import { useSyncExternalStore } from "react";
import {
  AdminProduct,
  AdminOrder,
  AdminPrescription,
  ADMIN_PRODUCTS,
  ADMIN_ORDERS,
  ADMIN_PRESCRIPTIONS,
} from "@/data/adminData";
import { adminApi } from "@/api/admin";

interface AdminStoreState {
  products: AdminProduct[];
  orders: AdminOrder[];
  prescriptions: AdminPrescription[];
  deleteModal: {
    isOpen: boolean;
    productId: string;
    productName: string;
  } | null;
}

// Versioned localStorage keys — bumped to v3 to purge old dummy orders
const ADMIN_PRODUCTS_KEY = "genekon_admin_products_v3";
const ADMIN_ORDERS_KEY = "genekon_admin_orders_v3";
const ADMIN_PRESCRIPTIONS_KEY = "genekon_admin_prescriptions_v3";

// ─── Persistence helpers ────────────────────────────────────────────────────
function saveToStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage quota exceeded or blocked
  }
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return Array.isArray(parsed) && (parsed as unknown[]).length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// ─── Initial state — loads from localStorage, falls back to static data ─────
function getInitialState(): AdminStoreState {
  return {
    products: loadFromStorage<AdminProduct[]>(ADMIN_PRODUCTS_KEY, ADMIN_PRODUCTS),
    orders: loadFromStorage<AdminOrder[]>(ADMIN_ORDERS_KEY, ADMIN_ORDERS),
    prescriptions: loadFromStorage<AdminPrescription[]>(ADMIN_PRESCRIPTIONS_KEY, ADMIN_PRESCRIPTIONS),
    deleteModal: null,
  };
}

let state: AdminStoreState = getInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  // Persist every state change to localStorage so refresh doesn't wipe data
  saveToStorage(ADMIN_PRODUCTS_KEY, state.products);
  saveToStorage(ADMIN_ORDERS_KEY, state.orders);
  saveToStorage(ADMIN_PRESCRIPTIONS_KEY, state.prescriptions);
  listeners.forEach((listener) => listener());
}

export const adminStore = {
  getSnapshot(): AdminStoreState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Sync with backend — only replace local state if backend returns REAL data.
   * This prevents flicker / data-reset on every refresh when the backend is
   * returning different/random mock data.
   */
  async syncWithBackend(): Promise<void> {
    try {
      const [invRes, ordersRes, rxRes] = await Promise.allSettled([
        adminApi.getInventory(),
        adminApi.getAdminOrders(),
        adminApi.getPendingPrescriptions(),
      ]);

      let updated = false;

      // Only replace products if backend returned REAL products (not the static fallback)
      if (
        invRes.status === "fulfilled" &&
        invRes.value?.data?.products?.length &&
        // Heuristic: if backend products have different IDs than static fallback, they're real
        invRes.value.data.products[0]?.id !== ADMIN_PRODUCTS[0]?.id
      ) {
        state = { ...state, products: invRes.value.data.products };
        updated = true;
      }

      if (ordersRes.status === "fulfilled" && ordersRes.value?.data) {
        state = { ...state, orders: ordersRes.value.data };
        updated = true;
      }

      if (rxRes.status === "fulfilled" && rxRes.value?.data) {
        state = { ...state, prescriptions: rxRes.value.data };
        updated = true;
      }

      if (updated) emitChange();
    } catch {
      // Silently keep existing localStorage state — no reset
    }
  },

  addProduct(newProd: Partial<AdminProduct>): AdminProduct {
    // Use timestamp for stable SKU — no Math.random() to avoid refresh flicker
    const ts = Date.now().toString().slice(-6);
    const created: AdminProduct = {
      id: `prod-${ts}`,
      sku: newProd.sku || `SKU-${ts}`,
      name: newProd.name || "New Product",
      brand: newProd.brand || "Generic",
      category: newProd.category || "Medicines",
      image: newProd.image || "/images/products/cipla-paracetamol-v2.jpg",
      mrp: Number(newProd.mrp) || 100,
      sellingPrice: Number(newProd.sellingPrice) || 80,
      stockQuantity: Number(newProd.stockQuantity) || 50,
      reservedQuantity: 0,
      prescriptionRequired: !!newProd.prescriptionRequired,
      status:
        Number(newProd.stockQuantity) <= 0
          ? "Out of Stock"
          : Number(newProd.stockQuantity) <= 10
          ? "Low Stock"
          : "Active",
      composition: newProd.composition || "",
      gstRate: Number(newProd.gstRate) || 12,
      lastUpdated: "Just now",
    };

    state = {
      ...state,
      products: [created, ...state.products],
    };
    emitChange();

    adminApi
      .createProduct({
        name: created.name,
        sku: created.sku,
        brand: created.brand,
        mrp: created.mrp,
        sellingPrice: created.sellingPrice,
        prescriptionRequired: created.prescriptionRequired,
        composition: created.composition,
        gst: created.gstRate,
        status: "ACTIVE",
      })
      .catch(() => {});

    return created;
  },

  updateProduct(id: string, updates: Partial<AdminProduct>): void {
    state = {
      ...state,
      products: state.products.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates, lastUpdated: "Just now" };
          if (updates.stockQuantity !== undefined) {
            const qty = Number(updates.stockQuantity);
            updated.status =
              qty <= 0 ? "Out of Stock" : qty <= 10 ? "Low Stock" : "Active";
          }
          return updated;
        }
        return p;
      }),
    };
    emitChange();

    adminApi.updateProduct(id, updates).catch(() => {});
  },

  openDeleteModal(productId: string, productName: string): void {
    state = {
      ...state,
      deleteModal: { isOpen: true, productId, productName },
    };
    emitChange();
  },

  closeDeleteModal(): void {
    state = { ...state, deleteModal: null };
    emitChange();
  },

  confirmDeleteProduct(): void {
    if (!state.deleteModal) return;
    const { productId } = state.deleteModal;
    state = {
      ...state,
      products: state.products.filter((p) => p.id !== productId),
      deleteModal: null,
    };
    emitChange();

    adminApi.deleteProduct(productId).catch(() => {});
  },

  updateStock(productId: string, newStock: number): void {
    const qty = Math.max(0, newStock);
    const newStatus: AdminProduct["status"] =
      qty === 0 ? "Out of Stock" : qty <= 10 ? "Low Stock" : "Active";

    state = {
      ...state,
      products: state.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              stockQuantity: qty,
              status: newStatus,
              lastUpdated: "Just now",
            }
          : p
      ),
    };
    emitChange();

    adminApi
      .adjustStock({
        productId,
        quantityChanged: qty,
        changeType: "MANUAL_ADJUSTMENT",
        reason: "Inventory physical recount via admin panel",
      })
      .catch(() => {});
  },

  updateOrderStatus(
    orderId: string,
    newStatus: AdminOrder["orderStatus"]
  ): void {
    state = {
      ...state,
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, orderStatus: newStatus } : o
      ),
    };
    emitChange();

    const backendStatus =
      newStatus === "Processing"
        ? "PROCESSING"
        : newStatus === "Shipped"
        ? "SHIPPED"
        : newStatus === "Delivered"
        ? "DELIVERED"
        : newStatus === "Cancelled"
        ? "CANCELLED"
        : "CONFIRMED";

    adminApi.updateOrderStatus(orderId, backendStatus).catch(() => {});
  },

  updatePrescriptionStatus(
    rxId: string,
    newStatus: AdminPrescription["status"]
  ): void {
    state = {
      ...state,
      prescriptions: state.prescriptions.map((rx) =>
        rx.id === rxId ? { ...rx, status: newStatus } : rx
      ),
    };
    emitChange();

    const decision = newStatus === "Approved" ? "APPROVED" : "REJECTED";
    adminApi.reviewPrescription(rxId, decision).catch(() => {});
  },
};

// Server snapshot — always returns static data for SSR
const SERVER_ADMIN_SNAPSHOT: AdminStoreState = {
  products: ADMIN_PRODUCTS,
  orders: ADMIN_ORDERS,
  prescriptions: ADMIN_PRESCRIPTIONS,
  deleteModal: null,
};

const getAdminServerSnapshot = () => SERVER_ADMIN_SNAPSHOT;

export function useAdminStore() {
  const snapshot = useSyncExternalStore(
    adminStore.subscribe,
    adminStore.getSnapshot,
    getAdminServerSnapshot
  );

  return {
    ...snapshot,
    syncWithBackend: adminStore.syncWithBackend.bind(adminStore),
    addProduct: adminStore.addProduct.bind(adminStore),
    updateProduct: adminStore.updateProduct.bind(adminStore),
    openDeleteModal: adminStore.openDeleteModal.bind(adminStore),
    closeDeleteModal: adminStore.closeDeleteModal.bind(adminStore),
    confirmDeleteProduct: adminStore.confirmDeleteProduct.bind(adminStore),
    updateStock: adminStore.updateStock.bind(adminStore),
    updateOrderStatus: adminStore.updateOrderStatus.bind(adminStore),
    updatePrescriptionStatus: adminStore.updatePrescriptionStatus.bind(adminStore),
  };
}
