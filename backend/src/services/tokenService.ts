import crypto from "crypto";
import jwt from "jsonwebtoken";
import { eq, and, gt } from "drizzle-orm";
import { db, refreshTokens, users, User } from "../db";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface TokenUserPayload {
  userId: string;
  role: "CUSTOMER" | "WHOLESALE_PARTNER" | "ADMIN";
  email?: string | null;
  phone?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
}

export const tokenService = {
  /**
   * SHA-256 hash token before DB storage
   */
  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  },

  /**
   * Generate Access and Refresh Token pair
   */
  async generateAuthTokens(user: User): Promise<AuthTokens> {
    const payload: TokenUserPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
    };

    // Access Token (15 mins)
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as any,
    });

    // Refresh Token (7 days)
    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY as any,
    });

    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store hashed refresh token in database
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
      revoked: false,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 900 seconds
    };
  },

  /**
   * Verify Access Token
   */
  verifyAccessToken(token: string): TokenUserPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenUserPayload;
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired access token");
    }
  },

  /**
   * Rotate Refresh Token (revokes old, issues new)
   */
  async rotateRefreshToken(oldRefreshToken: string): Promise<{ tokens: AuthTokens; user: User }> {
    try {
      // 1. Verify token signature
      const decoded = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
      const tokenHash = this.hashToken(oldRefreshToken);

      // 2. Check token in database
      const [existingRecord] = await db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.tokenHash, tokenHash),
            eq(refreshTokens.revoked, false),
            gt(refreshTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!existingRecord) {
        logger.security("REFRESH_TOKEN_REUSE_OR_INVALID", { tokenHash });
        throw new Error("Refresh token is invalid or has already been used");
      }

      // 3. Invalidate old token (Single-use rotation)
      await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.id, existingRecord.id));

      // 4. Fetch user
      const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      if (!user || !user.isActive) {
        throw new Error("User account is inactive or no longer exists");
      }

      // 5. Generate fresh tokens
      const newTokens = await this.generateAuthTokens(user);
      return { tokens: newTokens, user };
    } catch (error: any) {
      throw new Error(error.message || "Failed to rotate refresh token");
    }
  },

  /**
   * Invalidate Refresh Token upon Logout
   */
  async revokeRefreshToken(token: string): Promise<void> {
    try {
      const tokenHash = this.hashToken(token);
      await db
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.tokenHash, tokenHash));
    } catch (error) {
      logger.error("Error revoking refresh token", error);
    }
  },
};
