/**
 * Orders API Service
 * Manages order creation, customer order history, live tracking, and admin orders.
 */

import { apiClient } from "./client";
import { PlacedOrder, TrackedOrder, OrderStatus } from "@/types/order";
import { AdminOrder } from "@/types/admin";
import { ApiResponse, QueryParams } from "@/types/api";
import { ADMIN_ORDERS } from "@/data/adminData";
import { MOCK_ORDERS } from "@/data/customer";

export const ordersApi = {
  /**
   * Create order after checkout
   */
  async createOrder(orderPayload: unknown): Promise<ApiResponse<PlacedOrder>> {
    try {
      return await apiClient.post<PlacedOrder>("/orders", orderPayload);
    } catch {
      const mockOrder: PlacedOrder = {
        orderId: `GNK-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        status: "Placed",
        formData: {
          mobileNumber: "9370102691",
          fullName: "Prerna Sharma",
          addressLine: "Flat 302, Royal Palms, Ramdaspeth",
          landmark: "Near Central Park Hospital",
          city: "Nagpur",
          state: "Maharashtra",
          pincode: "440010",
          addressType: "home",
          deliveryType: "standard",
          paymentMethod: "upi",
          whatsappUpdates: true,
        },
        items: [],
        totals: {
          itemCount: 0,
          subtotal: 500,
          discount: 50,
          couponDiscount: 0,
          deliveryCost: 0,
          freeDeliveryThreshold: 500,
          amountNeededForFreeDelivery: 0,
          totalAmount: 450,
          appliedCoupon: null,
        },
        estimatedDelivery: "Tomorrow by 2:00 PM",
        trackingNumber: `EXP-NGP-${Math.floor(10000 + Math.random() * 90000)}`,
      };

      return {
        success: true,
        message: "Order placed successfully",
        data: mockOrder,
      };
    }
  },

  /**
   * Fetch single placed order by ID
   */
  async getOrderById(id: string): Promise<ApiResponse<PlacedOrder>> {
    try {
      return await apiClient.get<PlacedOrder>(`/orders/${id}`);
    } catch {
      const match = MOCK_ORDERS.find((o) => o.id.toLowerCase() === id.toLowerCase());
      const fallback: PlacedOrder = {
        orderId: id || "GNK-481920",
        date: match?.date || "02 Sep 2026",
        status: "Delivered",
        formData: {
          mobileNumber: "9370102691",
          fullName: "Prerna Sharma",
          addressLine: match?.deliveryAddress || "Flat 302, Royal Palms, Ramdaspeth",
          city: "Nagpur",
          state: "Maharashtra",
          pincode: "440010",
          addressType: "home",
          deliveryType: "standard",
          paymentMethod: "upi",
          whatsappUpdates: true,
        },
        items: (match?.items || []).map((i) => ({
          id: i.id,
          productId: i.id,
          name: i.name,
          brand: i.brand,
          variant: i.variant || "Standard",
          price: i.price,
          originalPrice: i.originalPrice || i.price,
          discount: 0,
          quantity: i.quantity,
          stockQuantity: 100,
          image: i.image,
          selected: true,
        })),
        totals: {
          itemCount: match?.items?.length || 1,
          subtotal: match?.priceBreakdown?.subtotal || 1200,
          discount: match?.priceBreakdown?.discount || 200,
          couponDiscount: 0,
          deliveryCost: match?.priceBreakdown?.deliveryFee || 0,
          freeDeliveryThreshold: 500,
          amountNeededForFreeDelivery: 0,
          totalAmount: match?.totalAmount || 1000,
          appliedCoupon: null,
        },
        estimatedDelivery: match?.estimatedDelivery || "Completed",
        trackingNumber: match?.awbNumber || "EXP-NGP-90214",
      };

      return {
        success: true,
        data: fallback,
      };
    }
  },

  /**
   * Fetch all orders for current user
   */
  async getUserOrders(): Promise<ApiResponse<PlacedOrder[]>> {
    try {
      return await apiClient.get<PlacedOrder[]>("/orders/user");
    } catch {
      const converted: PlacedOrder[] = MOCK_ORDERS.map((m) => ({
        orderId: m.id,
        date: m.date,
        status: "Delivered",
        formData: {
          mobileNumber: "9370102691",
          fullName: "Prerna Sharma",
          addressLine: m.deliveryAddress,
          city: "Nagpur",
          state: "Maharashtra",
          pincode: "440010",
          addressType: "home",
          deliveryType: "standard",
          paymentMethod: "upi",
          whatsappUpdates: true,
        },
        items: m.items.map((i) => ({
          id: i.id,
          productId: i.id,
          name: i.name,
          brand: i.brand,
          variant: i.variant || "Standard",
          price: i.price,
          originalPrice: i.originalPrice || i.price,
          discount: 0,
          quantity: i.quantity,
          stockQuantity: 100,
          image: i.image,
          selected: true,
        })),
        totals: {
          itemCount: m.items.length,
          subtotal: m.priceBreakdown.subtotal,
          discount: m.priceBreakdown.discount,
          couponDiscount: 0,
          deliveryCost: m.priceBreakdown.deliveryFee,
          freeDeliveryThreshold: 500,
          amountNeededForFreeDelivery: 0,
          totalAmount: m.totalAmount,
          appliedCoupon: null,
        },
        estimatedDelivery: m.estimatedDelivery || "Completed",
        trackingNumber: m.awbNumber || "EXP-NGP-90214",
      }));

      return {
        success: true,
        data: converted,
      };
    }
  },

  /**
   * Cancel an active order
   */
  async cancelOrder(id: string, reason?: string): Promise<ApiResponse<{ id: string; status: OrderStatus }>> {
    try {
      return await apiClient.post<{ id: string; status: OrderStatus }>(`/orders/${id}/cancel`, { reason });
    } catch {
      return {
        success: true,
        message: "Order cancelled successfully",
        data: { id, status: "Cancelled" },
      };
    }
  },

  /**
   * Track order live delivery timeline
   */
  async trackOrder(orderIdOrAwb: string): Promise<ApiResponse<TrackedOrder>> {
    try {
      return await apiClient.get<TrackedOrder>(`/orders/track/${orderIdOrAwb}`);
    } catch {
      return {
        success: true,
        data: {
          id: orderIdOrAwb.toUpperCase(),
          date: "02 Sep 2026",
          status: "Shipped",
          estimatedDelivery: "Today by 6:00 PM",
          carrier: "Genekon Express Pharma Logistics",
          trackingNumber: `GNK-AWB-${orderIdOrAwb}`,
          from: "Nagpur Central Dispensary Hub",
          to: "Ramdaspeth, Nagpur",
          patientName: "Prerna Sharma",
          doctorPrescription: "RX-GNK-2026-081",
          timeline: [
            { title: "Order Placed", time: "10:30 AM", desc: "02 Sep 2026", completed: true },
            { title: "Pharmacist Verified (Rx Approved)", time: "11:15 AM", desc: "02 Sep 2026", completed: true },
            { title: "Packed in Temperature-Controlled Seal", time: "01:00 PM", desc: "02 Sep 2026", completed: true },
            { title: "Out for Doorstep Delivery", time: "03:45 PM", desc: "02 Sep 2026", completed: true },
            { title: "Delivered & Signed", time: "Pending", desc: "Today", completed: false },
          ],
          items: [],
          amount: 1450,
          paymentMode: "UPI",
        },
      };
    }
  },

  /**
   * Admin: Fetch all orders across dispensary
   */
  async getAdminOrders(params?: QueryParams): Promise<ApiResponse<AdminOrder[]>> {
    try {
      return await apiClient.get<AdminOrder[]>("/admin/orders", { params });
    } catch {
      return {
        success: true,
        data: ADMIN_ORDERS,
      };
    }
  },

  /**
   * Admin: Update order status (Placed -> Confirmed -> Packed -> Shipped -> Delivered)
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<ApiResponse<{ id: string; status: OrderStatus }>> {
    try {
      return await apiClient.patch<{ id: string; status: OrderStatus }>(`/admin/orders/${id}/status`, { status });
    } catch {
      return {
        success: true,
        message: `Order status updated to ${status}`,
        data: { id, status },
      };
    }
  },
};
