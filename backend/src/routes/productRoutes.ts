import { Router } from "express";
import { productController } from "../controllers/productController";
import { authenticateUser, authorizeRole } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { upload } from "../middleware/upload";
import { createProductSchema, updateProductSchema } from "../validators/productValidation";

const router = Router();

// Public Catalog Endpoints
router.get("/", productController.getProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/search", productController.searchProducts);
router.get("/category", productController.getProductsByCategory);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/:idOrSlug", productController.getProductByIdOrSlug);

// Admin Product Management Endpoints
router.post(
  "/",
  authenticateUser,
  authorizeRole("ADMIN"),
  validateRequest(createProductSchema),
  productController.createProduct
);

router.put(
  "/:id",
  authenticateUser,
  authorizeRole("ADMIN"),
  validateRequest(updateProductSchema),
  productController.updateProduct
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeRole("ADMIN"),
  productController.deleteProduct
);

// Admin Image Upload & Deletion Endpoints
router.post(
  "/:id/images",
  authenticateUser,
  authorizeRole("ADMIN"),
  upload.array("images", 5),
  productController.uploadImages
);

router.delete(
  "/images/:imageId",
  authenticateUser,
  authorizeRole("ADMIN"),
  productController.deleteImage
);

export default router;
