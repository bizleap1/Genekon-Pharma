import { Request, Response } from "express";
import { productService } from "../services/productService";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const productController = {
  /**
   * GET /api/v1/products
   * Public filtered, paginated catalog
   */
  async getProducts(req: Request, res: Response) {
    try {
      const result = await productService.getProducts(req.query as any);
      return sendSuccess(res, result, "Products retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve products", 400);
    }
  },

  /**
   * GET /api/v1/products/:idOrSlug
   * Public single product details with related items
   */
  async getProductByIdOrSlug(req: Request, res: Response) {
    try {
      const idOrSlug = req.params.idOrSlug as string;
      const result = await productService.getProductByIdOrSlug(idOrSlug);
      if (!result) {
        return sendError(res, "Product not found", 404, "PRODUCT_NOT_FOUND");
      }
      return sendSuccess(res, result, "Product details retrieved");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve product", 400);
    }
  },

  /**
   * POST /api/v1/products
   * Admin: Create product
   */
  async createProduct(req: Request, res: Response) {
    try {
      const created = await productService.createProduct(req.body);
      return sendSuccess(res, created, "Product created successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create product", 400);
    }
  },

  /**
   * PUT /api/v1/products/:id
   * Admin: Update product
   */
  async updateProduct(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await productService.updateProduct(id, req.body);
      return sendSuccess(res, updated, "Product updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update product", 400);
    }
  },

  /**
   * DELETE /api/v1/products/:id
   * Admin: Soft delete product
   */
  async deleteProduct(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await productService.deleteProduct(id);
      return sendSuccess(res, result, result.message);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to delete product", 400);
    }
  },

  /**
   * POST /api/v1/products/:id/images
   * Admin: Upload gallery images via Cloudinary
   */
  async uploadImages(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return sendError(res, "No image files were provided for upload", 400);
      }

      const uploaded = await productService.uploadProductImages(id, files);
      return sendSuccess(res, uploaded, "Images uploaded successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to upload images", 400);
    }
  },

  /**
   * DELETE /api/v1/products/images/:imageId
   * Admin: Delete product image
   */
  async deleteImage(req: Request, res: Response) {
    try {
      const imageId = req.params.imageId as string;
      const result = await productService.deleteProductImage(imageId);
      return sendSuccess(res, result, result.message);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to delete image", 400);
    }
  },
};
