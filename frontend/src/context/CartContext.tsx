"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { CartItem, CartTotals, CouponCode } from "@/types/cart";
import { cartService } from "@/services/cartService";

interface CartContextType {
  items: CartItem[];
  totals: CartTotals;
  appliedCoupon: CouponCode | null;
  deliveryType: "standard" | "express";
  setDeliveryType: (type: "standard" | "express") => void;
  addToCart: (
    product: {
      id: string;
      name: string;
      brand: string;
      price: number;
      originalPrice?: number;
      mrp?: number;
      discount?: number;
      discountPercent?: number;
      image?: string;
      images?: string[];
      dosageForm?: string;
      packSize?: string;
      prescriptionRequired?: boolean;
      stockQuantity?: number;
      inStock?: boolean;
    },
    quantity?: number,
    variant?: string
  ) => { success: boolean; message: string };
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => { success: boolean; capped?: boolean; maxStock?: number };
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: (selected: boolean) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
  toastMessage: string | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [deliveryType, setDeliveryType] = useState<"standard" | "express">("standard");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from storage on mount
  useEffect(() => {
    const stored = cartService.getStoredItems();
    setItems(stored);
    setIsInitialized(true);
  }, []);

  // Save to storage whenever items change after mount
  useEffect(() => {
    if (isInitialized) {
      cartService.saveItems(items);
    }
  }, [items, isInitialized]);

  // Compute live totals
  const totals = useMemo(() => {
    return cartService.calculateTotals(items, appliedCoupon, deliveryType);
  }, [items, appliedCoupon, deliveryType]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const dismissToast = () => setToastMessage(null);

  const addToCart = (
    product: {
      id: string;
      name: string;
      brand: string;
      price: number;
      originalPrice?: number;
      mrp?: number;
      discount?: number;
      discountPercent?: number;
      image?: string;
      images?: string[];
      dosageForm?: string;
      packSize?: string;
      prescriptionRequired?: boolean;
      stockQuantity?: number;
      inStock?: boolean;
    },
    quantity: number = 1,
    variant?: string
  ): { success: boolean; message: string } => {
    const availableStock = product.stockQuantity !== undefined ? product.stockQuantity : (product.inStock !== false ? 99 : 0);

    // Stock check
    if (availableStock <= 0 || product.inStock === false) {
      const msg = `"${product.name}" is currently out of stock.`;
      showToast(msg);
      return { success: false, message: msg };
    }

    const itemVariant = variant || product.dosageForm || product.packSize || "Standard";
    let warningMsg = "";

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === product.id && i.variant === itemVariant
      );

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const targetQty = existing.quantity + quantity;

        if (targetQty > availableStock) {
          warningMsg = `Only ${availableStock} units available in stock. Maximum added.`;
          const updated = [...prev];
          updated[existingIndex] = {
            ...existing,
            quantity: availableStock,
            stockQuantity: availableStock,
            selected: true,
          };
          showToast(warningMsg);
          return updated;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: targetQty,
          stockQuantity: availableStock,
          selected: true,
        };
        showToast(`Updated "${product.name}" quantity (${targetQty}) in cart`);
        return updated;
      }

      const safeQty = Math.min(quantity, availableStock);
      if (safeQty < quantity) {
        warningMsg = `Only ${availableStock} units available. Added ${safeQty}.`;
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        variant: itemVariant,
        price: product.price,
        originalPrice: product.mrp || product.originalPrice || Math.round(product.price * 1.18),
        mrp: product.mrp || product.originalPrice || Math.round(product.price * 1.18),
        discount: product.discount || product.discountPercent || 15,
        quantity: safeQty,
        stockQuantity: availableStock,
        image: product.images?.[0] || product.image || "/images/products/cipla-paracetamol-v2.jpg",
        prescriptionRequired: product.prescriptionRequired || false,
        selected: true,
      };

      showToast(warningMsg || `Added "${product.name}" to cart`);
      return [newItem, ...prev];
    });

    return {
      success: true,
      message: warningMsg || `Added ${product.name} to cart`,
    };
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === itemId);
      if (target) {
        showToast(`Removed "${target.name}" from cart`);
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  const updateQuantity = (
    itemId: string,
    quantity: number
  ): { success: boolean; capped?: boolean; maxStock?: number } => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return { success: true };
    }

    let capped = false;
    let maxLimit = 999;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const limit = item.stockQuantity && item.stockQuantity > 0 ? item.stockQuantity : 999;
          maxLimit = limit;
          if (quantity > limit) {
            capped = true;
            showToast(`Only ${limit} units available in stock`);
            return { ...item, quantity: limit };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );

    return { success: true, capped, maxStock: maxLimit };
  };

  const toggleItemSelection = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectAllItems = (selected: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected })));
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const res = cartService.validateCoupon(code, totals.subtotal);
    if (!res.valid || !res.coupon) {
      return { success: false, message: res.error || "Invalid coupon code." };
    }

    setAppliedCoupon(res.coupon);
    showToast(`Coupon "${res.coupon.code}" applied! Saved on order.`);
    return {
      success: true,
      message: `Coupon "${res.coupon.code}" successfully applied!`,
    };
  };

  const removeCoupon = () => {
    if (appliedCoupon) {
      showToast(`Coupon "${appliedCoupon.code}" removed.`);
    }
    setAppliedCoupon(null);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totals,
        appliedCoupon,
        deliveryType,
        setDeliveryType,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleItemSelection,
        selectAllItems,
        applyCoupon,
        removeCoupon,
        clearCart,
        toastMessage,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
