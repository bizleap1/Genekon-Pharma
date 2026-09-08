/**
 * Cart API Service
 * Communicates with backend /cart endpoints for server-synchronized cart states.
 */

import { apiClient } from "./client";
import { ApiResponse } from "@/types/api";

export interface BackendCartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: string | number;
  product?: {
    id: string;
    name: string;
    brand: string;
    sellingPrice: string | number;
    mrp: string | number;
    discount?: string | number;
    images?: Array<{ imageUrl: string }>;
    prescriptionRequired?: boolean;
    stockQuantity?: number;
    dosageForm?: string;
  };
}

export interface BackendCart {
  id: string;
  userId: string;
  items: BackendCartItem[];
  itemCount: number;
  subtotal: number;
  totalAmount: number;
  hasPrescriptionProducts: boolean;
}

export const cartApi = {
  /**
   * Fetch active server cart
   */
  async getCart(): Promise<ApiResponse<BackendCart>> {
    return await apiClient.get<BackendCart>("/cart");
  },

  /**
   * Add item to server cart
   */
  async addItem(
    productId: string,
    quantity: number = 1
  ): Promise<ApiResponse<{ cart: BackendCart; prescriptionNotice?: string }>> {
    return await apiClient.post<{ cart: BackendCart; prescriptionNotice?: string }>(
      "/cart/items",
      { productId, quantity }
    );
  },

  /**
   * Update item quantity in server cart
   */
  async updateItem(
    itemId: string,
    quantity: number
  ): Promise<ApiResponse<{ cart: BackendCart }>> {
    return await apiClient.put<{ cart: BackendCart }>(`/cart/items/${itemId}`, {
      quantity,
    });
  },

  /**
   * Remove item from server cart
   */
  async removeItem(itemId: string): Promise<ApiResponse<{ cart: BackendCart }>> {
    return await apiClient.delete<{ cart: BackendCart }>(`/cart/items/${itemId}`);
  },

  /**
   * Clear all items in server cart
   */
  async clearCart(): Promise<ApiResponse<{ cleared: boolean }>> {
    return await apiClient.delete<{ cleared: boolean }>("/cart");
  },

  /**
   * Merge guest items into server cart
   */
  async mergeCart(
    items: Array<{ productId: string; quantity: number }>
  ): Promise<ApiResponse<{ cart: BackendCart; mergedCount: number }>> {
    return await apiClient.post<{ cart: BackendCart; mergedCount: number }>(
      "/cart/merge",
      { items }
    );
  },

  /**
   * Apply promotional coupon to server cart
   */
  async applyCoupon(code: string): Promise<ApiResponse<{
    coupon: { code: string; discountAmount: number; discountType: string };
    subtotal: number;
    discountAmount: number;
    deliveryCost: number;
    totalAmount: number;
  }>> {
    return await apiClient.post("/cart/apply-coupon", { code });
  },
};
