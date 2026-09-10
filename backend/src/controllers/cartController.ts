import { Request, Response } from "express";
import { cartService } from "../services/cartService";
import { couponService } from "../services/couponService";
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

  /**
   * POST /api/v1/cart/sync
   * Authoritative cart synchronization (sets exact cart contents)
   */
  async syncCart(req: Request, res: Response) {
    try {
      const syncedCart = await cartService.syncCart(req.user!.id, req.body.items || []);
      return sendSuccess(res, syncedCart, "Cart synchronized successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to synchronize cart", 400);
    }
  },

  /**
   * POST /api/v1/cart/apply-coupon
   * Validate and calculate discount for coupon on active cart
   */
  async applyCoupon(req: Request, res: Response) {
    try {
      const { code } = req.body;
      if (!code || typeof code !== "string" || !code.trim()) {
        return sendError(res, "Coupon code is required", 400);
      }

      // 1. Fetch current cart to get authoritative total
      const cart = await cartService.getOrCreateCart(req.user!.id);
      if (!cart || cart.items.length === 0) {
        return sendError(res, "Your cart is empty. Add medicines before applying a coupon.", 400);
      }

      // 2. Validate coupon
      const validation = await couponService.validateCoupon(code, cart.totals.subtotal);

      // 3. Recalculate totals
      const discount = validation.discountAmount;
      const subtotal = cart.totals.subtotal;
      const deliveryCost = subtotal - discount >= cart.totals.freeDeliveryThreshold ? 0 : 40;
      const totalAmount = Math.max(0, subtotal - discount + deliveryCost);

      return sendSuccess(
        res,
        {
          coupon: {
            code: validation.code,
            discountAmount: discount,
            discountType: validation.discountType,
          },
          subtotal,
          discountAmount: discount,
          deliveryCost,
          totalAmount,
        },
        `Coupon '${validation.code}' applied successfully! You saved ₹${discount}.`
      );
    } catch (error: any) {
      return sendError(res, error.message || "Failed to apply coupon", 400);
    }
  },
};
