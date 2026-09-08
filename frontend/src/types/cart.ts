export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  variant: string;
  price: number;
  originalPrice: number;
  mrp?: number;
  discount: number;
  quantity: number;
  stockQuantity: number;
  image: string;
  prescriptionRequired?: boolean;
  selected: boolean;
}

export interface CouponCode {
  code: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  description: string;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  deliveryCost: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  totalAmount: number;
  appliedCoupon: CouponCode | null;
}

export interface CheckoutFormData {
  mobileNumber: string;
  fullName: string;
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: "home" | "work" | "clinic";
  deliveryType: "standard" | "express";
  paymentMethod: "upi" | "card" | "netbanking" | "cod";
  whatsappUpdates: boolean;
}

export interface FormValidationErrors {
  mobileNumber?: string;
  fullName?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentMethod?: string;
}
