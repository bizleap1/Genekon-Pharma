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
    let dispatchSuccess = false;
    let dispatchError: string | null = null;
    const isEmail = cleanId.includes("@");
    if (isEmail && env.RESEND_API_KEY && env.RESEND_API_KEY.startsWith("re_")) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(env.RESEND_API_KEY);
        await resend.emails.send({
          from: env.RESEND_FROM_EMAIL || "Genekon Pharmacy <onboarding@resend.dev>",
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
        dispatchSuccess = true;
        logger.info(`Dispatched email OTP to ${cleanId} via Resend`);
      } catch (err: any) {
        dispatchError = err?.message || "Email dispatch failed";
        logger.error("Failed to send OTP via Resend email", err);
      }
    } else if (!isEmail && env.GETOTP_API_KEY) {
      try {
        const cleanPhone = cleanId.replace(/\D/g, "");
        const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

        const otpRes = await fetch("https://api.otp.dev/v1/verifications", {
          method: "POST",
          headers: {
            "X-OTP-Key": env.GETOTP_API_KEY,
            "accept": "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            data: {
              channel: "sms",
              sender: env.GETOTP_SENDER || "OTP Dev",
              phone: formattedPhone,
              template: env.GETOTP_TEMPLATE_ID || "ae09b161-d843-42e7-85c1-c81b6b9f3604",
              code_length: 6,
            },
          }),
        });

        const otpData: any = await otpRes.json();
        if (otpRes.ok && otpData?.data?.message_id) {
          dispatchSuccess = true;
          logger.info(`Dispatched SMS OTP to ${formattedPhone} via GetOTP (Message ID: ${otpData.data.message_id})`);
        } else {
          dispatchError = otpData?.message || "SMS delivery service rejected request";
          logger.warn(`GetOTP dispatch warning: ${JSON.stringify(otpData)}`);
        }
      } catch (smsErr: any) {
        dispatchError = smsErr?.message || "SMS dispatch network error";
        logger.error("Failed to dispatch SMS via GetOTP", smsErr);
      }
    }

    if (env.NODE_ENV === "production" && !dispatchSuccess) {
      throw new Error(`Failed to deliver OTP code: ${dispatchError || "No active SMS or email delivery provider configured"}`);
    }

    // Secure logging: only log raw OTP in non-production environments
    if (env.NODE_ENV !== "production") {
      logger.info(`[AUTH_OTP] OTP generated for identifier ${cleanId}: ${rawOtp} (Expires in 5m)`);
    } else {
      logger.info(`[AUTH_OTP] OTP generated for identifier ${cleanId} (Expires in 5m)`);
    }

    return {
      success: true,
      message: `OTP sent successfully to ${identifier}`,
      // Expose testOtp only in non-production for automated testing
      testOtp: env.NODE_ENV !== "production" ? rawOtp : undefined,
    };
  },

  /**
   * Verify provided OTP against latest unexpired hash or GetOTP
   */
  async verifyOtp(identifier: string, plainOtp: string): Promise<boolean> {
    const cleanId = identifier.trim().toLowerCase();
    const isEmail = cleanId.includes("@");

    // 1. Try GetOTP online verification if phone number
    if (!isEmail && env.GETOTP_API_KEY) {
      try {
        const cleanPhone = cleanId.replace(/\D/g, "");
        const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const getOtpRes = await fetch(
          `https://api.otp.dev/v1/verifications?code=${encodeURIComponent(plainOtp.trim())}&phone=${encodeURIComponent(formattedPhone)}`,
          {
            headers: {
              "X-OTP-Key": env.GETOTP_API_KEY,
              "accept": "application/json",
            },
          }
        );

        if (getOtpRes.ok) {
          const verifyData: any = await getOtpRes.json();
          if (verifyData?.data && Object.keys(verifyData.data).length > 0) {
            logger.info(`Verified SMS OTP for ${formattedPhone} via GetOTP`);
            // Mark any local record as verified
            await db
              .update(mobileOtps)
              .set({ verified: true })
              .where(eq(mobileOtps.identifier, cleanId));
            return true;
          }
        }
      } catch (getOtpErr) {
        logger.warn("GetOTP verification check failed, falling back to local DB hash check", getOtpErr);
      }
    }

    const inputHash = this.hashOtp(plainOtp.trim());

    // 2. Fetch latest active OTP from DB
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

    // 3. Lockout protection (Max 3 failed attempts)
    if (latestRecord.attempts >= 3) {
      throw new Error("Maximum attempts exceeded. This OTP has been locked. Please request a new code.");
    }

    // 4. Timing-safe comparison of SHA-256 hashes
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

    // 5. Mark OTP as verified (Single-use)
    await db
      .update(mobileOtps)
      .set({ verified: true })
      .where(eq(mobileOtps.id, latestRecord.id));

    return true;
  },
};
