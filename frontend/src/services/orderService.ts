import { CheckoutFormData, FormValidationErrors, CartItem, CartTotals } from "@/types/cart";
import { PlacedOrder } from "@/types/order";
import { apiClient } from "@/api/client";
import { usersApi } from "@/api/users";
import { cartApi } from "@/api/cart";
import { authStore } from "@/stores/authStore";

export type { PlacedOrder };

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
    try {
      // 1. Authoritative Cart Sync to server with exact quantities
      if (items.length > 0) {
        try {
          await cartApi.syncCart(
            items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
          );
        } catch (syncErr) {
          console.warn("Cart synchronization notice:", syncErr);
        }
      }

      // 2. Fetch or save delivery address to obtain authoritative deliveryAddressId
      let addressId: string | null = null;
      const addrRes = await usersApi.getUserAddresses();
      const savedAddresses = addrRes.data || [];
      const matching = savedAddresses.find(
        (a) =>
          a.pincode === formData.pincode &&
          a.addressLine.toLowerCase().includes(formData.addressLine.toLowerCase().slice(0, 10))
      );

      if (matching) {
        addressId = matching.id;
      } else {
        // Create new address in user's account
        const newAddrRes = await usersApi.addAddress({
          fullName: formData.fullName,
          phone: formData.mobileNumber,
          addressLine: formData.addressLine,
          landmark: formData.landmark || "",
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          type: formData.addressType || "home",
          isDefault: true,
        } as any);
        addressId = (newAddrRes.data as any)?.id || null;
      }

      if (!addressId) {
        throw new Error("Could not resolve a valid delivery address on the server");
      }

      // 3. Authoritative order placement on backend
      const paymentMethodEnum = formData.paymentMethod === "cod" ? "COD" : "ONLINE";
      const orderPayload: any = {
        deliveryAddressId: addressId,
        paymentMethod: paymentMethodEnum,
        notes: `Speed: ${formData.deliveryType}. Payment: ${formData.paymentMethod}`,
      };

      if (totals.appliedCoupon?.code) {
        orderPayload.couponCode = totals.appliedCoupon.code;
      }

      const orderRes = await apiClient.post<any>("/orders", orderPayload);
      const backendOrder = orderRes.data?.order || orderRes.data;

      if (!orderRes.success || !backendOrder || (!backendOrder.id && !backendOrder.orderNumber)) {
        throw new Error(orderRes.message || "Failed to place order on server");
      }

      const currentUser = authStore.getSnapshot().user;
      const placed: PlacedOrder = {
        orderId: backendOrder.orderNumber || backendOrder.id,
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        userPhone: currentUser?.mobile || formData.mobileNumber,
        date: new Date(backendOrder.createdAt || Date.now()).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        items,
        totals: {
          ...totals,
          totalAmount: Number(backendOrder.totalAmount) || totals.totalAmount,
        },
        formData,
        status: backendOrder.orderStatus === "PLACED" ? "Placed" : backendOrder.orderStatus,
        estimatedDelivery:
          formData.deliveryType === "express" ? "Tomorrow by 2:00 PM" : "In 2-4 business days",
        trackingNumber: `GNK-AWB-${backendOrder.orderNumber || backendOrder.id}`,
      };

      this.saveToLocalStorage(placed);
      return placed;
    } catch (err: any) {
      console.error("Order placement failed:", err);
      throw new Error(err?.response?.data?.message || err?.message || "Failed to place order on server. Please try again.");
    }
  },

  saveToLocalStorage(order: PlacedOrder, userId?: string): void {
    if (typeof window !== "undefined") {
      try {
        const currentUser = authStore.getSnapshot().user;
        const finalOrder: PlacedOrder = {
          ...order,
          userId: order.userId || userId || currentUser?.id,
          userEmail: order.userEmail || currentUser?.email,
          userPhone: order.userPhone || currentUser?.mobile || order.formData?.mobileNumber,
        };
        const existingStr = localStorage.getItem(ORDERS_STORAGE_KEY);
        const existing: PlacedOrder[] = existingStr ? JSON.parse(existingStr) : [];
        const filtered = existing.filter((o) => o.orderId !== finalOrder.orderId);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([finalOrder, ...filtered]));
      } catch (e) {
        console.error("Failed to store order in localStorage", e);
      }
    }
  },

  getStoredOrders(userId?: string): PlacedOrder[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      const orders: PlacedOrder[] = stored ? JSON.parse(stored) : [];
      const currentUser = authStore.getSnapshot().user;
      const targetUserId = userId || currentUser?.id;
      const targetPhone = (currentUser?.mobile || "").replace(/\D/g, "").slice(-10);
      const targetEmail = (currentUser?.email || "").toLowerCase();

      // If no user context exists at all, do not leak orders to unauthenticated guests
      if (!targetUserId && !targetPhone && !targetEmail) {
        return [];
      }

      return orders.filter((o) => {
        // Direct userId match
        if (targetUserId && o.userId && o.userId === targetUserId) {
          return true;
        }
        // Match by mobile number (normalized to last 10 digits)
        if (targetPhone) {
          const orderPhone = (o.userPhone || o.formData?.mobileNumber || "").replace(/\D/g, "").slice(-10);
          if (orderPhone && orderPhone === targetPhone) {
            return true;
          }
        }
        // Match by email
        if (targetEmail && o.userEmail && o.userEmail.toLowerCase() === targetEmail) {
          return true;
        }
        return false;
      });
    } catch {
      return [];
    }
  },
};
