import { z } from "zod";

export const createOrderPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay signature is required"),
});

export const retryPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export const refundPaymentSchema = z.object({
  paymentId: z.string().uuid("Invalid payment ID format"),
  amount: z
    .number()
    .positive("Refund amount must be greater than zero")
    .optional(),
  reason: z.string().min(3, "Reason for refund is required"),
});

export const adminPaymentQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
  status: z
    .enum(["PENDING", "SUCCESS", "PAID", "FAILED", "REFUNDED"])
    .optional(),
  paymentMethod: z
    .enum(["COD", "ONLINE", "UPI", "CARD", "NETBANKING"])
    .optional(),
  search: z.string().optional(),
});

export type CreateOrderPaymentInput = z.infer<typeof createOrderPaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RetryPaymentInput = z.infer<typeof retryPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type AdminPaymentQueryInput = z.infer<typeof adminPaymentQuerySchema>;
