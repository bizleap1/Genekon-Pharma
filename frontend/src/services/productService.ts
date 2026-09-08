import { Product } from "@/types/product";
import { ALL_PRODUCTS, POPULAR_PRODUCTS, WELLNESS_PRODUCTS } from "@/data/products";

export interface ProductFilterOptions {
  query?: string;
  categories?: string[];
  brands?: string[];
  priceBracket?: "all" | "under-200" | "200-500" | "500-1000" | "above-1000";
  minDiscount?: number;
  inStockOnly?: boolean;
  rxRequirement?: "all" | "otc" | "rx";
  sortBy?: "relevance" | "price-low" | "price-high" | "rating";
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    // Simulated async fetch to enable seamless backend switch
    return new Promise((resolve) => {
      setTimeout(() => resolve([...ALL_PRODUCTS]), 50);
    });
  },

  async getProductById(id: string): Promise<Product | null> {
    return new Promise((resolve) => {
      const found = ALL_PRODUCTS.find((p) => p.id === id) || null;
      setTimeout(() => resolve(found), 50);
    });
  },

  async getFeaturedProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...POPULAR_PRODUCTS]), 50);
    });
  },

  async getWellnessProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...WELLNESS_PRODUCTS]), 50);
    });
  },

  async searchProducts(filters: ProductFilterOptions): Promise<Product[]> {
    return new Promise((resolve) => {
      let results = [...ALL_PRODUCTS];

      // Query search
      if (filters.query?.trim()) {
        const q = filters.query.toLowerCase().trim();
        results = results.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.genericName?.toLowerCase().includes(q) ||
            p.composition?.toLowerCase().includes(q)
        );
      }

      // Categories filter
      if (filters.categories && filters.categories.length > 0) {
        results = results.filter((p) => filters.categories!.includes(p.category));
      }

      // Brands filter
      if (filters.brands && filters.brands.length > 0) {
        results = results.filter((p) => filters.brands!.includes(p.brand));
      }

      // Price bracket filter
      if (filters.priceBracket && filters.priceBracket !== "all") {
        if (filters.priceBracket === "under-200") results = results.filter((p) => p.price < 200);
        if (filters.priceBracket === "200-500")
          results = results.filter((p) => p.price >= 200 && p.price <= 500);
        if (filters.priceBracket === "500-1000")
          results = results.filter((p) => p.price > 500 && p.price <= 1000);
        if (filters.priceBracket === "above-1000") results = results.filter((p) => p.price > 1000);
      }

      // Discount filter
      if (filters.minDiscount && filters.minDiscount > 0) {
        results = results.filter(
          (p) => p.discountPercent && p.discountPercent >= filters.minDiscount!
        );
      }

      // In stock
      if (filters.inStockOnly) {
        results = results.filter((p) => p.inStock);
      }

      // Prescription filter
      if (filters.rxRequirement === "otc") {
        results = results.filter((p) => !p.prescriptionRequired);
      } else if (filters.rxRequirement === "rx") {
        results = results.filter((p) => p.prescriptionRequired);
      }

      // Sorting
      if (filters.sortBy === "price-low") {
        results.sort((a, b) => a.price - b.price);
      } else if (filters.sortBy === "price-high") {
        results.sort((a, b) => b.price - a.price);
      } else if (filters.sortBy === "rating") {
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      setTimeout(() => resolve(results), 80);
    });
  },
};
