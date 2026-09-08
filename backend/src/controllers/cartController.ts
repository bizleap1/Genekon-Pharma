import { Request, Response } from "express";
import { cartService } from "../services/cartService";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const cartController = {
  /**
   * GET /api/v1/cart
   * Get or initialize current user's cart
   */
  async getCart(req: Request, res: Response) {
    try {
      const cart = await cartService.getOrCreateCart(req.user!.id);
      return sendSuccess(res, cart, "Cart retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve cart", 400);
    }
  },

  /**
   * POST /api/v1/cart/items
   * Add a product to the cart
   */
  async addItem(req: Request, res: Response) {
    try {
      const result = await cartService.addItemToCart(req.user!.id, req.body);
      const message = result.prescriptionNotice || "Item added to cart successfully";
      return sendSuccess(res, result, message, 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to add item to cart", 400);
    }
  },

  /**
   * PUT /api/v1/cart/items/:itemId
   * Update item quantity in the cart
   */
  async updateItem(req: Request, res: Response) {
    try {
      const itemId = req.params.itemId as string;
      const { quantity } = req.body;
      const updatedCart = await cartService.updateCartItem(req.user!.id, itemId, quantity);
      return sendSuccess(res, updatedCart, "Cart item updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update cart item", 400);
    }
  },

  /**
   * DELETE /api/v1/cart/items/:itemId
   * Remove item from cart
   */
  async removeItem(req: Request, res: Response) {
    try {
      const itemId = req.params.itemId as string;
      const updatedCart = await cartService.removeCartItem(req.user!.id, itemId);
      return sendSuccess(res, updatedCart, "Item removed from cart");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to remove item from cart", 400);
    }
  },

  /**
   * DELETE /api/v1/cart
   * Clear all items in cart
   */
  async clearCart(req: Request, res: Response) {
    try {
      const clearedCart = await cartService.clearCart(req.user!.id);
      return sendSuccess(res, clearedCart, "Cart cleared successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to clear cart", 400);
    }
  },

  /**
   * POST /api/v1/cart/merge
   * Merge guest local cart into user's authenticated cart
   */
  async mergeCart(req: Request, res: Response) {
    try {
      const mergedCart = await cartService.mergeGuestCart(req.user!.id, req.body.items);
      return sendSuccess(res, mergedCart, "Guest cart merged successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to merge cart", 400);
    }
  },
};
