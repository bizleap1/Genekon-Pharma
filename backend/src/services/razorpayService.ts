import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface CreateRazorpayOrderParams {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentSignatureParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RazorpayRefundParams {
  paymentId: string;
  amountPaise?: number;
  notes?: Record<string, string>;
}

// Instantiate Razorpay client with credentials from env
const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const razorpayService = {
  /**
   * Create an authoritative order on Razorpay servers
   */
  async createOrder(params: CreateRazorpayOrderParams) {
    try {
      const options = {
        amount: Math.round(params.amountPaise),
        currency: params.currency || "INR",
        receipt: params.receipt,
        notes: params.notes || {},
      };

      const order = await razorpay.orders.create(options);
      logger.info(`Created Razorpay order: ${order.id} for receipt: ${params.receipt} (₹${(params.amountPaise / 100).toFixed(2)})`);
      return order;
    } catch (err: any) {
      logger.error("Error creating Razorpay order:", err);
      throw new Error(err.error?.description || err.message || "Failed to create Razorpay order");
    }
  },

  /**
   * Cryptographically verify payment signature sent by frontend
   */
  verifyPaymentSignature(params: VerifyPaymentSignatureParams): boolean {
    try {
      const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
      const generatedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest("hex");

      const generatedBuffer = Buffer.from(generatedSignature);
      const providedBuffer = Buffer.from(params.razorpaySignature);

      if (generatedBuffer.length !== providedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(generatedBuffer, providedBuffer);
    } catch (err) {
      logger.error("Error verifying Razorpay payment signature:", err);
      return false;
    }
  },

  /**
   * Cryptographically verify webhook signature sent in x-razorpay-signature header
   */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string, secret?: string): boolean {
    try {
      const webhookSecret = secret || env.RAZORPAY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        logger.warn("No RAZORPAY_WEBHOOK_SECRET configured; cannot verify webhook signature");
        return false;
      }

      const generatedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const generatedBuffer = Buffer.from(generatedSignature);
      const providedBuffer = Buffer.from(signature);

      if (generatedBuffer.length !== providedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(generatedBuffer, providedBuffer);
    } catch (err) {
      logger.error("Error verifying Razorpay webhook signature:", err);
      return false;
    }
  },

  /**
   * Fetch payment details directly from Razorpay
   */
  async fetchPayment(paymentId: string) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (err: any) {
      logger.error(`Error fetching Razorpay payment ${paymentId}:`, err);
      throw new Error(err.error?.description || err.message || "Failed to fetch payment details");
    }
  },

  /**
   * Initiate a full or partial refund via Razorpay
   */
  async createRefund(params: RazorpayRefundParams) {
    try {
      const options: any = {
        notes: params.notes || {},
      };

      if (params.amountPaise && params.amountPaise > 0) {
        options.amount = Math.round(params.amountPaise);
      }

      const refund = await (razorpay.payments as any).refund(params.paymentId, options);
      logger.info(`Processed Razorpay refund ${refund.id} for payment ${params.paymentId}`);
      return refund;
    } catch (err: any) {
      logger.error(`Error initiating Razorpay refund for payment ${params.paymentId}:`, err);
      throw new Error(err.error?.description || err.message || "Failed to process refund on Razorpay");
    }
  },
};
