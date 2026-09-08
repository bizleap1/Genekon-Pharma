"use client";

import { useQuery } from "../useQuery";
import { productsApi } from "@/api/products";
import { Product } from "@/types/product";
import { QueryParams } from "@/types/api";

/**
 * Fetch list of products with reactive filters
 */
export function useProductsQuery(params?: QueryParams) {
  return useQuery<Product[]>(
    ["products", params],
    async () => {
      const res = await productsApi.getProducts(params);
      return res.data;
    },
    { staleTime: 60000 }
  );
}

/**
 * Fetch single product detail by ID
 */
export function useProductQuery(productId: string) {
  return useQuery<Product>(
    ["product", productId],
    async () => {
      const res = await productsApi.getProductById(productId);
      return res.data;
    },
    { enabled: Boolean(productId), staleTime: 120000 }
  );
}

/**
 * Fetch products matching category slug
 */
export function useCategoryProductsQuery(categorySlug: string) {
  return useQuery<Product[]>(
    ["products", "category", categorySlug],
    async () => {
      const res = await productsApi.getProductsByCategory(categorySlug);
      return res.data;
    },
    { enabled: Boolean(categorySlug), staleTime: 60000 }
  );
}
