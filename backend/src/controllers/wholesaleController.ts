import { Request, Response } from "express";
import { wholesaleService } from "../services/wholesaleService";
import { productService } from "../services/productService";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const wholesaleController = {
  /**
   * 1. Submit Wholesale Partner Registration / Application
   */
  async applyForWholesale(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const application = await wholesaleService.registerPartner(userId, req.body);
      return sendSuccess(
        res,
        application,
        "Wholesale partner application submitted successfully. Verification takes 24-48 hours.",
        201
      );
    } catch (err: any) {
      return sendError(res, err.message || "Failed to submit wholesale application", 400);
    }
  },

  /**
   * 2. Check My Wholesale Application Status
   */
  async getMyApplicationStatus(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const profile = await wholesaleService.getProfileByUserId(userId);
      return sendSuccess(
        res,
        {
          hasApplied: !!profile,
          profile: profile || null,
          role: req.user!.role,
        },
        "Wholesale status retrieved successfully"
      );
    } catch (err: any) {
      return sendError(res, err.message || "Failed to retrieve wholesale status", 400);
    }
  },

  /**
   * 3. Get Wholesale Tiered Pricing Catalog (For WHOLESALE_PARTNER only)
   */
  async getWholesaleCatalog(req: Request, res: Response) {
    try {
      const result = await productService.getProducts({
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
      });

      // Compute wholesale tiered pricing (25% discount off retail selling price for B2B partners, min order qty 10)
      const wholesaleProducts = result.products.map((p) => {
        const retailPrice = Number(p.sellingPrice);
        const wholesalePrice = (retailPrice * 0.75).toFixed(2);
        return {
          ...p,
          wholesalePrice,
          minOrderQuantity: 10,
          caseQuantity: 50,
          wholesaleMarginPercent: 25,
        };
      });

      return sendSuccess(
        res,
        {
          products: wholesaleProducts,
          pagination: result.pagination,
        },
        "Wholesale catalog retrieved successfully"
      );
    } catch (err: any) {
      return sendError(res, err.message || "Failed to retrieve wholesale catalog", 400);
    }
  },
};
