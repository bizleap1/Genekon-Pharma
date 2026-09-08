import { Router } from "express";
import { wholesaleController } from "../controllers/wholesaleController";
import { authenticateUser, authorizeRole } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { registerWholesaleSchema } from "../validators/adminValidator";

const router = Router();

// All wholesale routes require user authentication
router.use(authenticateUser);

// User applies for B2B wholesale access
router.post(
  "/apply",
  validateRequest(registerWholesaleSchema),
  wholesaleController.applyForWholesale
);

// User checks their wholesale application review status
router.get("/status", wholesaleController.getMyApplicationStatus);

// Verified Wholesale Partners view B2B bulk tiered pricing
router.get(
  "/catalog",
  authorizeRole("WHOLESALE_PARTNER"),
  wholesaleController.getWholesaleCatalog
);

export default router;
