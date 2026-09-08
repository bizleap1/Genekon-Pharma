import { Request, Response } from "express";
import { wishlistService } from "../services/wishlistService";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const wishlistController = {
  /**
   * GET /api/v1/wishlist
   * Get all wishlisted products for the current user
   */
  async getWishlist(req: Request, res: Response) {
    try {
      const items = await wishlistService.getWishlist(req.user!.id);
      return sendSuccess(res, items, "Wishlist retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve wishlist", 400);
    }
  },

  /**
   * POST /api/v1/wishlist and POST /api/v1/wishlist/add
   * Add a product to wishlist
   */
  async addItem(req: Request, res: Response) {
    try {
      const { productId } = req.body;
      const result = await wishlistService.addToWishlist(req.user!.id, productId);
      return sendSuccess(
        res,
        result.item,
        result.message,
        result.alreadyExists ? 200 : 201
      );
    } catch (error: any) {
      return sendError(res, error.message || "Failed to add to wishlist", 400);
    }
  },

  /**
   * DELETE /api/v1/wishlist/:productId
   * Remove a product from wishlist
   */
  async removeItem(req: Request, res: Response) {
    try {
      const productId = req.params.productId as string;
      const result = await wishlistService.removeFromWishlist(req.user!.id, productId);
      return sendSuccess(res, result, result.message);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to remove from wishlist", 400);
    }
  },

  /**
   * POST /api/v1/wishlist/:productId/move-to-cart
   * Move item from wishlist directly into cart
   */
  async moveToCart(req: Request, res: Response) {
    try {
      const productId = req.params.productId as string;
      const result = await wishlistService.moveToCart(req.user!.id, productId);
      return sendSuccess(res, result, result.message);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to move item to cart", 400);
    }
  },

  /**
   * POST /api/v1/wishlist/sync
   * Batch synchronize guest wishlist
   */
  async syncWishlist(req: Request, res: Response) {
    try {
      const { productIds } = req.body;
      const items = await wishlistService.syncWishlist(req.user!.id, productIds);
      return sendSuccess(res, items, "Wishlist synchronized successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to sync wishlist", 400);
    }
  },
};
