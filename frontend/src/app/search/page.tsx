"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { ALL_PRODUCTS } from "@/data/products";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [discountFilter, setDiscountFilter] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [rxFilter, setRxFilter] = useState<"all" | "otc" | "rx">("all");
  const [sortBy, setSortBy] = useState<"relevance" | "price-low" | "price-high" | "rating">("relevance");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract unique filter facets from catalog
  const categories = useMemo(() => {
    const set = new Set<string>();
    ALL_PRODUCTS.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, []);

  const brands = useMemo(() => {
    const set = new Set<string>();
    ALL_PRODUCTS.forEach((p) => set.add(p.brand));
    return Array.from(set);
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((product) => {
      // Query match
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesCat = product.category.toLowerCase().includes(q);
        const matchesGeneric = product.genericName?.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesCat && !matchesGeneric) {
          return false;
        }
      }

      // Category match
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }

      // Brand match
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      // Price match
      if (priceFilter === "under-200" && product.price >= 200) return false;
      if (priceFilter === "200-500" && (product.price < 200 || product.price > 500)) return false;
      if (priceFilter === "500-1000" && (product.price < 500 || product.price > 1000)) return false;
      if (priceFilter === "above-1000" && product.price <= 1000) return false;

      // Discount match
      if (discountFilter > 0 && (!product.discountPercent || product.discountPercent < discountFilter)) {
        return false;
      }

      // In stock match
      if (inStockOnly && !product.inStock) {
        return false;
      }

      // Rx match
      if (rxFilter === "otc" && product.prescriptionRequired) return false;
      if (rxFilter === "rx" && !product.prescriptionRequired) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0; // relevance
    });
  }, [query, selectedCategories, selectedBrands, priceFilter, discountFilter, inStockOnly, rxFilter, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceFilter("all");
    setDiscountFilter(0);
    setInStockOnly(false);
    setRxFilter("all");
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    (priceFilter !== "all" ? 1 : 0) +
    (discountFilter > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (rxFilter !== "all" ? 1 : 0);

  // Render Sidebar Filter Content
  const renderFiltersContent = () => (
    <div className="space-y-6">
      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="pb-4 border-b border-[#E3EDE1]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14304A]">
              Active Filters ({activeFilterCount})
            </span>
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#559620] hover:underline font-bold cursor-pointer"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedCategories.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 text-[11px] bg-[#EDF7E9] text-[#447719] px-2 py-0.5 rounded-full font-semibold"
              >
                {c}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => toggleCategory(c)}
                />
              </span>
            ))}
            {selectedBrands.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 text-[11px] bg-[#EDF7E9] text-[#447719] px-2 py-0.5 rounded-full font-semibold"
              >
                {b}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => toggleBrand(b)}
                />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A] mb-2.5">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const checked = selectedCategories.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center gap-2 text-xs text-[#435746] hover:text-[#14304A] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(cat)}
                  className="rounded border-[#C5D6C7] text-[#559620] focus:ring-[#559620] h-3.5 w-3.5"
                />
                <span>{cat}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="pt-4 border-t border-[#E3EDE1]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A] mb-2.5">
          Brands
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {brands.map((brand) => {
            const checked = selectedBrands.includes(brand);
            return (
              <label
                key={brand}
                className="flex items-center gap-2 text-xs text-[#435746] hover:text-[#14304A] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleBrand(brand)}
                  className="rounded border-[#C5D6C7] text-[#559620] focus:ring-[#559620] h-3.5 w-3.5"
                />
                <span>{brand}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="pt-4 border-t border-[#E3EDE1]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A] mb-2.5">
          Price Range
        </h4>
        <div className="space-y-1.5">
          {[
            { id: "all", label: "All Prices" },
            { id: "under-200", label: "Under ₹200" },
            { id: "200-500", label: "₹200 - ₹500" },
            { id: "500-1000", label: "₹500 - ₹1,000" },
            { id: "above-1000", label: "Above ₹1,000" },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 text-xs text-[#435746] hover:text-[#14304A] cursor-pointer"
            >
              <input
                type="radio"
                name="priceFilter"
                checked={priceFilter === item.id}
                onChange={() => setPriceFilter(item.id)}
                className="text-[#559620] focus:ring-[#559620] h-3.5 w-3.5"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Prescription Requirement */}
      <div className="pt-4 border-t border-[#E3EDE1]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A] mb-2.5">
          Prescription
        </h4>
        <div className="space-y-1.5">
          {[
            { id: "all", label: "All Medicines" },
            { id: "otc", label: "Over the Counter (No Rx)" },
            { id: "rx", label: "Prescription Required (Rx)" },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 text-xs text-[#435746] hover:text-[#14304A] cursor-pointer"
            >
              <input
                type="radio"
                name="rxFilter"
                checked={rxFilter === item.id}
                onChange={() => setRxFilter(item.id as "all" | "otc" | "rx")}
                className="text-[#559620] focus:ring-[#559620] h-3.5 w-3.5"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Discount Slabs */}
      <div className="pt-4 border-t border-[#E3EDE1]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A] mb-2.5">
          Discount
        </h4>
        <div className="space-y-1.5">
          {[
            { id: 0, label: "All Discounts" },
            { id: 10, label: "10% and above" },
            { id: 15, label: "15% and above" },
            { id: 20, label: "20% and above" },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 text-xs text-[#435746] hover:text-[#14304A] cursor-pointer"
            >
              <input
                type="radio"
                name="discountFilter"
                checked={discountFilter === item.id}
                onChange={() => setDiscountFilter(item.id)}
                className="text-[#559620] focus:ring-[#559620] h-3.5 w-3.5"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="pt-4 border-t border-[#E3EDE1]">
        <label className="flex items-center gap-2 text-xs text-[#435746] font-semibold hover:text-[#14304A] cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded border-[#C5D6C7] text-[#559620] focus:ring-[#559620] h-3.5 w-3.5"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFA]">
      <UtilityBar />
      <Header />
      <CategoryNav />

      <main className="flex-1 py-6 sm:py-8">
        <Container>
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#6F8271] mb-5">
            <Link href="/" className="hover:text-[#14304A] transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-[#14304A] font-semibold">Search Results</span>
          </nav>

          {/* Search Header Bar */}
          <div className="rounded-3xl border border-[#DDE7DC] bg-white p-6 sm:p-8 mb-8 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] tracking-tight">
                  {query ? `Search Results for "${query}"` : "Search All Healthcare Products"}
                </h1>
                <p className="text-xs sm:text-sm text-[#596E5C] mt-1">
                  Showing <span className="font-bold text-[#14304A]">{filteredProducts.length}</span> genuine healthcare items
                </p>
              </div>

              {/* In-page Search Input */}
              <div className="w-full md:w-80 relative flex items-center rounded-full border border-[#D5DFE6] bg-[#FAFCFB] px-3.5 py-1.5 focus-within:border-[#1E56A0] focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-[#8C9BA5] shrink-0 mr-2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by medicine or salt..."
                  className="w-full text-xs sm:text-sm text-[#14304A] bg-transparent outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1 text-[#8C9BA5] hover:text-[#14304A] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Layout Grid: Sidebar + Products Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Desktop Filters Sidebar (Span 3) */}
            <aside className="hidden lg:block lg:col-span-3 rounded-2xl border border-[#DCE8D8] bg-white p-5 shadow-2xs sticky top-24">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E3EDE1]">
                <div className="flex items-center gap-2 text-[#14304A] font-bold text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-[#559620]" />
                  <span>Filters</span>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-[#559620] hover:underline font-bold cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              {renderFiltersContent()}
            </aside>

            {/* Mobile Filter Button Bar */}
            <div className="lg:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#DCE8D8] mb-4">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 text-xs font-bold text-[#14304A] bg-[#F0F5F2] px-3 py-2 rounded-xl"
              >
                <Filter className="w-3.5 h-3.5 text-[#559620]" />
                <span>Filter Products {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#687C69]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-[#14304A] outline-none text-xs"
                >
                  <option value="relevance">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            {/* Products Main Area (Span 9) */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Desktop Sort Header */}
              <div className="hidden lg:flex items-center justify-between pb-3 border-b border-[#E3EDE1]">
                <p className="text-xs text-[#687C69]">
                  Showing <span className="font-bold text-[#14304A]">{filteredProducts.length}</span> results
                </p>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#687C69]">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white border border-[#D0DED3] rounded-lg px-2.5 py-1.5 font-bold text-[#14304A] outline-none text-xs focus:border-[#559620]"
                  >
                    <option value="relevance">Relevance &amp; Popularity</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                </div>
              </div>

              {/* Product Grid or Empty State */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-[#C5D6C7] bg-white p-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#F0F6EF] text-[#559620] mx-auto flex items-center justify-center mb-3">
                    <Search className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-[#14304A] font-bold">
                    No matching healthcare products found
                  </h3>
                  <p className="text-xs sm:text-sm text-[#667A68] max-w-md mx-auto mt-1 mb-5">
                    We couldn&apos;t find anything matching your search criteria. Try removing filters or searching by generic formula name.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}

              {/* Need Prescription Assistance Promo */}
              <div className="rounded-2xl border border-[#D7E4D3] bg-[#F3F8F1] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#14304A]">
                    Looking for a specific prescription medication?
                  </h4>
                  <p className="text-xs text-[#5D735F] mt-0.5">
                    Upload your prescription directly. Our licensed pharmacists will locate and prepare your order.
                  </p>
                </div>
                <Link
                  href="/prescription/upload"
                  className="px-4 py-2.5 rounded-xl bg-[#1853A8] hover:bg-[#123E7F] text-white text-xs font-bold transition-all shadow-xs shrink-0"
                >
                  Upload Prescription &rarr;
                </Link>
              </div>

            </div>

          </div>

        </Container>
      </main>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-xl flex flex-col z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E3EDE1]">
              <h3 className="font-serif text-lg font-bold text-[#14304A]">
                Filters
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-[#8C9C8F] hover:text-[#14304A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              {renderFiltersContent()}
            </div>
            <div className="pt-4 border-t border-[#E3EDE1] mt-6">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#559620] text-white font-bold text-xs"
              >
                Apply Filters ({filteredProducts.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFCFA]">
          <div className="animate-spin w-8 h-8 rounded-full border-2 border-[#559620] border-t-transparent" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
