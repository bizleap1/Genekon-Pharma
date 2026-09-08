import { CheckoutFormData, FormValidationErrors } from "@/types/cart";
import { CartItem, CartTotals } from "@/types/cart";

export interface PlacedOrder {
  orderId: string;
  date: string;
  items: CartItem[];
  totals: CartTotals;
  formData: CheckoutFormData;
  status: "Placed" | "Confirmed" | "Packed" | "Shipped" | "Delivered";
  estimatedDelivery: string;
}

const ORDERS_STORAGE_KEY = "genekon_placed_orders_v1";

export const orderService = {
  validateCheckoutForm(data: CheckoutFormData): FormValidationErrors {
    const errors: FormValidationErrors = {};

    // Mobile Number Validation
    const cleanPhone = data.mobileNumber.replace(/\D/g, "");
    if (!cleanPhone) {
      errors.mobileNumber = "Mobile number is required";
    } else if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      errors.mobileNumber = "Enter a valid 10-digit Indian mobile number (e.g. 9822XXXXXX)";
    }

    // Full Name
    if (!data.fullName || data.fullName.trim().length < 3) {
      errors.fullName = "Please enter your full name (at least 3 characters)";
    }

    // Street Address
    if (!data.addressLine || data.addressLine.trim().length < 6) {
      errors.addressLine = "Please enter complete street, house or flat address";
    }

    // City
    if (!data.city || data.city.trim().length < 2) {
      errors.city = "City is required";
    }

    // State
    if (!data.state || data.state.trim().length < 2) {
      errors.state = "State is required";
    }

    // Pincode
    const cleanPin = data.pincode.replace(/\D/g, "");
    if (!cleanPin) {
      errors.pincode = "6-digit postal PIN code is required";
    } else if (cleanPin.length !== 6) {
      errors.pincode = "Enter a valid 6-digit Indian PIN code (e.g. 440013)";
    }

    // Payment Method
    if (!data.paymentMethod) {
      errors.paymentMethod = "Please select a payment method";
    }

    return errors;
  },

  async placeOrder(
    formData: CheckoutFormData,
    items: CartItem[],
    totals: CartTotals
  ): Promise<PlacedOrder> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderId = `GNK-${Math.floor(89000 + Math.random() * 9999)}`;
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        // Delivery estimate
        const days = formData.deliveryType === "express" ? 1 : 3;
        const deliveryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        const estimatedDelivery = deliveryDate.toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });

        const newOrder: PlacedOrder = {
          orderId,
          date: dateStr,
          items,
          totals,
          formData,
          status: "Placed",
          estimatedDelivery,
        };

        // Save order history to localStorage
        if (typeof window !== "undefined") {
          try {
            const existingStr = localStorage.getItem(ORDERS_STORAGE_KEY);
            const existing: PlacedOrder[] = existingStr ? JSON.parse(existingStr) : [];
            localStorage.setItem(
              ORDERS_STORAGE_KEY,
              JSON.stringify([newOrder, ...existing])
            );
          } catch (e) {
            console.error("Failed to store order in localStorage", e);
          }
        }

        resolve(newOrder);
      }, 1000);
    });
  },

  getStoredOrders(): PlacedOrder[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
};
