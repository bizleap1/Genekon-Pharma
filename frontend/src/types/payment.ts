/**
 * Payment Architecture Types
 * Prepares the frontend for Razorpay, UPI gateway, and Cash on Delivery settlements.
 */

export type SupportedPaymentMethod = "upi" | "card" | "netbanking" | "cod";

export type GatewayPaymentStatus = "created" | "attempted" | "paid" | "failed" | "refunded";

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise (e.g. 10000 = ₹100.00)
  currency: "INR";
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface PaymentVerificationPayload {
  orderId: string;
  gatewayOrderId?: string;
  razorpayOrderId?: string;
  paymentId: string;
  signature: string;
}

export interface PaymentInitiationResult {
  success: boolean;
  gatewayOrderId?: string;
  paymentMethod: SupportedPaymentMethod;
  amount: number;
  currency: "INR";
  keyId?: string;
  error?: string;
}
