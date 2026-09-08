"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types/product";
import { POPULAR_PRODUCTS } from "@/data/products";

const WISHLIST_STORAGE_KEY = "genekon_wishlist_v1";

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize wishlist from localStorage or pre-fill with 2 default favorites
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      } else {
        const initial = POPULAR_PRODUCTS.slice(0, 2);
        setWishlist(initial);
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(initial));
      }
    } catch {
      setWishlist(POPULAR_PRODUCTS.slice(0, 2));
    }
    setIsInitialized(true);
  }, []);

  // Save to storage on change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
      } catch (e) {
        console.error("Failed to save wishlist", e);
      }
    }
  }, [wishlist, isInitialized]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [product, ...prev];
      }
    });
  };

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [product, ...prev];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
