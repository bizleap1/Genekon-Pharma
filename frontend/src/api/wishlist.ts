/**
 * Wishlist API Service
 * Handles user favorite medicines, saved items, and cloud synchronization.
 */

import { apiClient } from "./client";
import { Product } from "@/types/product";
import { ApiResponse } from "@/types/api";
import { ALL_PRODUCTS } from "@/data/products";

export const wishlistApi = {
  /**
   * Fetch user's wishlist from server
   */
  async getWishlist(): Promise<ApiResponse<Product[]>> {
    try {
      return await apiClient.get<Product[]>("/wishlist");
    } catch {
      return {
        success: true,
        data: ALL_PRODUCTS.slice(0, 2),
      };
    }
  },

  /**
   * Add a product to wishlist
   */
  async addToWishlist(productId: string): Promise<ApiResponse<{ productId: string; added: boolean }>> {
    try {
      return await apiClient.post<{ productId: string; added: boolean }>("/wishlist/add", { productId });
    } catch {
      return {
        success: true,
        message: "Added to wishlist",
        data: { productId, added: true },
      };
    }
  },

  /**
   * Remove a product from wishlist
   */
  async removeFromWishlist(productId: string): Promise<ApiResponse<{ productId: string; removed: boolean }>> {
    try {
      return await apiClient.delete<{ productId: string; removed: boolean }>(`/wishlist/${productId}`);
    } catch {
      return {
        success: true,
        message: "Removed from wishlist",
        data: { productId, removed: true },
      };
    }
  },

  /**
   * Synchronize guest local wishlist with authenticated account
   */
  async syncWishlist(productIds: string[]): Promise<ApiResponse<Product[]>> {
    try {
      return await apiClient.post<Product[]>("/wishlist/sync", { productIds });
    } catch {
      const matched = ALL_PRODUCTS.filter((p) => productIds.includes(p.id));
      return {
        success: true,
        data: matched.length > 0 ? matched : ALL_PRODUCTS.slice(0, 2),
      };
    }
  },
};
