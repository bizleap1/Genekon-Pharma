import { Router } from "express";
import { wishlistController } from "../controllers/wishlistController";
import { authenticateUser } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { addToWishlistSchema, syncWishlistSchema } from "../validators/wishlistValidation";

const router = Router();

// All wishlist endpoints require user authentication
router.use(authenticateUser);

// Wishlist management endpoints
router.get("/", wishlistController.getWishlist);
router.post("/", validateRequest(addToWishlistSchema), wishlistController.addItem);
router.post("/add", validateRequest(addToWishlistSchema), wishlistController.addItem);
router.delete("/:productId", wishlistController.removeItem);
router.post("/:productId/move-to-cart", wishlistController.moveToCart);
router.post("/sync", validateRequest(syncWishlistSchema), wishlistController.syncWishlist);

export default router;
