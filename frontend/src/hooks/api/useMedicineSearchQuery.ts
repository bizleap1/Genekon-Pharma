"use client";

import { useQuery } from "../useQuery";
import { productsApi } from "@/api/products";
import { MedicineSearchPayload } from "@/types/product";

/**
 * Fetch generic-first structured medicine search results
 */
export function useMedicineSearchQuery(query: string, strength?: string) {
  return useQuery<MedicineSearchPayload>(
    ["medicine-search", query, strength],
    async () => {
      const res = await productsApi.medicineSearch(query, strength);
      return res.data;
    },
    { enabled: Boolean(query.trim()), staleTime: 60000 }
  );
}
