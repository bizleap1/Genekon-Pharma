import { Request, Response } from "express";
import { categoryService } from "../services/categoryService";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const categoryController = {
  /**
   * GET /api/v1/categories
   * Public category tree listing
   */
  async getCategories(_req: Request, res: Response) {
    try {
      const tree = await categoryService.getCategoryTree();
      return sendSuccess(res, tree, "Categories retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve categories", 400);
    }
  },

  /**
   * GET /api/v1/categories/:slug
   * Public single category by slug
   */
  async getCategoryBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const category = await categoryService.getCategoryBySlug(slug);
      if (!category) {
        return sendError(res, "Category not found", 404, "CATEGORY_NOT_FOUND");
      }
      return sendSuccess(res, category, "Category retrieved successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to retrieve category", 400);
    }
  },

  /**
   * POST /api/v1/categories
   * Admin: Create category
   */
  async createCategory(req: Request, res: Response) {
    try {
      const created = await categoryService.createCategory(req.body);
      return sendSuccess(res, created, "Category created successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create category", 400);
    }
  },

  /**
   * PUT /api/v1/categories/:id
   * Admin: Update category
   */
  async updateCategory(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await categoryService.updateCategory(id, req.body);
      return sendSuccess(res, updated, "Category updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update category", 400);
    }
  },

  /**
   * DELETE /api/v1/categories/:id
   * Admin: Delete category
   */
  async deleteCategory(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await categoryService.deleteCategory(id);
      return sendSuccess(res, result, result.message);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to delete category", 400);
    }
  },
};
