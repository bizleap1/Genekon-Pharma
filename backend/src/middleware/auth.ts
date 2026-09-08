import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, users, User } from "../db";
import { tokenService } from "../services/tokenService";
import { sendError } from "../utils/apiResponse";

// Extend Express Request type with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export type AllowedRole = "CUSTOMER" | "WHOLESALE_PARTNER" | "ADMIN";

/**
 * Authenticate JWT Bearer token
 */
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Authorization token is missing or malformed", 401, "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];
    const decoded = tokenService.verifyAccessToken(token);

    // Verify user exists and is active in database
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);

    if (!user || !user.isActive) {
      return sendError(
        res,
        "User account not found or deactivated",
        401,
        "ACCOUNT_INACTIVE_OR_DELETED"
      );
    }

    req.user = user;
    next();
  } catch (error: any) {
    return sendError(res, error.message || "Invalid authentication token", 401, "INVALID_TOKEN");
  }
}

/**
 * Role-Based Access Control (RBAC) Guard
 */
export function authorizeRole(...allowedRoles: AllowedRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Authentication required", 401, "UNAUTHORIZED");
    }

    if (!allowedRoles.includes(req.user.role as AllowedRole)) {
      return sendError(
        res,
        `Access forbidden: Requires ${allowedRoles.join(" or ")} role`,
        403,
        "INSUFFICIENT_PERMISSIONS"
      );
    }

    next();
  };
}
