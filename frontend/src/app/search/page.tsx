"use client";

import React, { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  RotateCcw,
  Pill,
  Info
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { useProductsQuery } from "@/hooks/api/useProductsQuery";
import { useMedicineSearchQuery } from "@/hooks/api/useMedicineSearchQuery";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const initialQuery = searchParams.get("q") || "";
  const initialStrength = searchParams.get("strength") || "";

  const [query, setQuery] = useState(initialQuery);
  const [strengthFilter, setStrengthFilter] = useState(initialStrength);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL if it changes externally
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setStrengthFilter(searchParams.get("strength") || "");
  }, [searchParams]);

  // Execute advanced search
  const { data: medicineSearchData, isLoading: isMedicineLoading } = useMedicineSearchQuery(query, strengthFilter);

  // Fallback normal search for non-medicine/empty queries
  const { data: allProducts, isLoading: isAllLoading } = useProductsQuery();

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    // Reset strength when new query typed
    if (query !== searchParams.get("q")) {
      params.delete("strength");
      setStrengthFilter("");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStrengthSelect = (st: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (st === strengthFilter) {
      params.delete("strength");
      setStrengthFilter("");
    } else {
      params.set("strength", st);
      setStrengthFilter(st);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const isSearchActive = !!query.trim();
  
  // Decide what to display
  let genericOptions: any[] = [];
  let exactMatches: any[] = [];
  let brandedAlternatives: any[] = [];
  let otherResults: any[] = [];
  let resolvedMedicine: any = null;

  if (isSearchActive && medicineSearchData) {
    genericOptions = medicineSearchData.genericProducts || [];
    exactMatches = medicineSearchData.exactMatches || [];
    brandedAlternatives = medicineSearchData.brandedAlternatives || [];
    otherResults = medicineSearchData.otherResults || [];
    resolvedMedicine = medicineSearchData.resolvedMedicine;
  } else if (!isSearchActive && allProducts) {
    otherResults = allProducts;
  }

  // Common Client-side filtering (applies to ALL sections)
  const applyFilters = (productsList: any[]) => {
    if (!productsList) return [];
    return productsList.filter(p => {
       if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
       if (inStockOnly && !p.inStock) return false;
       if (priceFilter === "under-200" && p.price >= 200) return false;
       if (priceFilter === "200-500" && (p.price < 200 || p.price > 500)) return false;
       if (priceFilter === "above-500" && p.price <= 500) return false;
       return true;
    });
  };

  genericOptions = applyFilters(genericOptions);
  exactMatches = applyFilters(exactMatches);
  brandedAlternatives = applyFilters(brandedAlternatives);
  otherResults = applyFilters(otherResults);

  const totalResults = genericOptions.length + exactMatches.length + brandedAlternatives.length + otherResults.length;

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceFilter("all");
    setInStockOnly(false);
  };

  // Render Sidebar
  const renderFiltersContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A] mb-2.5">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {["Medicines", "Vitamins & Supplements", "Personal Care", "Medical Devices"].map((cat) => {
            const checked = selectedCategories.includes(cat);
            return (
              <label
                key={cat}
                className="flex items-center gap-2 text-xs text-[#435746] hover:text-[#14304A] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                  className="rounded border-[#C5D6C7] text-[#559620] focus:ring-[#559620] h-3.5 w-3.5"
                />
                <span>{cat}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-[#E3EDE1]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A] mb-2.5">
          Price Range
        </h4>
        <div className="space-y-1.5">
          {[
            { id: "all", label: "All Prices" },
            { id: "under-200", label: "Under ₹200" },
            { id: "200-500", label: "₹200 - ₹500" },
            { id: "above-500", label: "Above ₹500" },
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
      <main className="flex-1 py-6 sm:py-8">
        <Container>
          
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
                  {searchParams.get("q") ? `Search Results for "${searchParams.get("q")}"` : "Search All Healthcare Products"}
                </h1>
                <p className="text-xs sm:text-sm text-[#596E5C] mt-1">
                  Showing <span className="font-bold text-[#14304A]">{totalResults}</span> items
                </p>
              </div>

              {/* In-page Search Input */}
              <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative flex items-center rounded-full border border-[#D5DFE6] bg-[#FAFCFB] px-3.5 py-1.5 focus-within:border-[#1E56A0] focus-within:bg-white transition-all">
                <button type="submit" className="shrink-0 mr-2 cursor-pointer">
                  <Search className="w-4 h-4 text-[#8C9BA5] hover:text-[#1E56A0]" />
                </button>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by medicine or salt..."
                  className="w-full text-xs sm:text-sm text-[#14304A] bg-transparent outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setStrengthFilter(""); }}
                    className="p-1 text-[#8C9BA5] hover:text-[#14304A] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>

            {/* Structured Medicine UI (Strength Selector) */}
            {resolvedMedicine && (
              <div className="mt-6 pt-5 border-t border-[#E3EDE1]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-[#EDF7E9] flex items-center justify-center shrink-0">
                       <Pill className="w-4 h-4 text-[#559620]" />
                     </div>
                     <div>
                       <span className="text-[10px] text-[#637766] font-bold uppercase tracking-wider block">Resolved Active Ingredient</span>
                       <span className="text-sm font-bold text-[#14304A]">{resolvedMedicine.composition}</span>
                     </div>
                  </div>

                  {resolvedMedicine.availableStrengths && resolvedMedicine.availableStrengths.length > 0 && (
                    <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                      <span className="text-xs text-[#637766] mr-1">Select Strength:</span>
                      {resolvedMedicine.availableStrengths.map((st: string) => {
                         const isActive = strengthFilter === st || (resolvedMedicine.availableStrengths.length === 1 && !strengthFilter);
                         return (
                           <button
                             key={st}
                             onClick={() => handleStrengthSelect(st)}
                             className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                               isActive 
                                ? 'bg-[#559620] text-white border-[#559620]' 
                                : 'bg-[#FAFCFA] text-[#14304A] border-[#DCE8D8] hover:border-[#559620] hover:text-[#559620]'
                             }`}
                           >
                             {st}
                           </button>
                         )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop Filters Sidebar (Span 3) */}
            <aside className="hidden lg:block lg:col-span-3 rounded-2xl border border-[#DCE8D8] bg-white p-5 shadow-2xs sticky top-24">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E3EDE1]">
                <div className="flex items-center gap-2 text-[#14304A] font-bold text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-[#559620]" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-[#559620] hover:underline font-bold cursor-pointer"
                >
                  Reset
                </button>
              </div>
              {renderFiltersContent()}
            </aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#DCE8D8] mb-4">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 text-xs font-bold text-[#14304A] bg-[#F0F5F2] px-3 py-2 rounded-xl"
              >
                <Filter className="w-3.5 h-3.5 text-[#559620]" />
                <span>Filter Products</span>
              </button>
            </div>

            {/* Products Main Area (Span 9) */}
            <div className="lg:col-span-9 space-y-10">
              
              {isMedicineLoading || isAllLoading ? (
                 <div className="py-12 flex justify-center">
                   <div className="w-8 h-8 border-4 border-[#559620] border-t-transparent rounded-full animate-spin"></div>
                 </div>
              ) : totalResults === 0 ? (
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
                    onClick={() => { clearAllFilters(); setQuery(""); setStrengthFilter(""); router.push("/search") }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Search</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Generic Options Group */}
                  {genericOptions.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#559620]">
                        <h2 className="font-serif text-lg font-bold text-[#14304A] flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#559620]"></span>
                          Generic Alternatives
                        </h2>
                        <span className="text-[10px] text-[#559620] font-bold bg-[#EDF7E9] px-2 py-0.5 rounded-md hidden sm:inline-block">
                          Max Savings & Verified Composition
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
                        {genericOptions.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exact / Searched Brands */}
                  {exactMatches.length > 0 && (
                    <div>
                      <h2 className="font-serif text-lg font-bold text-[#14304A] mb-4 pb-2 border-b border-[#E3EDE1]">
                        Searched Brand
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
                        {exactMatches.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Branded Options */}
                  {brandedAlternatives.length > 0 && (
                    <div>
                      <h2 className="font-serif text-lg font-bold text-[#14304A] mb-4 pb-2 border-b border-[#E3EDE1] flex items-center gap-2">
                        Other Branded Options
                        <div className="group relative cursor-help">
                           <Info className="w-3.5 h-3.5 text-[#8C9C8F]" />
                           <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#14304A] text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                              These brands contain the same verified active composition and strength.
                           </div>
                        </div>
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
                        {brandedAlternatives.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Results (Catch-all) */}
                  {otherResults.length > 0 && (
                    <div>
                      <h2 className="font-serif text-lg font-bold text-[#14304A] mb-4 pb-2 border-b border-[#E3EDE1]">
                        {isSearchActive ? "Other Relevant Products" : "All Products"}
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
                        {otherResults.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Need Prescription Promo */}
              <div className="rounded-2xl border border-[#D7E4D3] bg-[#F3F8F1] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <div>
                  <h4 className="text-sm font-bold text-[#14304A]">
                    Can&apos;t find your medication?
                  </h4>
                  <p className="text-xs text-[#5D735F] mt-0.5">
                    Upload your prescription directly. Our licensed pharmacists will locate and prepare your order.
                  </p>
                </div>
                <Link
                  href="/prescription/upload"
                  className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-[#123E7F] text-white text-xs font-bold transition-all shadow-xs shrink-0"
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
              <h3 className="font-serif text-lg font-bold text-[#14304A]">Filters</h3>
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
                Apply Filters
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
