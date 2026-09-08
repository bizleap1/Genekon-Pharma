import { Router } from "express";
import { adminController } from "../controllers/adminController";
import { authenticateUser, authorizeRole } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import {
  createBatchSchema,
  adjustStockSchema,
  toggleUserBlockSchema,
  reviewWholesaleApplicationSchema,
  createCouponSchema,
  createBannerSchema,
} from "../validators/adminValidator";

const router = Router();

// ================= RBAC BARRIER: ALL ADMIN ROUTES REQUIRE ADMIN ROLE =================
router.use(authenticateUser);
router.use(authorizeRole("ADMIN"));

// 1. Dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);

// 2. Inventory Management
router.get("/inventory", adminController.getInventory);
router.post(
  "/inventory/batches",
  validateRequest(createBatchSchema),
  adminController.createBatch
);
router.post(
  "/inventory/adjust",
  validateRequest(adjustStockSchema),
  adminController.adjustStock
);
router.get("/inventory/expiring", adminController.getExpiringProducts);
router.get("/inventory/low-stock", adminController.getLowStockAlerts);
router.get("/inventory/logs", adminController.getInventoryLogs);

// 3. Customer Management
router.get("/customers", adminController.listCustomers);
router.get("/customers/:id", adminController.getCustomerDetails);
router.patch(
  "/customers/:id/block",
  validateRequest(toggleUserBlockSchema),
  adminController.toggleUserBlock
);

// 4. Wholesale Partner Management
router.get("/wholesale/applications", adminController.listWholesaleApplications);
router.put(
  "/wholesale/applications/:id/review",
  validateRequest(reviewWholesaleApplicationSchema),
  adminController.reviewWholesaleApplication
);
router.get("/wholesale/partners", adminController.listWholesalePartners);

// 5. Coupon Management
router.get("/coupons", adminController.listCoupons);
router.post(
  "/coupons",
  validateRequest(createCouponSchema),
  adminController.createCoupon
);
router.put("/coupons/:id", adminController.updateCoupon);
router.patch("/coupons/:id/status", adminController.toggleCouponStatus);
router.delete("/coupons/:id", adminController.deleteCoupon);

// 6. CMS Banners & Promotional Management
router.get("/cms/banners", adminController.listBanners);
router.post(
  "/cms/banners",
  validateRequest(createBannerSchema),
  adminController.createBanner
);
router.put("/cms/banners/:id", adminController.updateBanner);
router.patch("/cms/banners/:id/status", adminController.toggleBannerStatus);
router.delete("/cms/banners/:id", adminController.deleteBanner);

// 7. Business Reports
router.get("/reports/sales", adminController.getSalesReport);
router.get("/reports/products", adminController.getProductReport);
router.get("/reports/customers", adminController.getCustomerReport);
router.get("/reports/wholesale", adminController.getWholesaleReport);

// 8. Admin Activity Logs
router.get("/activity-logs", adminController.getActivityLogs);

export default router;
