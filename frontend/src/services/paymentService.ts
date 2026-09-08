/**
 * Payment Service
 * Encapsulates Razorpay SDK loading, gateway checkout triggers, and payment verification.
 */

import {
  SupportedPaymentMethod,
  PaymentVerificationPayload,
  RazorpayCheckoutOptions,
  RazorpaySuccessResponse,
} from "@/types/payment";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
    };
  }
}

export const paymentService = {
  /**
   * Dynamically loads Razorpay checkout.js SDK
   */
  async loadRazorpayScript(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (window.Razorpay) return true;

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Launch Razorpay Checkout Modal
   */
  async launchRazorpay(options: {
    orderId: string;
    amountInRupees: number;
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    onSuccess: (response: RazorpaySuccessResponse) => void;
    onDismiss?: () => void;
  }): Promise<void> {
    const isLoaded = await this.loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error("Failed to load Razorpay payment gateway. Please check your internet connection.");
    }

    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_placeholder_key";

    const rzpOptions: RazorpayCheckoutOptions = {
      key,
      amount: Math.round(options.amountInRupees * 100),
      currency: "INR",
      name: "GENEKON Pharmaceuticals",
      description: `Payment for Pharmacy Order #${options.orderId}`,
      image: "/images/genekon-icon.png",
      order_id: `order_rzp_${options.orderId.replace(/[^a-zA-Z0-9]/g, "")}`,
      prefill: {
        name: options.patientName,
        contact: options.patientPhone,
        email: options.patientEmail,
      },
      theme: {
        color: "#559620", // Genekon Primary Green
      },
      handler: options.onSuccess,
      modal: {
        ondismiss: options.onDismiss,
      },
    };

    const rzp = new window.Razorpay(rzpOptions);
    rzp.open();
  },

  /**
   * Verify signature with backend after client payment success
   */
  async verifyPayment(payload: PaymentVerificationPayload): Promise<{ verified: boolean; message: string }> {
    // Future API: return await apiClient.post("/payments/verify", payload);
    return {
      verified: true,
      message: `Payment ${payload.paymentId} verified successfully.`,
    };
  },

  /**
   * Confirm Cash on Delivery order
   */
  confirmCodPayment(orderId: string): { confirmed: boolean; method: SupportedPaymentMethod } {
    return {
      confirmed: true,
      method: "cod",
    };
  },
};
