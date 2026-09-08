"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  SlidersHorizontal,
  Filter,
  X,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Pill,
  HeartPulse,
  Activity,
  CheckCircle2
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { useCategoryProductsQuery } from "@/hooks/api/useProductsQuery";
import { ALL_PRODUCTS } from "@/data/products";

interface CategoryMeta {
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  subcategories: string[];
  productCategoryMatch: string[];
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  medicines: {
    title: "Prescription & Everyday Medicines",
    subtitle: "GENUINE PHARMACEUTICALS",
    description: "Browse 100% authentic medicines sourced directly from authorized manufacturers. Licensed pharmacists verify every order.",
    heroImage: "/images/categories/cat-prescription-medicines-v2.jpg",
    subcategories: ["All", "Pain & Fever", "Gastro & Acid", "Antibiotics", "Chronic Care", "Respiratory"],
    productCategoryMatch: ["Medicines"],
  },
  "personal-care": {
    title: "Personal Care & Dermatologicals",
    subtitle: "DAILY SKIN & BODY HEALTH",
    description: "Gentle, clinically-tested cleansers, therapeutic moisturizers, and high-protection sunscreens recommended by dermatologists.",
    heroImage: "/images/categories/cat-skin-care-v2.jpg",
    subcategories: ["All", "Cleansers", "Moisturizers", "Sun Care", "Anti-Acne", "Hair Care"],
    productCategoryMatch: ["Personal Care", "Skin Care"],
  },
  "skin-care": {
    title: "Dermatology & Skin Care",
    subtitle: "HEALTHY SKIN BARRIER",
    description: "Gentle cleansers, rich ceramide lotions, and doctor-approved skincare for sensitive, dry, and acne-prone skin.",
    heroImage: "/images/categories/cat-skin-care-v2.jpg",
    subcategories: ["All", "Cleansers", "Moisturizers", "Sun Care", "Serums"],
    productCategoryMatch: ["Personal Care", "Skin Care"],
  },
  vitamins: {
    title: "Vitamins, Minerals & Supplements",
    subtitle: "DAILY VITALITY & IMMUNITY",
    description: "Scientifically formulated multivitamins, Vitamin D3, CoQ10, and sports nutrition to support long-term active health.",
    heroImage: "/images/categories/cat-vitamins-supplements-v2.jpg",
    subcategories: ["All", "Multivitamins", "Proteins", "Vitamin D & Calcium", "Antioxidants", "Immunity"],
    productCategoryMatch: ["Vitamins & Nutrition", "Vitamins"],
  },
  "vitamins-nutrition": {
    title: "Vitamins, Minerals & Supplements",
    subtitle: "DAILY VITALITY & IMMUNITY",
    description: "Scientifically formulated multivitamins, Vitamin D3, CoQ10, and sports nutrition to support long-term active health.",
    heroImage: "/images/categories/cat-vitamins-supplements-v2.jpg",
    subcategories: ["All", "Multivitamins", "Proteins", "Vitamin D & Calcium", "Antioxidants", "Immunity"],
    productCategoryMatch: ["Vitamins & Nutrition", "Vitamins"],
  },
  ayurveda: {
    title: "Ayurvedic & Herbal Care",
    subtitle: "TIME-TESTED HOLISTIC WELLNESS",
    description: "Authentic herbal formulations, classical chyawanprash, and botanical extracts for balanced digestion, vitality, and natural healing.",
    heroImage: "/images/categories/cat-ayurveda-v2.jpg",
    subcategories: ["All", "Immunity", "Liver Care", "Digestive Health", "Herbal Tonics", "Chyawanprash"],
    productCategoryMatch: ["Ayurveda"],
  },
  "medical-devices": {
    title: "Diagnostic & Medical Devices",
    subtitle: "CLINICAL PRECISION AT HOME",
    description: "Certified digital thermometers, automated blood pressure monitors, and blood glucose testing strips for reliable health tracking.",
    heroImage: "/images/categories/cat-medical-devices-v2.jpg",
    subcategories: ["All", "Glucose Monitors", "BP Monitors", "Thermometers", "Strips & Lancets"],
    productCategoryMatch: ["Medical Devices"],
  },
  "baby-care": {
    title: "Gentle Mother & Baby Care",
    subtitle: "HYPOALLERGENIC & PEDIATRIC TESTED",
    description: "Ultra-mild washes, tear-free formulas, and diaper barrier creams specially formulated for delicate newborn skin.",
    heroImage: "/images/categories/cat-baby-care-v2.jpg",
    subcategories: ["All", "Baby Wash", "Diaper Care", "Baby Lotions", "Infant Health"],
    productCategoryMatch: ["Baby Care"],
  },
  healthcare: {
    title: "Everyday Healthcare Essentials",
    subtitle: "FIRST AID & WELLNESS",
    description: "First aid supplies, pain sprays, antiseptics, and essential medical products for your family medicine cabinet.",
    heroImage: "/images/categories/cat-wellness-essentials-v2.jpg",
    subcategories: ["All", "First Aid", "Pain Sprays", "Bandages & Dressings", "Antiseptics"],
    productCategoryMatch: ["Medicines", "Medical Devices", "Healthcare"],
  },
  wellness: {
    title: "Wellness & Lifestyle",
    subtitle: "HEALTHY LIVING",
    description: "Health supplements, wellness drinks, organic nutrition, and personal vitality aids.",
    heroImage: "/images/categories/cat-wellness-essentials-v2.jpg",
    subcategories: ["All", "Supplements", "Immunity", "Energy", "Daily Health"],
    productCategoryMatch: ["Vitamins & Nutrition", "Ayurveda", "Wellness"],
  },
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug.toLowerCase();

