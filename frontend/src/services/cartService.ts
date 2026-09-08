import { CartItem, CartTotals, CouponCode } from "@/types/cart";

const CART_STORAGE_KEY = "genekon_cart_v1";

export const AVAILABLE_COUPONS: CouponCode[] = [
  {
    code: "GENEKON20",
    discountType: "Percentage",
    discountValue: 20,
    minOrderValue: 499,
    maxDiscount: 300,
    description: "Get 20% OFF on all medicines & health essentials (Min Order ₹499)",
  },
  {
    code: "FIRSTMED",
    discountType: "Fixed",
    discountValue: 150,
    minOrderValue: 699,
    description: "Flat ₹150 OFF on your first healthcare order (Min Order ₹699)",
  },
  {
    code: "BULK500",
    discountType: "Fixed",
    discountValue: 500,
    minOrderValue: 2999,
    description: "Flat ₹500 OFF on wellness & bulk medicine packs (Min Order ₹2,999)",
  },
  {
    code: "MONSOON10",
    discountType: "Percentage",
    discountValue: 10,
    minOrderValue: 299,
    maxDiscount: 100,
    description: "10% OFF on monsoon immunity and OTC remedies (Min Order ₹299)",
  },
];

export const INITIAL_DEFAULT_ITEMS: CartItem[] = [
  {
    id: "cart-item-1",
    productId: "prod-1",
    name: "Cetaphil Gentle Skin Cleanser",
    brand: "Cetaphil",
    variant: "500 ml",
    price: 475,
    originalPrice: 579,
    discount: 18,
    quantity: 1,
    stockQuantity: 45,
    image: "/images/products/cetaphil-cleanser-v2.jpg",
    prescriptionRequired: false,
    selected: true,
  },
  {
    id: "cart-item-2",
    productId: "prod-3",
    name: "Dr. Morepen Digital Thermometer",
    brand: "Dr. Morepen",
    variant: "1 Unit",
    price: 299,
    originalPrice: 330,
    discount: 10,
    quantity: 1,
    stockQuantity: 80,
    image: "/images/products/dr-morepen-thermometer-v2.jpg",
    prescriptionRequired: false,
    selected: true,
  },
  {
    id: "cart-item-3",
    productId: "prod-2",
    name: "HealthKart Multivitamin Tablets",
    brand: "HealthKart",
    variant: "60 Tablets",
    price: 599,
    originalPrice: 699,
    discount: 15,
    quantity: 1,
    stockQuantity: 120,
    image: "/images/products/healthkart-multivitamin-v2.jpg",
    prescriptionRequired: false,
    selected: true,
  },
];

export const cartService = {
  getStoredItems(): CartItem[] {
    if (typeof window === "undefined") return INITIAL_DEFAULT_ITEMS;
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_ITEMS));
        return INITIAL_DEFAULT_ITEMS;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.items)) return parsed.items;
      return INITIAL_DEFAULT_ITEMS;
    } catch {
      return INITIAL_DEFAULT_ITEMS;
    }
  },

  saveItems(items: CartItem[]): void {
    if (typeof window === "undefined") return;
    try {
      const safeItems = Array.isArray(items) ? items : [];
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(safeItems));
    } catch (err) {
      console.error("Failed to save cart to localStorage", err);
    }
  },

  validateCoupon(
    code: string,
    subtotal: number
  ): { valid: boolean; coupon?: CouponCode; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);

    if (!found) {
      return {
        valid: false,
        error: `Coupon code "${cleanCode}" is invalid or expired.`,
      };
    }

    if (subtotal < found.minOrderValue) {
      return {
        valid: false,
        error: `Coupon "${cleanCode}" requires a minimum order of ₹${found.minOrderValue}.`,
      };
    }

    return { valid: true, coupon: found };
  },

  calculateTotals(
    items: CartItem[],
    appliedCoupon: CouponCode | null = null,
    deliveryType: "standard" | "express" = "standard"
  ): CartTotals {
    const safeItems: CartItem[] = Array.isArray(items)
      ? items
      : items && Array.isArray((items as any).items)
      ? (items as any).items
      : [];

    const selectedItems = safeItems.filter((item) => item && item.selected);
    const itemCount = selectedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const subtotal = selectedItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );

    const originalTotal = selectedItems.reduce(
      (sum, item) => sum + (item.originalPrice || item.price || 0) * (item.quantity || 1),
      0
    );

    const baseDiscount = Math.max(0, originalTotal - subtotal);

    let couponDiscount = 0;
    if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
      if (appliedCoupon.discountType === "Percentage") {
        const raw = (subtotal * appliedCoupon.discountValue) / 100;
        couponDiscount = appliedCoupon.maxDiscount
          ? Math.min(raw, appliedCoupon.maxDiscount)
          : raw;
      } else {
        couponDiscount = appliedCoupon.discountValue;
      }
      couponDiscount = Math.min(couponDiscount, subtotal);
    }

    const freeDeliveryThreshold = 499;
    let deliveryCost = 0;
    if (selectedItems.length > 0) {
      if (deliveryType === "express") {
        deliveryCost = 40;
      } else {
        deliveryCost = subtotal >= freeDeliveryThreshold ? 0 : 35;
      }
    }

    const amountNeededForFreeDelivery = Math.max(
      0,
      freeDeliveryThreshold - subtotal
    );

    const totalAmount = Math.max(0, subtotal - couponDiscount + deliveryCost);

    return {
      itemCount,
      subtotal,
      discount: baseDiscount,
      couponDiscount: Math.round(couponDiscount),
      deliveryCost,
      freeDeliveryThreshold,
      amountNeededForFreeDelivery,
      totalAmount: Math.round(totalAmount),
      appliedCoupon,
    };
  },
};
