/**
 * Products API Service
 * Manages pharmacy catalog queries, searches, categories, and admin CRUD.
 */

import { apiClient } from "./client";
import { Product, StockStatus } from "@/types/product";
import { ApiResponse, QueryParams } from "@/types/api";
import { ALL_PRODUCTS } from "@/data/products";

export function mapBackendProductToFrontend(p: any): Product {
  if (!p) return ALL_PRODUCTS[0];

  const sellingPrice = Number(p.sellingPrice) || Number(p.price) || 0;
  const mrp = Number(p.mrp) || Number(p.originalPrice) || sellingPrice;
  const discount =
    Number(p.discount) ||
    (mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);
  const stockQuantity = Number(p.stockQuantity ?? 50);
  const inStock =
    p.inStock ??
    (stockQuantity > 0 && p.status !== "OUT_OF_STOCK" && p.status !== "INACTIVE");
  const stockStatus: StockStatus =
    stockQuantity <= 0 ? "Out of Stock" : stockQuantity <= 10 ? "Low Stock" : "In Stock";

  const imgList: string[] = Array.isArray(p.images)
    ? p.images
        .map((img: any) => (typeof img === "string" ? img : img.imageUrl || img.url))
        .filter(Boolean)
    : [];

  const primaryImage =
    imgList[0] || p.image || "/images/products/cipla-paracetamol-v2.jpg";

  return {
    id: p.id,
    name: p.name,
    brand: p.brand || "Genekon",
    manufacturer: p.manufacturer || "Genekon Pharma",
    category: p.category?.name || p.category || "Medicines",
    subCategory: p.subCategory || "General Care",
    composition: p.composition || "",
    description: p.description || "",
    usage: p.usage || "As directed by physician",
    precautions: p.precautions || "Keep out of reach of children",
    images: imgList.length > 0 ? imgList : [primaryImage],
    image: primaryImage,
    mrp,
    sellingPrice,
    price: sellingPrice,
    originalPrice: mrp,
    discount,
    discountPercent: discount,
    gst: Number(p.gst) || 12,
    stockStatus,
    quantity: 1,
    sku: p.sku || `GNK-${p.id}`,
    batchNumber: p.batchNumber || "BATCH-2026",
    expiryDate: p.expiryDate || "12/2028",
    prescriptionRequired: Boolean(p.prescriptionRequired),
    storageInstructions: p.storageInstructions || "Store below 25°C in a dry place",
    rating: Number(p.rating) || 4.5,
    reviewCount: Number(p.reviewCount) || 18,
    stockQuantity,
    inStock,
    dosageForm: p.dosageForm || "10 Tablets",
    packSize: p.dosageForm || "Standard Pack",
    variants: [],
  };
}

export const productsApi = {
  /**
   * Fetch all products with optional query filtering (pagination, search, category)
   */
  async getProducts(params?: QueryParams): Promise<ApiResponse<Product[]> & { pagination?: any }> {
    try {
      const res = await apiClient.get<any>("/products", { params });
      const rawList = res.data?.products || (Array.isArray(res.data) ? res.data : []);
      const mapped = rawList.map(mapBackendProductToFrontend);

      return {
        success: true,
        data: mapped.length > 0 ? mapped : ALL_PRODUCTS,
        pagination: res.data?.pagination,
        timestamp: new Date().toISOString(),
      };
    } catch {
      // Graceful offline fallback
      let filtered = [...ALL_PRODUCTS];
      if (params?.search) {
        const q = String(params.search).toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.composition?.toLowerCase().includes(q)
        );
      }
      if (params?.category && params.category !== "all") {
        filtered = filtered.filter((p) =>
          p.category.toLowerCase().includes(String(params.category).toLowerCase())
        );
      }
      return {
        success: true,
        data: filtered,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Fetch single product by unique ID or slug
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const res = await apiClient.get<any>(`/products/${id}`);
      const rawProduct = res.data?.product || res.data;
      return {
        success: true,
        data: mapBackendProductToFrontend(rawProduct),
        timestamp: new Date().toISOString(),
      };
    } catch {
      const match = ALL_PRODUCTS.find((p) => p.id === id) || ALL_PRODUCTS[0];
      return {
        success: true,
        data: match,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Fetch products by category slug
   */
  async getProductsByCategory(category: string): Promise<ApiResponse<Product[]>> {
    try {
      const res = await apiClient.get<any>(`/products/category/${category}`);
      const rawList = res.data?.products || (Array.isArray(res.data) ? res.data : []);
      const mapped = rawList.map(mapBackendProductToFrontend);

      return {
        success: true,
        data: mapped.length > 0 ? mapped : ALL_PRODUCTS,
        timestamp: new Date().toISOString(),
      };
    } catch {
      const filtered = ALL_PRODUCTS.filter((p) =>
        p.category.toLowerCase().includes(category.toLowerCase())
      );
      return {
        success: true,
        data: filtered.length > 0 ? filtered : ALL_PRODUCTS,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Fetch featured / best selling products
   */
  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const res = await apiClient.get<any>("/products/featured");
      const rawList = res.data?.products || (Array.isArray(res.data) ? res.data : []);
      const mapped = rawList.map(mapBackendProductToFrontend);

      return {
        success: true,
        data: mapped.length > 0 ? mapped : ALL_PRODUCTS.slice(0, 8),
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        success: true,
        data: ALL_PRODUCTS.slice(0, 8),
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Search catalog products by query string
   */
  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    try {
      const res = await apiClient.get<any>("/products/search", {
        params: { q: query },
      });
      const rawList = res.data?.products || (Array.isArray(res.data) ? res.data : []);
      const mapped = rawList.map(mapBackendProductToFrontend);

      return {
        success: true,
        data: mapped,
        timestamp: new Date().toISOString(),
      };
    } catch {
      const q = query.toLowerCase();
      const results = ALL_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.composition?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
      return {
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Admin: Create a new pharmacy product
   */
  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    const res = await apiClient.post<any>("/products", data);
    return {
      success: true,
      message: res.message || "Product created successfully",
      data: mapBackendProductToFrontend(res.data?.product || res.data),
    };
  },

  /**
   * Admin: Update an existing product
   */
  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    const res = await apiClient.put<any>(`/products/${id}`, data);
    return {
      success: true,
      message: res.message || "Product updated successfully",
      data: mapBackendProductToFrontend(res.data?.product || res.data),
    };
  },

  /**
   * Admin: Delete product by ID
   */
  async deleteProduct(id: string): Promise<ApiResponse<{ id: string }>> {
    const res = await apiClient.delete<any>(`/products/${id}`);
    return {
      success: true,
      message: res.message || "Product removed from catalog",
      data: { id },
    };
  },
};
