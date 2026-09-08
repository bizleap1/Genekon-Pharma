import { Request, Response } from "express";
import { authService } from "../services/authService";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const authController = {
  /**
   * POST /api/v1/auth/send-otp
   */
  async sendOtp(req: Request, res: Response) {
    try {
      const identifier = req.body.identifier || req.body.phone;
      const result = await authService.requestOtp(identifier);
      return sendSuccess(res, result, result.message);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to send OTP", 400);
    }
  },

  /**
   * POST /api/v1/auth/verify-otp
   */
  async verifyOtp(req: Request, res: Response) {
    try {
      const identifier = req.body.identifier || req.body.phone;
      const { otp, role } = req.body;
      const result = await authService.verifyOtpAndLogin(identifier, otp, role);
      return sendSuccess(res, result, "Login successful");
    } catch (error: any) {
      return sendError(res, error.message || "OTP verification failed", 400);
    }
  },

  /**
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, "User registered successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Registration failed", 400);
    }
  },

  /**
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;
      const result = await authService.loginWithPassword(identifier, password);
      return sendSuccess(res, result, "Login successful");
    } catch (error: any) {
      return sendError(res, error.message || "Invalid credentials", 401);
    }
  },

  /**
   * POST /api/v1/auth/google
   */
  async googleLogin(req: Request, res: Response) {
    try {
      const { idToken } = req.body;
      const result = await authService.loginWithGoogle(idToken);
      return sendSuccess(res, result, "Google authentication successful");
    } catch (error: any) {
      return sendError(res, error.message || "Google authentication failed", 401);
    }
  },

  /**
   * POST /api/v1/auth/refresh-token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshAccessToken(refreshToken);
      return sendSuccess(res, result, "Token refreshed successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to refresh token", 401);
    }
  },

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      return sendSuccess(res, { loggedOut: true }, "Logged out successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Logout error", 400);
    }
  },

  /**
   * GET /api/v1/auth/me
   */
  async getMe(req: Request, res: Response) {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }
    return sendSuccess(res, authService.formatUser(req.user), "User session active");
  },
};
