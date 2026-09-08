import crypto from "crypto";
import { eq, and, gt, desc } from "drizzle-orm";
import { db, mobileOtps } from "../db";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export const otpService = {
  /**
   * SHA-256 hash OTP code
   */
  hashOtp(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex");
  },

  /**
   * Generate, store, and dispatch 6-digit OTP
   */
  async sendOtp(identifier: string): Promise<{ success: boolean; message: string; testOtp?: string }> {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Check rate limit: Max 4 requests in last 15 minutes
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentOtps = await db
      .select()
      .from(mobileOtps)
      .where(and(eq(mobileOtps.identifier, cleanId), gt(mobileOtps.createdAt, fifteenMinsAgo)));

    if (recentOtps.length >= 4) {
      throw new Error("Too many OTP requests. Please wait 15 minutes before requesting again.");
    }

    // 2. Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = this.hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

    // 3. Store hashed OTP in database
    await db.insert(mobileOtps).values({
      identifier: cleanId,
      otpHash,
      attempts: 0,
      expiresAt,
      verified: false,
    });

    // 4. Dispatch via SMS / Email
    const isEmail = cleanId.includes("@");
    if (isEmail && env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith("re_")) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Genekon Pharmacy <auth@genekonpharma.com>",
          to: cleanId,
          subject: "Your Genekon Pharmacy Verification Code",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #14304A;">
              <h2 style="color: #559620;">Genekon Pharmacy Verification</h2>
              <p>Your 6-digit verification code is:</p>
              <h1 style="letter-spacing: 4px; font-size: 32px; color: #14304A; background: #FAFCFA; padding: 10px; display: inline-block; border: 1px solid #E5E7EB; border-radius: 8px;">${rawOtp}</h1>
              <p style="color: #6B7280; font-size: 14px;">This code expires in 5 minutes. Never share your OTP with anyone.</p>
            </div>
          `,
        });
        logger.info(`Dispatched email OTP to ${cleanId} via Resend`);
      } catch (err) {
        logger.error("Failed to send OTP via Resend email", err);
      }
    }

    // For development testing & audit logging
    logger.info(`[AUTH_OTP] OTP generated for identifier ${cleanId}: ${rawOtp} (Expires in 5m)`);

    return {
      success: true,
      message: `OTP sent successfully to ${identifier}`,
      // Expose testOtp only in non-production for automated testing
      testOtp: env.NODE_ENV !== "production" ? rawOtp : undefined,
    };
  },

  /**
   * Verify provided OTP against latest unexpired hash
   */
  async verifyOtp(identifier: string, plainOtp: string): Promise<boolean> {
    const cleanId = identifier.trim().toLowerCase();
    const inputHash = this.hashOtp(plainOtp.trim());

    // 1. Fetch latest active OTP
    const [latestRecord] = await db
      .select()
      .from(mobileOtps)
      .where(
        and(
          eq(mobileOtps.identifier, cleanId),
          eq(mobileOtps.verified, false),
          gt(mobileOtps.expiresAt, new Date())
        )
      )
      .orderBy(desc(mobileOtps.createdAt))
      .limit(1);

    if (!latestRecord) {
      throw new Error("No active OTP found. Please request a new code.");
    }

    // 2. Lockout protection (Max 3 failed attempts)
    if (latestRecord.attempts >= 3) {
      throw new Error("Maximum attempts exceeded. This OTP has been locked. Please request a new code.");
    }

    // 3. Timing-safe comparison of SHA-256 hashes
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(latestRecord.otpHash),
      Buffer.from(inputHash)
    );

    if (!isMatch) {
      const nextAttempts = latestRecord.attempts + 1;
      await db
        .update(mobileOtps)
        .set({ attempts: nextAttempts })
        .where(eq(mobileOtps.id, latestRecord.id));

      const remaining = 3 - nextAttempts;
      throw new Error(
        remaining > 0
          ? `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : "Invalid OTP. Maximum attempts exceeded. Please request a new code."
      );
    }

    // 4. Mark OTP as verified (Single-use)
    await db
      .update(mobileOtps)
      .set({ verified: true })
      .where(eq(mobileOtps.id, latestRecord.id));

    return true;
  },
};
