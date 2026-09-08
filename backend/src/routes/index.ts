import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import categoryRoutes from "./categoryRoutes";
import productRoutes from "./productRoutes";
import cartRoutes from "./cartRoutes";
import wishlistRoutes from "./wishlistRoutes";
import orderRoutes from "./orderRoutes";
import paymentRoutes from "./paymentRoutes";
import adminRoutes from "./adminRoutes";
import { cmsService } from "../services/cmsService";
import { sendSuccess, sendError } from "../utils/apiResponse";

const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  return sendSuccess(
    res,
    {
      status: "healthy",
      service: "genekon-backend",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
    "Genekon Backend Service is operational"
  );
});

// Public CMS Banners (For Homepage and Promotions)
router.get("/cms/banners", async (req, res) => {
  try {
    const section = req.query.section as string;
    const banners = await cmsService.listBanners(false, section);
    return sendSuccess(res, banners, "Active promotional banners retrieved");
  } catch (err: any) {
    return sendError(res, err.message || "Failed to retrieve banners", 400);
  }
});

// Mount domain routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);

export default router;
