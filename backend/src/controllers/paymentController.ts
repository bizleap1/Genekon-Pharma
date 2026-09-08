import { Request, Response } from "express";
import { paymentService } from "../services/paymentService";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export const paymentController = {
  /**
   * POST /api/v1/payments/create-order
   * Generate authoritative Razorpay order for customer checkout
   */
  async createOrder(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { orderId } = req.body;
      const result = await paymentService.createPaymentOrder(userId, orderId);

      return sendSuccess(res, result, "Razorpay payment order initialized successfully", 201);
    } catch (err: any) {
      logger.error("Error creating payment order:", err);
      return sendError(res, err.message || "Failed to initialize payment order", 400);
    }
  },

  /**
   * POST /api/v1/payments/verify
   * Verify HMAC signature of completed Razorpay payment
   */
  async verifyPayment(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await paymentService.verifyPayment(userId, req.body);

      return sendSuccess(res, result, result.message, 200);
    } catch (err: any) {
      logger.error("Error verifying payment signature:", err);
      return sendError(res, err.message || "Payment signature verification failed", 400);
    }
  },

  /**
   * POST /api/v1/payments/webhook
   * Razorpay asynchronous webhook notifications
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers["x-razorpay-signature"] as string;
      if (!signature) {
        return sendError(res, "Missing x-razorpay-signature header", 400);
      }

      // Retrieve raw body buffer from express verify hook, or convert if needed
      const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
      const result = await paymentService.handleWebhook(rawBody, signature);

      return res.status(200).json(result);
    } catch (err: any) {
      logger.error("Error processing Razorpay webhook:", err);
      return sendError(res, err.message || "Webhook processing error", 400);
    }
  },

  /**
   * POST /api/v1/payments/retry
   * Retry payment for an existing unpaid/failed order
   */
  async retryPayment(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { orderId } = req.body;
      const result = await paymentService.retryPayment(userId, orderId);

      return sendSuccess(res, result, "Payment retry initialized successfully", 200);
    } catch (err: any) {
      logger.error("Error retrying payment:", err);
      return sendError(res, err.message || "Failed to retry payment", 400);
    }
  },

  /**
   * POST /api/v1/payments/refund
   * Admin: Initiate full or partial refund
   */
  async refundPayment(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const result = await paymentService.initiateRefund(adminId, req.body);

      return sendSuccess(res, result, result.message, 200);
    } catch (err: any) {
      logger.error("Error processing payment refund:", err);
      return sendError(res, err.message || "Failed to process refund", 400);
    }
  },

  /**
   * GET /api/v1/payments/order/:orderId
   * Fetch payment records for a given order
   */
  async getPaymentByOrderId(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const orderId = req.params.orderId as string;
      const isAdmin = user.role === "ADMIN";

      const result = await paymentService.getPaymentByOrderId(orderId, user.id, isAdmin);
      return sendSuccess(res, result, "Payment details retrieved successfully", 200);
    } catch (err: any) {
      logger.error("Error retrieving payment by order ID:", err);
      return sendError(res, err.message || "Failed to retrieve payment details", 400);
    }
  },

  /**
   * GET /api/v1/payments/admin
   * Admin: List and filter payments with pagination
   */
  async listAdminPayments(req: Request, res: Response) {
    try {
      const result = await paymentService.listAdminPayments(req.query as any);
      return sendSuccess(res, result, "Admin payments retrieved successfully", 200);
    } catch (err: any) {
      logger.error("Error listing admin payments:", err);
      return sendError(res, err.message || "Failed to list payments", 400);
    }
  },
};
