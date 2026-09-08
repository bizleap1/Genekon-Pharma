import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import { sendSuccess } from "../utils/apiResponse";

const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  return sendSuccess(
    res,
    {
      status: "healthy",
      service: "genekon-auth-backend",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
    "Genekon Backend Service is operational"
  );
});

// Mount domain routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
