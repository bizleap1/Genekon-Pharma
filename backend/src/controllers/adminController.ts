import { Request, Response } from "express";
import { adminDashboardService } from "../services/adminDashboardService";
import { inventoryService } from "../services/inventoryService";
import { adminCustomerService } from "../services/adminCustomerService";
import { wholesaleService } from "../services/wholesaleService";
import { couponService } from "../services/couponService";
import { cmsService } from "../services/cmsService";
import { reportingService } from "../services/reportingService";
import { activityLogService } from "../services/activityLogService";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export const adminController = {
  // ================= 1. DASHBOARD =================
  async getDashboardStats(_req: Request, res: Response) {
    try {
      const stats = await adminDashboardService.getDashboardStats();
      return sendSuccess(res, stats, "Dashboard statistics retrieved successfully");
    } catch (err: any) {
      logger.error("Error retrieving dashboard stats:", err);
      return sendError(res, err.message || "Failed to retrieve dashboard stats", 500);
    }
  },

  // ================= 2. INVENTORY MANAGEMENT =================
  async getInventory(req: Request, res: Response) {
    try {
      const result = await inventoryService.getInventory(req.query as any);
      return sendSuccess(res, result, "Inventory list retrieved successfully");
    } catch (err: any) {
      logger.error("Error retrieving inventory:", err);
      return sendError(res, err.message || "Failed to retrieve inventory", 400);
    }
  },

  async createBatch(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const batch = await inventoryService.createBatch(adminId, req.body);
      return sendSuccess(res, batch, "Medication batch created successfully", 201);
    } catch (err: any) {
      logger.error("Error creating batch:", err);
      return sendError(res, err.message || "Failed to create medication batch", 400);
    }
  },

  async adjustStock(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const result = await inventoryService.adjustStock(adminId, req.body);
      return sendSuccess(res, result, "Physical stock adjusted successfully");
    } catch (err: any) {
      logger.error("Error adjusting stock:", err);
      return sendError(res, err.message || "Failed to adjust stock", 400);
    }
  },

  async getExpiringProducts(req: Request, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const result = await inventoryService.getExpiringProducts(days);
      return sendSuccess(res, result, `Products expiring within ${days} days retrieved`);
    } catch (err: any) {
      logger.error("Error retrieving expiring products:", err);
      return sendError(res, err.message || "Failed to retrieve expiring products", 400);
    }
  },

  async getLowStockAlerts(req: Request, res: Response) {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string, 10) : 20;
      const result = await inventoryService.getLowStockAlerts(threshold);
      return sendSuccess(res, result, "Low stock alerts retrieved");
    } catch (err: any) {
      logger.error("Error retrieving low stock alerts:", err);
      return sendError(res, err.message || "Failed to retrieve low stock alerts", 400);
    }
  },

  async getInventoryLogs(req: Request, res: Response) {
    try {
      const result = await inventoryService.getInventoryLogs(req.query as any);
      return sendSuccess(res, result, "Inventory audit logs retrieved");
    } catch (err: any) {
      logger.error("Error retrieving inventory logs:", err);
      return sendError(res, err.message || "Failed to retrieve inventory logs", 400);
    }
  },

  // ================= 3. CUSTOMER MANAGEMENT =================
  async listCustomers(req: Request, res: Response) {
    try {
      const result = await adminCustomerService.listCustomers(req.query as any);
      return sendSuccess(res, result, "Customers list retrieved successfully");
    } catch (err: any) {
      logger.error("Error listing customers:", err);
      return sendError(res, err.message || "Failed to list customers", 400);
    }
  },

  async getCustomerDetails(req: Request, res: Response) {
    try {
      const userId = req.params.id as string;
      const result = await adminCustomerService.getCustomerDetails(userId);
      return sendSuccess(res, result, "Customer details retrieved successfully");
    } catch (err: any) {
      logger.error("Error retrieving customer details:", err);
      return sendError(res, err.message || "Failed to retrieve customer details", 400);
    }
  },

  async toggleUserBlock(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const userId = req.params.id as string;
      const { isBlocked, reason } = req.body;
      const result = await adminCustomerService.toggleUserBlock(adminId, userId, isBlocked, reason);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      logger.error("Error toggling user block:", err);
      return sendError(res, err.message || "Failed to update user block status", 400);
    }
  },

  // ================= 4. WHOLESALE MANAGEMENT =================
  async listWholesaleApplications(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const result = await wholesaleService.listApplications(status);
      return sendSuccess(res, result, "Wholesale applications retrieved successfully");
    } catch (err: any) {
      logger.error("Error listing wholesale applications:", err);
      return sendError(res, err.message || "Failed to list wholesale applications", 400);
    }
  },

  async reviewWholesaleApplication(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const applicationId = req.params.id as string;
      const result = await wholesaleService.reviewApplication(adminId, applicationId, req.body);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      logger.error("Error reviewing wholesale application:", err);
      return sendError(res, err.message || "Failed to review wholesale application", 400);
    }
  },

  async listWholesalePartners(_req: Request, res: Response) {
    try {
      const result = await wholesaleService.listPartners();
      return sendSuccess(res, result, "Wholesale partners retrieved successfully");
    } catch (err: any) {
      logger.error("Error listing wholesale partners:", err);
      return sendError(res, err.message || "Failed to list wholesale partners", 400);
    }
  },

  // ================= 5. COUPON MANAGEMENT =================
  async listCoupons(_req: Request, res: Response) {
    try {
      const result = await couponService.listCoupons();
      return sendSuccess(res, result, "Coupons retrieved successfully");
    } catch (err: any) {
      logger.error("Error listing coupons:", err);
      return sendError(res, err.message || "Failed to list coupons", 400);
    }
  },

  async createCoupon(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const result = await couponService.createCoupon(adminId, req.body);
      return sendSuccess(res, result, "Coupon created successfully", 201);
    } catch (err: any) {
      logger.error("Error creating coupon:", err);
      return sendError(res, err.message || "Failed to create coupon", 400);
    }
  },

  async updateCoupon(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const id = req.params.id as string;
      const result = await couponService.updateCoupon(adminId, id, req.body);
      return sendSuccess(res, result, "Coupon updated successfully");
    } catch (err: any) {
      logger.error("Error updating coupon:", err);
      return sendError(res, err.message || "Failed to update coupon", 400);
    }
  },

  async toggleCouponStatus(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const id = req.params.id as string;
      const { isActive } = req.body;
      const result = await couponService.toggleCouponStatus(adminId, id, isActive);
      return sendSuccess(res, result, `Coupon ${isActive ? "activated" : "deactivated"} successfully`);
    } catch (err: any) {
      logger.error("Error toggling coupon status:", err);
      return sendError(res, err.message || "Failed to update coupon status", 400);
    }
  },

  async deleteCoupon(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const id = req.params.id as string;
      const result = await couponService.deleteCoupon(adminId, id);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      logger.error("Error deleting coupon:", err);
      return sendError(res, err.message || "Failed to delete coupon", 400);
    }
  },

  // ================= 6. CMS BANNERS =================
  async listBanners(req: Request, res: Response) {
    try {
      const isAdmin = (req as any).user?.role === "ADMIN";
      const section = req.query.section as string;
      const result = await cmsService.listBanners(isAdmin, section);
      return sendSuccess(res, result, "Banners retrieved successfully");
    } catch (err: any) {
      logger.error("Error listing banners:", err);
      return sendError(res, err.message || "Failed to list banners", 400);
    }
  },

  async createBanner(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const result = await cmsService.createBanner(adminId, req.body);
      return sendSuccess(res, result, "Banner created successfully", 201);
    } catch (err: any) {
      logger.error("Error creating banner:", err);
      return sendError(res, err.message || "Failed to create banner", 400);
    }
  },

  async updateBanner(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const id = req.params.id as string;
      const result = await cmsService.updateBanner(adminId, id, req.body);
      return sendSuccess(res, result, "Banner updated successfully");
    } catch (err: any) {
      logger.error("Error updating banner:", err);
      return sendError(res, err.message || "Failed to update banner", 400);
    }
  },

  async toggleBannerStatus(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const id = req.params.id as string;
      const { isActive } = req.body;
      const result = await cmsService.toggleBannerStatus(adminId, id, isActive);
      return sendSuccess(res, result, `Banner ${isActive ? "activated" : "deactivated"} successfully`);
    } catch (err: any) {
      logger.error("Error toggling banner status:", err);
      return sendError(res, err.message || "Failed to update banner status", 400);
    }
  },

  async deleteBanner(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const id = req.params.id as string;
      const result = await cmsService.deleteBanner(adminId, id);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      logger.error("Error deleting banner:", err);
      return sendError(res, err.message || "Failed to delete banner", 400);
    }
  },

  // ================= 7. REPORTING =================
  async getSalesReport(req: Request, res: Response) {
    try {
      const period = (req.query.period as any) || "daily";
      const result = await reportingService.getSalesReport(period);
      return sendSuccess(res, result, "Sales report generated successfully");
    } catch (err: any) {
      logger.error("Error generating sales report:", err);
      return sendError(res, err.message || "Failed to generate sales report", 500);
    }
  },

  async getProductReport(_req: Request, res: Response) {
    try {
      const result = await reportingService.getProductReport();
      return sendSuccess(res, result, "Product performance report generated");
    } catch (err: any) {
      logger.error("Error generating product report:", err);
      return sendError(res, err.message || "Failed to generate product report", 500);
    }
  },

  async getCustomerReport(_req: Request, res: Response) {
    try {
      const result = await reportingService.getCustomerReport();
      return sendSuccess(res, result, "Customer growth & retention report generated");
    } catch (err: any) {
      logger.error("Error generating customer report:", err);
      return sendError(res, err.message || "Failed to generate customer report", 500);
    }
  },

  async getWholesaleReport(_req: Request, res: Response) {
    try {
      const result = await reportingService.getWholesaleReport();
      return sendSuccess(res, result, "Wholesale report generated");
    } catch (err: any) {
      logger.error("Error generating wholesale report:", err);
      return sendError(res, err.message || "Failed to generate wholesale report", 500);
    }
  },

  // ================= 8. ACTIVITY LOGS =================
  async getActivityLogs(req: Request, res: Response) {
    try {
      const result = await activityLogService.getLogs(req.query as any);
      return sendSuccess(res, result, "Admin activity logs retrieved");
    } catch (err: any) {
      logger.error("Error retrieving activity logs:", err);
      return sendError(res, err.message || "Failed to retrieve activity logs", 400);
    }
  },
};
