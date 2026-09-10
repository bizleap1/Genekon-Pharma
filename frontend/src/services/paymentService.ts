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
import { apiClient } from "@/api/client";

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
    onError?: (err: any) => void;
  }): Promise<void> {
    const isLoaded = await this.loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error(
        "Failed to load Razorpay payment gateway. Please check your internet connection."
      );
    }

    let rzpOrderId: string | undefined;
    let keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_TZVi7dlYcaCcmf";

    // 1. Authoritatively create order on backend
    try {
      const res = await apiClient.post<any>("/payments/create-order", {
        orderId: options.orderId,
      });
      if (res.success && res.data) {
        rzpOrderId = res.data.razorpayOrderId;
        if (res.data.keyId) keyId = res.data.keyId;
      }
    } catch (e) {
      console.warn("Backend payment order creation failed, falling back to client order id", e);
    }

    const rzpOptions: RazorpayCheckoutOptions = {
      key: keyId,
      amount: Math.round(options.amountInRupees * 100),
      currency: "INR",
      name: "GENEKON Pharmaceuticals",
      description: `Payment for Pharmacy Order #${options.orderId}`,
      image: "/images/genekon-icon.png",
      ...(rzpOrderId ? { order_id: rzpOrderId } : {}),
      prefill: {
        name: options.patientName,
        contact: options.patientPhone,
        email: options.patientEmail || "care@genekonpharma.com",
      },
      theme: {
        color: "#559620", // Genekon Primary Green
      },
      handler: async (response: RazorpaySuccessResponse) => {
        try {
          const verifyResult = await this.verifyPayment({
            orderId: options.orderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            razorpayOrderId: response.razorpay_order_id,
          });
          if (verifyResult.verified) {
            options.onSuccess(response);
          } else {
            const err = new Error(verifyResult.message || "Payment verification rejected by server");
            console.error("Signature verification error:", err);
            if (options.onError) {
              options.onError(err);
            } else {
              alert(err.message);
            }
          }
        } catch (verifyErr: any) {
          console.error("Signature verification error:", verifyErr);
          if (options.onError) {
            options.onError(verifyErr);
          } else {
            alert(verifyErr?.message || "Payment verification failed. Please contact support.");
          }
        }
      },
      modal: {
        ondismiss: options.onDismiss,
      },
    };

    const rzp = new window.Razorpay(rzpOptions);
    rzp.open();
  },

  /**
   * Verify cryptographic signature with backend after client payment success
   */
  async verifyPayment(
    payload: PaymentVerificationPayload
  ): Promise<{ verified: boolean; message: string }> {
    try {
      const res = await apiClient.post<any>("/payments/verify", {
        orderId: payload.orderId,
        razorpayOrderId: payload.razorpayOrderId,
        razorpayPaymentId: payload.paymentId,
        razorpaySignature: payload.signature,
      });
      return {
        verified: Boolean(res.success),
        message: res.message || "Payment verified successfully",
      };
    } catch (err: any) {
      return {
        verified: false,
        message: err?.response?.data?.message || err?.message || "Payment signature verification failed",
      };
    }
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
