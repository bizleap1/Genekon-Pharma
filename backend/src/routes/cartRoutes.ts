import { Router } from "express";
import { cartController } from "../controllers/cartController";
import { authenticateUser } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import {
  addToCartSchema,
  updateCartItemSchema,
  mergeCartSchema,
  syncCartSchema,
} from "../validators/cartValidation";

const router = Router();

// All cart endpoints require user authentication
router.use(authenticateUser);

// Cart management endpoints
router.get("/", cartController.getCart);
router.post("/items", validateRequest(addToCartSchema), cartController.addItem);
router.put("/items/:itemId", validateRequest(updateCartItemSchema), cartController.updateItem);
router.patch("/items/:itemId", validateRequest(updateCartItemSchema), cartController.updateItem);
router.delete("/items/:itemId", cartController.removeItem);
router.delete("/", cartController.clearCart);
router.post("/merge", validateRequest(mergeCartSchema), cartController.mergeCart);
router.post("/sync", validateRequest(syncCartSchema), cartController.syncCart);

// Coupon application endpoints
router.post("/apply-coupon", cartController.applyCoupon);
router.post("/coupon", cartController.applyCoupon);

export default router;
