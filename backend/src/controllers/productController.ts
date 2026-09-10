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
   * GET /api/v1/products/featured
   * Public featured products list
   */
  async getFeaturedProducts(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
      const result = await productService.getProducts({
        sort: "popularity",
        limit,
      });
      return sendSuccess(res, result, "Featured products retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve featured products", 400);
    }
  },

  /**
   * GET /api/v1/products/search
   * Search catalog products
   */
  async searchProducts(req: Request, res: Response) {
    try {
      const q = (req.query.q || req.query.query || req.query.search || "") as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await productService.getProducts({
        search: q,
        page,
        limit,
      });
      return sendSuccess(res, result, "Search results retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to search products", 400);
    }
  },

  /**
   * GET /api/v1/products/category/:category
   * Public products by category slug
   */
  async getProductsByCategory(req: Request, res: Response) {
    try {
      const category = (req.params.category || req.query.category || req.query.slug || "") as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await productService.getProducts({
        categorySlug: category,
        page,
        limit,
      });
      return sendSuccess(res, result, `Products for category '${category}' retrieved successfully`);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve products by category", 400);
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
