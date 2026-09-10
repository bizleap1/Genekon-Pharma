import rateLimit from "express-rate-limit";
import { sendError } from "../utils/apiResponse";

export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: process.env.NODE_ENV === "production" ? 5 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return sendError(
      res,
      "Too many OTP requests. Please wait 10 minutes before requesting again.",
      429,
      "RATE_LIMIT_EXCEEDED"
    );
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 20 : 150,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return sendError(
      res,
      "Too many login attempts. Please wait 15 minutes before trying again.",
      429,
      "RATE_LIMIT_EXCEEDED"
    );
  },
});
