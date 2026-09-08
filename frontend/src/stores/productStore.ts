"use client";

import { useSyncExternalStore } from "react";
import { Product } from "@/types/product";
import { ALL_PRODUCTS } from "@/data/products";

export interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: "all" | "under-200" | "200-500" | "500-1000" | "above-1000";
  minDiscount: number;
  inStockOnly: boolean;
  rxRequirement: "all" | "otc" | "rx";
}

export type SortOption = "popularity" | "price-low" | "price-high" | "rating" | "newest";

interface ProductStoreState {
  products: Product[];
  searchQuery: string;
  recentSearches: string[];
  filters: FilterState;
  sortBy: SortOption;
}

const RECENT_SEARCHES_KEY = "genekon_recent_searches_v1";

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  brands: [],
  priceRange: "all",
  minDiscount: 0,
  inStockOnly: false,
  rxRequirement: "all",
};

function getStoredRecentSearches(): string[] {
  if (typeof window === "undefined") return ["Vitamin D", "Paracetamol", "Cetaphil", "Blood Pressure"];
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : ["Vitamin D", "Paracetamol", "Cetaphil", "Blood Pressure"];
  } catch {
    return ["Vitamin D", "Paracetamol", "Cetaphil", "Blood Pressure"];
  }
}

let state: ProductStoreState = {
  products: ALL_PRODUCTS,
  searchQuery: "",
  recentSearches: getStoredRecentSearches(),
  filters: DEFAULT_FILTERS,
  sortBy: "popularity",
};

const listeners = new Set<() => void>();

function emitChange() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(state.recentSearches)
      );
    } catch (err) {
      console.error("Failed to persist recent searches", err);
    }
  }
  listeners.forEach((listener) => listener());
}

export const productStore = {
  getSnapshot(): ProductStoreState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setSearchQuery(query: string): void {
    state = { ...state, searchQuery: query };
    emitChange();
  },

  addRecentSearch(term: string): void {
    const clean = term.trim();
    if (!clean) return;
    const filtered = state.recentSearches.filter(
      (s) => s.toLowerCase() !== clean.toLowerCase()
    );
    state = {
      ...state,
      recentSearches: [clean, ...filtered].slice(0, 8),
    };
    emitChange();
  },

  clearRecentSearches(): void {
    state = { ...state, recentSearches: [] };
    emitChange();
  },

  removeRecentSearch(term: string): void {
    state = {
      ...state,
      recentSearches: state.recentSearches.filter((s) => s !== term),
    };
    emitChange();
  },

  setFilters(updates: Partial<FilterState>): void {
    state = {
      ...state,
      filters: { ...state.filters, ...updates },
    };
    emitChange();
  },

  toggleCategory(category: string): void {
    const exists = state.filters.categories.includes(category);
    const updated = exists
      ? state.filters.categories.filter((c) => c !== category)
      : [...state.filters.categories, category];
    state = {
      ...state,
      filters: { ...state.filters, categories: updated },
    };
    emitChange();
  },

  toggleBrand(brand: string): void {
    const exists = state.filters.brands.includes(brand);
    const updated = exists
      ? state.filters.brands.filter((b) => b !== brand)
      : [...state.filters.brands, brand];
    state = {
      ...state,
      filters: { ...state.filters, brands: updated },
    };
    emitChange();
  },

  resetFilters(): void {
    state = {
      ...state,
      filters: DEFAULT_FILTERS,
      searchQuery: "",
    };
    emitChange();
  },

  setSortBy(sort: SortOption): void {
    state = { ...state, sortBy: sort };
    emitChange();
  },

  /**
   * Generates live suggestions matching query across name, brand, category, and composition.
   */
  getSuggestions(query: string): Product[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return state.products
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.composition.toLowerCase().includes(q) ||
          (p.genericName && p.genericName.toLowerCase().includes(q))
        );
      })
      .slice(0, 6);
  },

  /**
   * Filters and sorts the complete product catalog according to active store state.
   */
  getFilteredProducts(): Product[] {
    const { products, searchQuery, filters, sortBy } = state;
    let list = [...products];

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.composition.toLowerCase().includes(q) ||
          (p.genericName && p.genericName.toLowerCase().includes(q))
      );
    }

    // Categories
    if (filters.categories.length > 0) {
      list = list.filter((p) => filters.categories.includes(p.category));
    }

    // Brands
    if (filters.brands.length > 0) {
      list = list.filter((p) => filters.brands.includes(p.brand));
    }

    // Price
    if (filters.priceRange !== "all") {
      if (filters.priceRange === "under-200") list = list.filter((p) => p.price < 200);
      else if (filters.priceRange === "200-500")
        list = list.filter((p) => p.price >= 200 && p.price <= 500);
      else if (filters.priceRange === "500-1000")
        list = list.filter((p) => p.price > 500 && p.price <= 1000);
      else if (filters.priceRange === "above-1000") list = list.filter((p) => p.price > 1000);
    }

    // Minimum Discount
    if (filters.minDiscount > 0) {
      list = list.filter((p) => (p.discount || p.discountPercent || 0) >= filters.minDiscount);
    }

    // In Stock Only
    if (filters.inStockOnly) {
      list = list.filter((p) => p.stockStatus === "In Stock" || p.inStock);
    }

    // Rx Requirement
    if (filters.rxRequirement === "otc") {
      list = list.filter((p) => !p.prescriptionRequired);
    } else if (filters.rxRequirement === "rx") {
      list = list.filter((p) => p.prescriptionRequired);
    }

    // Sorting
    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "newest") {
      list.reverse();
    }

    return list;
  },
};

export function useProductStore() {
  const snapshot = useSyncExternalStore(
    productStore.subscribe,
    productStore.getSnapshot,
    () => ({
      products: ALL_PRODUCTS,
      searchQuery: "",
      recentSearches: [],
      filters: DEFAULT_FILTERS,
      sortBy: "popularity" as SortOption,
    })
  );

  const filteredProducts = productStore.getFilteredProducts();

  return {
    ...snapshot,
    filteredProducts,
    setSearchQuery: productStore.setSearchQuery.bind(productStore),
    addRecentSearch: productStore.addRecentSearch.bind(productStore),
    clearRecentSearches: productStore.clearRecentSearches.bind(productStore),
    removeRecentSearch: productStore.removeRecentSearch.bind(productStore),
    setFilters: productStore.setFilters.bind(productStore),
    toggleCategory: productStore.toggleCategory.bind(productStore),
    toggleBrand: productStore.toggleBrand.bind(productStore),
    resetFilters: productStore.resetFilters.bind(productStore),
    setSortBy: productStore.setSortBy.bind(productStore),
    getSuggestions: productStore.getSuggestions.bind(productStore),
  };
}
