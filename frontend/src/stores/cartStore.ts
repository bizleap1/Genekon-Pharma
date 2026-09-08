"use client";

import { useSyncExternalStore } from "react";
import { CartItem, CartTotals, CouponCode } from "@/types/cart";
import { Product } from "@/types/product";
import { cartService, AVAILABLE_COUPONS } from "@/services/cartService";

interface CartState {
  items: CartItem[];
  appliedCoupon: CouponCode | null;
  deliveryType: "standard" | "express";
  syncStatus: "idle" | "synced" | "syncing";
  lastError: string | null;
}

const CART_STORE_STORAGE_KEY = "genekon_cart_v1";

function getInitialState(): CartState {
  if (typeof window === "undefined") {
    return {
      items: cartService.getStoredItems(),
      appliedCoupon: AVAILABLE_COUPONS[0], // default GENEKON20 coupon
      deliveryType: "standard",
      syncStatus: "idle",
      lastError: null,
    };
  }
  try {
    const saved = localStorage.getItem(CART_STORE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        items: parsed.items || cartService.getStoredItems(),
        appliedCoupon: parsed.appliedCoupon ?? AVAILABLE_COUPONS[0],
        deliveryType: parsed.deliveryType || "standard",
        syncStatus: "synced",
        lastError: null,
      };
    }
  } catch {
    // fallback
  }
  return {
    items: cartService.getStoredItems(),
    appliedCoupon: AVAILABLE_COUPONS[0],
    deliveryType: "standard",
    syncStatus: "idle",
    lastError: null,
  };
}

let state: CartState = getInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        CART_STORE_STORAGE_KEY,
        JSON.stringify({
          items: state.items,
          appliedCoupon: state.appliedCoupon,
          deliveryType: state.deliveryType,
        })
      );
    } catch (err) {
      console.error("Failed to persist cartStore", err);
    }
  }
  listeners.forEach((listener) => listener());
}

