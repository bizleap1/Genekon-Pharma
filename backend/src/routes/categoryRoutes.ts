import { Router } from "express";
import { categoryController } from "../controllers/categoryController";
import { authenticateUser, authorizeRole } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { createCategorySchema, updateCategorySchema } from "../validators/categoryValidation";

const router = Router();

// Public Category Endpoints
router.get("/", categoryController.getCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

// Admin Category Management Endpoints
router.post(
  "/",
  authenticateUser,
  authorizeRole("ADMIN"),
  validateRequest(createCategorySchema),
  categoryController.createCategory
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRole("ADMIN"),
  validateRequest(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole("ADMIN"),
  categoryController.deleteCategory
);

export default router;
