import { Router } from "express";
import { authController } from "../controllers/authController";
import { validateRequest } from "../middleware/validate";
import { authenticateUser, authorizeRole } from "../middleware/auth";
import { otpRateLimiter, authRateLimiter } from "../middleware/rateLimiter";
import {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginPasswordSchema,
  googleAuthSchema,
  refreshTokenSchema,
} from "../validators/authValidation";
import { sendSuccess } from "../utils/apiResponse";

const router = Router();

// Public Authentication Endpoints
router.post(
  "/send-otp",
  otpRateLimiter,
  validateRequest(sendOtpSchema),
  authController.sendOtp
);

router.post(
  "/verify-otp",
  authRateLimiter,
  validateRequest(verifyOtpSchema),
  authController.verifyOtp
);

router.post(
  "/register",
  authRateLimiter,
  validateRequest(registerSchema),
  authController.register
);

router.post(
  "/login",
  authRateLimiter,
  validateRequest(loginPasswordSchema),
  authController.login
);

router.post(
  "/google",
  authRateLimiter,
  validateRequest(googleAuthSchema),
  authController.googleLogin
);

router.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  authController.refreshToken
);

router.post("/logout", authController.logout);

// Protected Session Route
router.get("/me", authenticateUser, authController.getMe);

// Role-Based Verification Test Endpoints
router.get(
  "/admin/verify",
  authenticateUser,
  authorizeRole("ADMIN"),
  (req, res) => {
    return sendSuccess(
      res,
      { adminId: req.user!.id, role: req.user!.role },
      "Admin authorization verified"
    );
  }
);

router.get(
  "/wholesale/verify",
  authenticateUser,
  authorizeRole("WHOLESALE_PARTNER"),
  (req, res) => {
    return sendSuccess(
      res,
      { partnerId: req.user!.id, role: req.user!.role },
      "Wholesale partner authorization verified"
    );
  }
);

export default router;
