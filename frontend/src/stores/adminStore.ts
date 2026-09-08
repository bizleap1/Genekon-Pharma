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

const ADMIN_PRODUCTS_STORAGE_KEY = "genekon_admin_products_v1";
const ADMIN_ORDERS_STORAGE_KEY = "genekon_admin_orders_v1";

function getInitialState(): AdminStoreState {
  if (typeof window === "undefined") {
    return {
      products: ADMIN_PRODUCTS,
      orders: ADMIN_ORDERS,
      prescriptions: ADMIN_PRESCRIPTIONS,
      deleteModal: null,
    };
  }

  let products = ADMIN_PRODUCTS;
  let orders = ADMIN_ORDERS;

  try {
    const savedProds = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
    if (savedProds) products = JSON.parse(savedProds);

    const savedOrders = localStorage.getItem(ADMIN_ORDERS_STORAGE_KEY);
    if (savedOrders) orders = JSON.parse(savedOrders);
  } catch {
    // fallback
  }

  return {
    products,
    orders,
    prescriptions: ADMIN_PRESCRIPTIONS,
    deleteModal: null,
  };
}

let state: AdminStoreState = getInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(state.products));
      localStorage.setItem(ADMIN_ORDERS_STORAGE_KEY, JSON.stringify(state.orders));
    } catch (err) {
      console.error("Failed to persist admin store", err);
    }
  }
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

  addProduct(newProd: Partial<AdminProduct>): AdminProduct {
    const created: AdminProduct = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      sku: newProd.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newProd.name || "New Product",
      brand: newProd.brand || "Generic",
      category: newProd.category || "Medicines",
      image: newProd.image || "/images/products/cipla-paracetamol-v2.jpg",
      mrp: Number(newProd.mrp) || 100,
      sellingPrice: Number(newProd.sellingPrice) || 80,
      stockQuantity: Number(newProd.stockQuantity) || 50,
      reservedQuantity: 0,
      prescriptionRequired: !!newProd.prescriptionRequired,
      status: Number(newProd.stockQuantity) <= 0 ? "Out of Stock" : Number(newProd.stockQuantity) <= 10 ? "Low Stock" : "Active",
      composition: newProd.composition || "",
      gstRate: Number(newProd.gstRate) || 12,
      lastUpdated: "Just now",
    };

    state = {
      ...state,
      products: [created, ...state.products],
    };
    emitChange();
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
            updated.status = qty <= 0 ? "Out of Stock" : qty <= 10 ? "Low Stock" : "Active";
          }
          return updated;
        }
        return p;
      }),
    };
    emitChange();
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
  },
};

export function useAdminStore() {
  const snapshot = useSyncExternalStore(
    adminStore.subscribe,
    adminStore.getSnapshot,
    () => ({
      products: ADMIN_PRODUCTS,
      orders: ADMIN_ORDERS,
      prescriptions: ADMIN_PRESCRIPTIONS,
      deleteModal: null,
    })
  );

  return {
    ...snapshot,
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
