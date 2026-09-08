export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type ProductSortOption =
  | "popularity"
  | "price-low"
  | "price-high"
  | "latest"
  | "relevance"
  | "rating";

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  stock: number;
}

export interface Product {
  // Core pharmacy identifiers
  id: string;
  name: string;
  brand: string;
  manufacturer: string;
  category: string;
  subCategory: string;
  composition: string;
  description: string;
  usage: string;
  precautions: string;
  images: string[];
  mrp: number;
  sellingPrice: number;
  discount: number;
  gst: number;
  stockStatus: StockStatus;
  quantity: number; // pack size or count
  sku: string;
  batchNumber: string;
  expiryDate: string;
  prescriptionRequired: boolean;
  storageInstructions: string;

  // Compatibility & UI fields
  price: number; // mirrors sellingPrice
  image: string; // primary thumbnail
  genericName?: string;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount?: number;
  stockQuantity: number;
  inStock: boolean;
  dosageForm?: string;
  packSize?: string;
  tag?: string;
  variants: ProductVariant[];
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
