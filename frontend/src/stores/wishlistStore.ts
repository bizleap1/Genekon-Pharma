"use client";

import { useSyncExternalStore } from "react";
import { Product } from "@/types/product";
import { ALL_PRODUCTS } from "@/data/products";

interface WishlistState {
  items: Product[];
}

const WISHLIST_STORE_STORAGE_KEY = "genekon_wishlist_v1";

function getInitialState(): WishlistState {
  if (typeof window === "undefined") {
    return { items: [ALL_PRODUCTS[0], ALL_PRODUCTS[1]] };
  }
  try {
    const saved = localStorage.getItem(WISHLIST_STORE_STORAGE_KEY);
    if (saved) {
      return { items: JSON.parse(saved) };
    }
  } catch {
    // fallback
  }
  return { items: [ALL_PRODUCTS[0], ALL_PRODUCTS[1]] };
}

let state: WishlistState = getInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        WISHLIST_STORE_STORAGE_KEY,
        JSON.stringify(state.items)
      );
    } catch (err) {
      console.error("Failed to persist wishlistStore", err);
    }
  }
  listeners.forEach((listener) => listener());
}

export const wishlistStore = {
  getSnapshot(): WishlistState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  isInWishlist(productId: string): boolean {
    return state.items.some((item) => item.id === productId);
  },

  toggleWishlist(product: Product): boolean {
    const exists = state.items.some((item) => item.id === product.id);
    if (exists) {
      state = {
        ...state,
        items: state.items.filter((item) => item.id !== product.id),
      };
      emitChange();
      return false;
    } else {
      state = {
        ...state,
        items: [product, ...state.items],
      };
      emitChange();
      return true;
    }
  },

  removeFromWishlist(productId: string): void {
    state = {
      ...state,
      items: state.items.filter((item) => item.id !== productId),
    };
    emitChange();
  },

  clearWishlist(): void {
    state = { ...state, items: [] };
    emitChange();
  },
};

const SERVER_WISHLIST_SNAPSHOT = { items: [] };
const getWishlistServerSnapshot = () => SERVER_WISHLIST_SNAPSHOT;

export function useWishlistStore() {
  const snapshot = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    getWishlistServerSnapshot
  );

  return {
    items: snapshot.items,
    wishlistCount: snapshot.items.length,
    isInWishlist: wishlistStore.isInWishlist.bind(wishlistStore),
    toggleWishlist: wishlistStore.toggleWishlist.bind(wishlistStore),
    removeFromWishlist: wishlistStore.removeFromWishlist.bind(wishlistStore),
    clearWishlist: wishlistStore.clearWishlist.bind(wishlistStore),
  };
}
