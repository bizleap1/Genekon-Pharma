export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  images: string[];
  description: string;
  composition: string;
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  stockStatus: StockStatus;
  stockQuantity: number;
  prescriptionRequired: boolean;
  variants: ProductVariant[];
  quantity: number; // Pack/unit size or default quantity

  // Compatibility & secondary attributes
  image: string; // primary image thumbnail
  genericName?: string;
  originalPrice?: number;
  discountPercent?: number;
  reviewCount?: number;
  inStock: boolean;
  dosageForm?: string;
  packSize?: string;
  tag?: string;
  "stock status"?: StockStatus;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  itemCount?: number;
  iconName?: string;
  image?: string;
  isPopular?: boolean;
  description?: string;
}

export interface HealthConcern {
  id: string;
  title: string;
  slug: string;
  description: string;
  itemCount: number;
  iconName: string;
  badge?: string;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  badge?: string;
}

export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  badge?: string;
  isSpecial?: boolean;
}
