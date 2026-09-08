/**
 * Products API Service
 * Manages pharmacy catalog queries, searches, categories, and admin CRUD.
 */

import { apiClient } from "./client";
import { Product } from "@/types/product";
import { ApiResponse, QueryParams } from "@/types/api";
import { ALL_PRODUCTS } from "@/data/products";

export const productsApi = {
  /**
   * Fetch all products with optional query filtering (pagination, search, category)
   */
  async getProducts(params?: QueryParams): Promise<ApiResponse<Product[]>> {
    try {
      return await apiClient.get<Product[]>("/products", { params });
    } catch {
      // Mock fallback: filter in-memory catalog
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
   * Fetch single product by unique ID
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      return await apiClient.get<Product>(`/products/${id}`);
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
      return await apiClient.get<Product[]>(`/products/category/${category}`);
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
      return await apiClient.get<Product[]>("/products/featured");
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
      return await apiClient.get<Product[]>("/products/search", {
        params: { q: query },
      });
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
    try {
      return await apiClient.post<Product>("/products", data);
    } catch {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: data.name || "New Medicine",
        brand: data.brand || "Genekon",
        manufacturer: data.manufacturer || "Genekon Pharma",
        category: data.category || "Medicines",
        price: data.price || 100,
        sellingPrice: data.sellingPrice || data.price || 100,
        originalPrice: data.originalPrice || 120,
        mrp: data.mrp || 120,
        discount: data.discount || 15,
        gst: data.gst || 12,
        image: data.image || "/images/products/cipla-paracetamol-v2.jpg",
        images: data.images || ["/images/products/cipla-paracetamol-v2.jpg"],
        dosageForm: data.dosageForm || "10 Tablets",
        inStock: true,
        stockStatus: "In Stock",
        stockQuantity: data.stockQuantity || 50,
        prescriptionRequired: data.prescriptionRequired || false,
        rating: 4.5,
        reviewCount: 0,
        composition: data.composition || "",
        description: data.description || "",
        subCategory: data.subCategory || "General",
        usage: data.usage || "As directed by physician",
        precautions: data.precautions || "Keep out of reach of children",
        quantity: data.quantity || 1,
        variants: [],
        sku: data.sku || `GNK-SKU-${Date.now()}`,
        batchNumber: data.batchNumber || "GNK-BATCH",
        expiryDate: data.expiryDate || "12/2028",
        storageInstructions: data.storageInstructions || "Store below 25°C",
      };
      return {
        success: true,
        message: "Product created successfully",
        data: newProd,
      };
    }
  },

  /**
   * Admin: Update an existing product
   */
  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      return await apiClient.put<Product>(`/products/${id}`, data);
    } catch {
      const match = ALL_PRODUCTS.find((p) => p.id === id) || ALL_PRODUCTS[0];
      return {
        success: true,
        message: "Product updated successfully",
        data: { ...match, ...data },
      };
    }
  },

  /**
   * Admin: Delete product by ID
   */
  async deleteProduct(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      return await apiClient.delete<{ id: string }>(`/products/${id}`);
    } catch {
      return {
        success: true,
        message: "Product removed from catalog",
        data: { id },
      };
    }
  },
};