  const meta = CATEGORY_MAP[slug] || {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`,
    subtitle: "GENEKON PHARMACY CATALOG",
    description: "Explore genuine medicines and wellness products verified by licensed pharmacists.",
    heroImage: "/images/categories/cat-prescription-medicines-v2.jpg",
    subcategories: ["All", "Best Sellers", "Popular", "New Arrivals"],
    productCategoryMatch: [slug],
  };

  const [activeSubcategory, setActiveSubcategory] = useState("All");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [discountFilter, setDiscountFilter] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  type RxFilterOption = "all" | "otc" | "rx";
  type CategorySortOption = "popular" | "price-low" | "price-high" | "latest";
  const [rxFilter, setRxFilter] = useState<RxFilterOption>("all");
  const [sortBy, setSortBy] = useState<CategorySortOption>("popular");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Dynamic live products for this category
  const { data: liveCategoryProducts } = useCategoryProductsQuery(slug);

  // Match products for this category or fallback
  const categoryProducts = useMemo(() => {
    if (liveCategoryProducts && liveCategoryProducts.length > 0) {
      return liveCategoryProducts;
    }
    return ALL_PRODUCTS.filter((p) => {
      if (meta.productCategoryMatch.length > 0) {
        return meta.productCategoryMatch.some(
          (m) =>
            p.category.toLowerCase().includes(m.toLowerCase()) ||
            m.toLowerCase().includes(p.category.toLowerCase())
        );
      }
      return true;
    });
  }, [liveCategoryProducts, meta]);

  // Extract brands for this category
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    categoryProducts.forEach((p) => set.add(p.brand));
    return Array.from(set);
  }, [categoryProducts]);

  // Apply filters & sort
  const filteredProducts = useMemo(() => {
    return categoryProducts.filter((product) => {
      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      // Price filter
      if (priceFilter === "under-200" && product.price >= 200) return false;
      if (priceFilter === "200-500" && (product.price < 200 || product.price > 500)) return false;
      if (priceFilter === "500-1000" && (product.price < 500 || product.price > 1000)) return false;
      if (priceFilter === "above-1000" && product.price <= 1000) return false;

      // Discount
      if (discountFilter > 0 && (!product.discountPercent || product.discountPercent < discountFilter)) {
        return false;
      }

      // In stock
      if (inStockOnly && !product.inStock) {
        return false;
      }

      // Prescription
      if (rxFilter === "otc" && product.prescriptionRequired) return false;
      if (rxFilter === "rx" && !product.prescriptionRequired) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "latest") return b.id.localeCompare(a.id);
      // popular
      return (b.rating * (b.reviewCount || 100)) - (a.rating * (a.reviewCount || 100));
    });
  }, [categoryProducts, selectedBrands, priceFilter, discountFilter, inStockOnly, rxFilter, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setPriceFilter("all");
    setDiscountFilter(0);
    setInStockOnly(false);
    setRxFilter("all");
    setActiveSubcategory("All");
  };

  const activeFilterCount =
    selectedBrands.length +
    (priceFilter !== "all" ? 1 : 0) +
    (discountFilter > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (rxFilter !== "all" ? 1 : 0);

  const renderFiltersContent = () => (
    <div className="space-y-6">
      {/* Brands */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A] mb-2.5">
          Brands
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {availableBrands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 text-xs text-[#435746] hover:text-[#14304A] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="rounded border-[#C5D6C7] text-[#559620] focus:ring-[#559620] h-3.5 w-3.5"
              />
              <span>{brand}</span>
            </label>
          ))}
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
          Prescription Type
        </h4>
        <div className="space-y-1.5">
          {[
            { id: "all" as const, label: "All Products" },
            { id: "otc" as const, label: "Over-the-Counter (OTC)" },
            { id: "rx" as const, label: "Prescription Required" },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 text-xs text-[#435746] hover:text-[#14304A] cursor-pointer"
            >
              <input
                type="radio"
                name="rxFilter"
                checked={rxFilter === item.id}
                onChange={() => setRxFilter(item.id)}
                className="text-[#559620] focus:ring-[#559620] h-3.5 w-3.5"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Discount */}
      <div className="pt-4 border-t border-[#E3EDE1]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A] mb-2.5">
          Minimum Discount
        </h4>
        <div className="space-y-1.5">
          {[
            { id: 0, label: "Any Discount" },
            { id: 10, label: "10% or more" },
            { id: 15, label: "15% or more" },
            { id: 20, label: "20% or more" },
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

      {/* In Stock */}
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
            <Link href="/categories" className="hover:text-[#14304A] transition-colors">
              Categories
            </Link>
            <span>&gt;</span>
            <span className="text-[#14304A] font-semibold">{meta.title}</span>
          </nav>

          {/* Category Hero Banner */}
          <div className="relative rounded-3xl border border-[#DCE8D8] bg-linear-to-r from-[#F2F8F0] via-white to-[#F7FAF6] p-6 sm:p-10 mb-8 overflow-hidden shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-[11px] font-extrabold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{meta.subtitle}</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-4xl text-[#14304A] tracking-tight">
                  {meta.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#5C705F] max-w-xl leading-relaxed">
                  {meta.description}
                </p>
              </div>

              <div className="md:col-span-4 flex justify-center md:justify-end">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-[#D4E4D0] bg-white shadow-xs p-2">
                  <Image
                    src={meta.heroImage}
                    alt={meta.title}
                    fill
                    sizes="(max-width: 768px) 112px, 144px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Subcategory Pills */}
            <div className="mt-6 pt-5 border-t border-[#E3EDE1] flex items-center gap-2 overflow-x-auto no-scrollbar">
              {meta.subcategories.map((sub) => {
                const isActive = activeSubcategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setActiveSubcategory(sub)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[#559620] text-white shadow-2xs"
                        : "bg-white border border-[#D5DFE6] text-[#14304A] hover:bg-[#F2F7F2]"
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Layout: Sidebar + Product Grid */}
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

            {/* Mobile Filter Button */}
            <div className="lg:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#DCE8D8] mb-4">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 text-xs font-bold text-[#14304A] bg-[#F0F5F2] px-3 py-2 rounded-xl"
              >
                <Filter className="w-3.5 h-3.5 text-[#559620]" />
                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#687C69]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as CategorySortOption)}
                  className="bg-transparent font-bold text-[#14304A] outline-none text-xs"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="latest">Latest</option>
                </select>
              </div>
            </div>

            {/* Products Main Grid (Span 9) */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Header Sort / Count Strip */}
              <div className="hidden lg:flex items-center justify-between pb-3 border-b border-[#E3EDE1]">
                <p className="text-xs text-[#687C69]">
                  Showing <span className="font-bold text-[#14304A]">{filteredProducts.length}</span> products in {meta.title}
                </p>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#687C69]">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as CategorySortOption)}
                    className="bg-white border border-[#D0DED3] rounded-lg px-2.5 py-1.5 font-bold text-[#14304A] outline-none text-xs focus:border-[#559620]"
                  >
                    <option value="popular">Popularity &amp; Bestselling</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="latest">Latest</option>
                  </select>
                </div>
              </div>

              {/* Product Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-[#C5D6C7] bg-white p-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#F0F6EF] text-[#559620] mx-auto flex items-center justify-center mb-3">
                    <RotateCcw className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-[#14304A] font-bold">
                    No products match the selected filters
                  </h3>
                  <p className="text-xs sm:text-sm text-[#667A68] max-w-md mx-auto mt-1 mb-5">
                    Try adjusting the price range or clearing brand selections to view available medicines.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              )}

              {/* Bottom Quick Help / Refill Strip */}
              <div className="rounded-2xl border border-[#D7E4D3] bg-[#EDF7E9] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#559620] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#14304A]">
                      Need assistance or continuous medicine refills?
                    </h4>
                    <p className="text-xs text-[#5D735F]">
                      Speak with our certified pharmacists for dosage advice, bulk packs, and routine delivery.
                    </p>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="px-4 py-2 rounded-xl bg-[#14304A] hover:bg-[#10273F] text-white text-xs font-bold transition-all shadow-xs shrink-0"
                >
                  Contact Pharmacist &rarr;
                </Link>
              </div>

            </div>

          </div>

        </Container>
      </main>

      {/* Mobile Drawer */}
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
