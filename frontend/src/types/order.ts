import { CartItem, CartTotals, CheckoutFormData } from "./cart";

export type OrderStatus =
  | "Placed"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus = "Paid" | "Pending" | "Refunded" | "Failed";

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

export interface OrderItem {
  id?: string;
  name: string;
  brand: string;
  variant?: string;
  quantity: number;
  price: number;
  mrp?: number;
  image: string;
  batchNumber?: string;
}

export interface PlacedOrder {
  orderId: string;
  userId?: string;
  userEmail?: string;
  userPhone?: string;
  date: string;
  items: CartItem[];
  totals: CartTotals;
  formData: CheckoutFormData;
  status: OrderStatus;
  estimatedDelivery: string;
  trackingNumber?: string;
  cancellationRequest?: any;
}

export interface TimelineEvent {
  title: string;
  time: string;
  completed: boolean;
  desc?: string;
}

export interface TrackedOrder {
  id: string;
  date: string;
  status: OrderStatus;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  from: string;
  to: string;
  patientName: string;
  doctorPrescription: string;
  timeline: TimelineEvent[];
  items: OrderItem[];
  amount: number;
  paymentMode: string;
}