export const cartStore = {
  getSnapshot(): CartState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getTotals(): CartTotals {
    return cartService.calculateTotals(
      state.items,
      state.appliedCoupon,
      state.deliveryType
    );
  },

  /**
   * Adds an item to the cart with strict stock bounds check.
   * Returns an object indicating success and any stock warning.
   */
  addItem(
    product: Product,
    quantityToAdd = 1,
    variantName?: string
  ): { success: boolean; message: string; warning?: boolean } {
    const isProductOutOfStock =
      product.stockStatus === "Out of Stock" ||
      !product.inStock ||
      (product.stockQuantity !== undefined && product.stockQuantity <= 0);

    const availableStock = isProductOutOfStock
      ? 0
      : (product.stockQuantity ?? 50);

    // If completely out of stock, reject
    if (availableStock <= 0 || isProductOutOfStock) {
      state = {
        ...state,
        lastError: `"${product.name}" is currently out of stock.`,
      };
      emitChange();
      return {
        success: false,
        warning: true,
        message: `"${product.name}" is currently out of stock.`,
      };
    }

    const chosenVariant = variantName || product.dosageForm || product.packSize || "Standard";
    const existingIndex = state.items.findIndex(
      (item) => item.productId === product.id && item.variant === chosenVariant
    );

    let newItems = [...state.items];
    let warningMsg = "";

    if (existingIndex > -1) {
      const existing = newItems[existingIndex];
      const targetQty = existing.quantity + quantityToAdd;

      if (targetQty > availableStock) {
        newItems[existingIndex] = {
          ...existing,
          quantity: availableStock,
          stockQuantity: availableStock,
        };
        warningMsg = `Only ${availableStock} units available in stock. Maximum added.`;
      } else {
        newItems[existingIndex] = {
          ...existing,
          quantity: targetQty,
          stockQuantity: availableStock,
        };
      }
    } else {
      const safeQty = Math.min(quantityToAdd, availableStock);
      if (safeQty < quantityToAdd) {
        warningMsg = `Only ${availableStock} units available in stock. Added ${safeQty}.`;
      }

      const currentPrice = product.sellingPrice || product.price;
      const currentMrp = product.mrp || product.originalPrice || currentPrice;
      const currentDiscount = product.discount || product.discountPercent || (currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0);

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        variant: chosenVariant,
        price: currentPrice,
        originalPrice: currentMrp,
        mrp: currentMrp,
        discount: currentDiscount,
        quantity: safeQty,
        stockQuantity: availableStock,
        image: product.images?.[0] || product.image,
        prescriptionRequired: product.prescriptionRequired,
        selected: true,
      };
      newItems.push(newItem);
    }

    state = {
      ...state,
      items: newItems,
      lastError: warningMsg || null,
      syncStatus: "idle",
    };
    emitChange();

    return {
      success: true,
      warning: !!warningMsg,
      message: warningMsg || `Added ${product.name} to cart.`,
    };
  },

  /**
   * Updates an item quantity strictly bounded by stockQuantity.
   */
  updateQuantity(
    id: string,
    newQuantity: number
  ): { success: boolean; capped?: boolean; maxStock?: number } {
    if (newQuantity <= 0) {
      this.removeItem(id);
      return { success: true };
    }

    let capped = false;
    let maxStock = 999;

    state = {
      ...state,
      items: state.items.map((item) => {
        if (item.id === id) {
          const limit = item.stockQuantity && item.stockQuantity > 0 ? item.stockQuantity : 999;
          maxStock = limit;
          if (newQuantity > limit) {
            capped = true;
            return { ...item, quantity: limit };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
      syncStatus: "idle",
    };
    emitChange();

    return { success: true, capped, maxStock };
  },

  removeItem(id: string): void {
    state = {
      ...state,
      items: state.items.filter((item) => item.id !== id),
      syncStatus: "idle",
    };
    emitChange();
  },

  toggleItemSelection(id: string): void {
    state = {
      ...state,
      items: state.items.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      ),
    };
    emitChange();
  },

  selectAllItems(select: boolean): void {
    state = {
      ...state,
      items: state.items.map((item) => ({ ...item, selected: select })),
    };
    emitChange();
  },

  setDeliveryType(type: "standard" | "express"): void {
    state = { ...state, deliveryType: type };
    emitChange();
  },

  applyCoupon(code: string): { success: boolean; message: string } {
    const subtotal = state.items
      .filter((i) => i.selected)
      .reduce((sum, i) => sum + i.price * i.quantity, 0);

    const validation = cartService.validateCoupon(code, subtotal);
    if (!validation.valid || !validation.coupon) {
      state = { ...state, lastError: validation.error || "Invalid coupon" };
      emitChange();
      return { success: false, message: validation.error || "Invalid coupon" };
    }

    state = {
      ...state,
      appliedCoupon: validation.coupon,
      lastError: null,
    };
    emitChange();
    return {
      success: true,
      message: `Coupon "${validation.coupon.code}" applied successfully!`,
    };
  },

  removeCoupon(): void {
    state = { ...state, appliedCoupon: null };
    emitChange();
  },

  clearCart(): void {
    state = { ...state, items: [], appliedCoupon: null, syncStatus: "idle" };
    emitChange();
  },

  /**
   * Merges guest local cart items with user's stored account cart.
   * - Matches duplicate items by (productId + variant)
   * - Updates quantities up to available stock limit
   * - Maintains selected variants
   * - Retains non-duplicate items from both carts
   */
  mergeGuestCart(userCartItems: CartItem[] = []): void {
    const guestItems = [...state.items];
    const mergedMap = new Map<string, CartItem>();

    // Load user items if any exist
    for (const item of userCartItems) {
      const key = `${item.productId}___${item.variant || "Standard"}`;
      mergedMap.set(key, { ...item });
    }

    // Merge each guest item
    for (const guestItem of guestItems) {
      const key = `${guestItem.productId}___${guestItem.variant || "Standard"}`;
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key)!;
        const maxStock = existing.stockQuantity || guestItem.stockQuantity || 50;
        const combinedQty = Math.min(existing.quantity + guestItem.quantity, maxStock);
        mergedMap.set(key, {
          ...existing,
          quantity: combinedQty,
          variant: guestItem.variant || existing.variant,
          selected: true,
        });
      } else {
        mergedMap.set(key, { ...guestItem, selected: true });
      }
    }

    const mergedItems = Array.from(mergedMap.values());
    state = {
      ...state,
      items: mergedItems,
      syncStatus: "synced",
    };
    emitChange();
  },

  /**
   * Stub for future Express API synchronization without rewriting components.
   */
  async syncWithServer(): Promise<boolean> {
    state = { ...state, syncStatus: "syncing" };
    emitChange();

    return new Promise((resolve) => {
      setTimeout(() => {
        state = { ...state, syncStatus: "synced" };
        emitChange();
        resolve(true);
      }, 500);
    });
  },
};

export function useCartStore() {
  const snapshot = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    () => ({
      items: [],
      appliedCoupon: null,
      deliveryType: "standard" as const,
      syncStatus: "idle" as const,
      lastError: null,
    })
  );

  const totals = cartStore.getTotals();

  return {
    ...snapshot,
    totals,
    cartCount: totals.itemCount,
    addItem: cartStore.addItem.bind(cartStore),
    updateQuantity: cartStore.updateQuantity.bind(cartStore),
    removeItem: cartStore.removeItem.bind(cartStore),
    toggleItemSelection: cartStore.toggleItemSelection.bind(cartStore),
    selectAllItems: cartStore.selectAllItems.bind(cartStore),
    setDeliveryType: cartStore.setDeliveryType.bind(cartStore),
    applyCoupon: cartStore.applyCoupon.bind(cartStore),
    removeCoupon: cartStore.removeCoupon.bind(cartStore),
    clearCart: cartStore.clearCart.bind(cartStore),
    mergeGuestCart: cartStore.mergeGuestCart.bind(cartStore),
    syncWithServer: cartStore.syncWithServer.bind(cartStore),
  };
}
