"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Package,
  AlertTriangle,
  Download,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Grid,
  List,
  Layers,
  Sparkles,
  Pill,
  Heart,
  ShieldCheck,
  Activity,
  Thermometer,
  Stethoscope,
  Baby,
  Leaf,
  CheckCircle2
} from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ADMIN_PRODUCTS, AdminProduct } from "@/data/adminData";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useToast } from "@/context/ToastContext";
import { adminApi } from "@/api/admin";

// Category Theme Mappings for Visual Distinction
interface CategoryTheme {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  badgeBg: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  "Pain Relief & Fever": { icon: Pill, color: "text-rose-600", bg: "bg-rose-50/80", border: "border-rose-200", badgeBg: "bg-rose-100 text-rose-800" },
  "Antibiotics": { icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50/80", border: "border-blue-200", badgeBg: "bg-blue-100 text-blue-800" },
  "Gastro & Digestive": { icon: Activity, color: "text-amber-600", bg: "bg-amber-50/80", border: "border-amber-200", badgeBg: "bg-amber-100 text-amber-800" },
  "Diabetes Care": { icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50/80", border: "border-emerald-200", badgeBg: "bg-emerald-100 text-emerald-800" },
  "Skin Care & Dermatology": { icon: Sparkles, color: "text-pink-600", bg: "bg-pink-50/80", border: "border-pink-200", badgeBg: "bg-pink-100 text-pink-800" },
  "Cold, Cough & Flu": { icon: Thermometer, color: "text-sky-600", bg: "bg-sky-50/80", border: "border-sky-200", badgeBg: "bg-sky-100 text-sky-800" },
  "Cardiac & Blood Pressure": { icon: Heart, color: "text-red-600", bg: "bg-red-50/80", border: "border-red-200", badgeBg: "bg-red-100 text-red-800" },
  "Vitamins & Supplements": { icon: Sparkles, color: "text-orange-600", bg: "bg-orange-50/80", border: "border-orange-200", badgeBg: "bg-orange-100 text-orange-800" },
  "Ayurvedic & Herbal": { icon: Leaf, color: "text-emerald-700", bg: "bg-emerald-50/80", border: "border-emerald-200", badgeBg: "bg-emerald-100 text-emerald-800" },
  "Diagnostic Devices & Health Monitors": { icon: Stethoscope, color: "text-indigo-600", bg: "bg-indigo-50/80", border: "border-indigo-200", badgeBg: "bg-indigo-100 text-indigo-800" },
  "Antiseptics & First Aid": { icon: ShieldCheck, color: "text-teal-600", bg: "bg-teal-50/80", border: "border-teal-200", badgeBg: "bg-teal-100 text-teal-800" },
  "Allergy & Antihistamines": { icon: Pill, color: "text-purple-600", bg: "bg-purple-50/80", border: "border-purple-200", badgeBg: "bg-purple-100 text-purple-800" },
  "Women's Health": { icon: Sparkles, color: "text-fuchsia-600", bg: "bg-fuchsia-50/80", border: "border-fuchsia-200", badgeBg: "bg-fuchsia-100 text-fuchsia-800" },
  "Respiratory & Asthma": { icon: Activity, color: "text-cyan-600", bg: "bg-cyan-50/80", border: "border-cyan-200", badgeBg: "bg-cyan-100 text-cyan-800" },
  "Muscle & Joint Pain": { icon: Activity, color: "text-amber-700", bg: "bg-amber-50/80", border: "border-amber-200", badgeBg: "bg-amber-100 text-amber-800" },
  "Personal Care & Hygiene": { icon: Sparkles, color: "text-violet-600", bg: "bg-violet-50/80", border: "border-violet-200", badgeBg: "bg-violet-100 text-violet-800" },
  "Eye & Ear Care": { icon: Eye, color: "text-blue-700", bg: "bg-blue-50/80", border: "border-blue-200", badgeBg: "bg-blue-100 text-blue-800" },
  "Baby Care": { icon: Baby, color: "text-rose-500", bg: "bg-rose-50/80", border: "border-rose-200", badgeBg: "bg-rose-100 text-rose-800" },
};

const DEFAULT_THEME: CategoryTheme = {
  icon: Package,
  color: "text-[#559620]",
  bg: "bg-[#F2F7F1]",
  border: "border-[#D8E6D6]",
  badgeBg: "bg-[#E5F2E2] text-[#3E7016]",
};

export default function AdminProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<AdminProduct[]>(ADMIN_PRODUCTS);
  const [loading, setLoading] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<"categories" | "accordion" | "table">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Filter state
  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Pagination for category drill-down or table view
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    setLoading(true);
    adminApi
      .getInventory({ limit: 500 })
      .then((res) => {
        if (res.data?.products?.length) {
          setProducts(res.data.products);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch live inventory, using local cache:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Group products by category with rich statistics
  const categoryGroups = useMemo(() => {
    const map = new Map<string, {
      name: string;
      products: AdminProduct[];
      totalCount: number;
      inStockCount: number;
      lowStockCount: number;
      outOfStockCount: number;
      prescriptionCount: number;
      minPrice: number;
      maxPrice: number;
      totalStockUnits: number;
    }>();

    for (const p of products) {
      const cat = p.category || "General Medicines";
      if (!map.has(cat)) {
        map.set(cat, {
          name: cat,
          products: [],
          totalCount: 0,
          inStockCount: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          prescriptionCount: 0,
          minPrice: p.sellingPrice || 0,
          maxPrice: p.sellingPrice || 0,
          totalStockUnits: 0,
        });
      }

      const group = map.get(cat)!;
      group.products.push(p);
      group.totalCount += 1;
      group.totalStockUnits += (p.stockQuantity || 0);

      if (p.stockQuantity <= 0) {
        group.outOfStockCount += 1;
      } else if (p.stockQuantity <= 10) {
        group.lowStockCount += 1;
      } else {
        group.inStockCount += 1;
      }

      if (p.prescriptionRequired) {
        group.prescriptionCount += 1;
      }

      group.minPrice = Math.min(group.minPrice, p.sellingPrice || 0);
      group.maxPrice = Math.max(group.maxPrice, p.sellingPrice || 0);
    }

    // Sort categories by product count descending
    return Array.from(map.values()).sort((a, b) => b.totalCount - a.totalCount);
  }, [products]);

  // Distinct category list for dropdown / pills
  const categoriesList = useMemo(() => {
    return categoryGroups.map((g) => g.name);
  }, [categoryGroups]);

  // Filtered categories in Category Cards view
  const filteredCategoryGroups = useMemo(() => {
    if (!categorySearch.trim()) return categoryGroups;
    const q = categorySearch.toLowerCase().trim();
    return categoryGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.products.some((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
    );
  }, [categoryGroups, categorySearch]);

  // Filtered products when viewing a specific category or flat table
  const displayedProducts = useMemo(() => {
    let list = products;

    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.composition?.toLowerCase().includes(q)
      );
    }

    if (stockFilter !== "all") {
      if (stockFilter === "Active") {
        list = list.filter((p) => p.stockQuantity > 10);
      } else if (stockFilter === "Low Stock") {
        list = list.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 10);
      } else if (stockFilter === "Out of Stock") {
        list = list.filter((p) => p.stockQuantity <= 0);
      }
    }

    return list;
  }, [products, selectedCategory, search, stockFilter]);

  // Pagination for displayed products
  const totalPages = Math.max(1, Math.ceil(displayedProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return displayedProducts.slice(start, start + pageSize);
  }, [displayedProducts, page, pageSize]);

  // Reset page when category or search changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, search, stockFilter]);

  // Toggle category expansion in accordion view
  const toggleAccordion = (catName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catName)) {
        next.delete(catName);
      } else {
        next.add(catName);
      }
      return next;
    });
  };

  const expandAllAccordions = () => {
    setExpandedCategories(new Set(categoriesList));
  };

  const collapseAllAccordions = () => {
    setExpandedCategories(new Set());
  };

  // Open category directly into its product table
  const handleOpenCategory = (catName: string) => {
    setSelectedCategory(catName);
    setSearch("");
    setStockFilter("all");
    setPage(1);
  };

  // Export CSV for current view
  const handleExportCSV = () => {
    const targetProducts = selectedCategory ? displayedProducts : products;
    const headers = ["ID", "SKU", "Name", "Brand", "Category", "Selling Price", "MRP", "Stock", "Status", "Prescription"];
    const rows = targetProducts.map((p) => [
      p.id,
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.brand.replace(/"/g, '""')}"`,
      `"${p.category.replace(/"/g, '""')}"`,
      p.sellingPrice,
      p.mrp,
      p.stockQuantity,
      p.status,
      p.prescriptionRequired ? "Yes" : "No",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filename = selectedCategory
      ? `genekon_${selectedCategory.toLowerCase().replace(/\s+/g, "_")}_products.csv`
      : "genekon_product_catalog.csv";
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${targetProducts.length} products to CSV.`);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success(`Product "${deleteTarget.name}" deleted successfully.`);
    setDeleteTarget(null);
  };

  // Table Columns Definition
  const columns = [
    {
      header: "Product",
      render: (p: AdminProduct) => (
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl bg-[#FAFCFB] border border-[#DDE7DC] p-1 shrink-0 overflow-hidden">
            <Image
              src={p.image}
              alt={p.name}
              fill
              sizes="44px"
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-bold text-[#14304A] hover:text-[#559620] block transition-colors">
              {p.name}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-[#697D6B] mt-0.5">
              <span className="font-mono text-[10px] bg-[#F2F5F2] px-1 py-0.5 rounded border border-[#E0E8DF]">{p.sku}</span>
              {p.prescriptionRequired && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-sm bg-[#EBF3FC] text-[#1853A8]">
                  Rx Required
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      render: (p: AdminProduct) => (
        <button
          onClick={() => handleOpenCategory(p.category)}
          className="text-xs font-semibold text-[#1853A8] hover:underline cursor-pointer text-left"
        >
          {p.category}
        </button>
      ),
    },
    {
      header: "Brand",
      accessor: "brand" as keyof AdminProduct,
    },
    {
      header: "Price",
      render: (p: AdminProduct) => (
        <div>
          <span className="font-bold text-[#14304A]">₹{p.sellingPrice}</span>
          <span className="text-[11px] text-[#788E7A] line-through ml-1.5">
            ₹{p.mrp}
          </span>
        </div>
      ),
    },
    {
      header: "Stock",
      render: (p: AdminProduct) => (
        <div>
          <span className={`font-bold ${p.stockQuantity <= 10 ? "text-[#D97706]" : "text-[#14304A]"}`}>
            {p.stockQuantity} units
          </span>
          {p.stockQuantity <= 10 && p.stockQuantity > 0 && (
            <span className="text-[10px] text-[#D97706] font-semibold block">
              Low Stock Alert
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      render: (p: AdminProduct) => <StatusBadge status={p.status} />,
    },
    {
      header: "Actions",
      className: "text-right",
      render: (p: AdminProduct) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/product/${p.id}`}
            target="_blank"
            className="p-1.5 rounded-lg text-[#657968] hover:text-[#14304A] hover:bg-[#F2F5F2] transition-colors"
            title="View product in storefront"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/admin/products/edit"
            className="p-1.5 rounded-lg text-[#657968] hover:text-[#559620] hover:bg-[#F2F5F2] transition-colors"
            title="Edit product"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => handleDelete(p.id, p.name)}
            className="p-1.5 rounded-lg text-[#657968] hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
            title="Delete product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Selected Category Info Object
  const currentCategoryInfo = useMemo(() => {
    if (!selectedCategory) return null;
    return categoryGroups.find((g) => g.name === selectedCategory) || null;
  }, [categoryGroups, selectedCategory]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14304A]">
              Product Catalog Management
            </h1>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#EBF5E7] text-[#559620] border border-[#D5EAD0]">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#637766] mt-1">
            Organized across {categoryGroups.length} therapeutic categories. Browse, edit pricing, manage stock, and track batches.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#559620]" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/admin/products/add"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#E0EBE0] bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697D6B] uppercase tracking-wider">Total SKUs</span>
            <div className="w-7 h-7 rounded-lg bg-[#EBF5E7] text-[#559620] flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#14304A] mt-1.5">{products.length}</div>
          <span className="text-[11px] text-[#559620] font-semibold mt-0.5 block">Pharmaceutical Grade</span>
        </div>

        <div className="rounded-2xl border border-[#E0EBE0] bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697D6B] uppercase tracking-wider">Categories</span>
            <div className="w-7 h-7 rounded-lg bg-[#EBF3FC] text-[#1853A8] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#14304A] mt-1.5">{categoryGroups.length}</div>
          <span className="text-[11px] text-[#1853A8] font-semibold mt-0.5 block">Therapeutic Segments</span>
        </div>

        <div className="rounded-2xl border border-[#E0EBE0] bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697D6B] uppercase tracking-wider">In Stock Ready</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#14304A] mt-1.5">
            {products.filter((p) => p.stockQuantity > 10).length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Healthy Stock Levels</span>
        </div>

        <div className="rounded-2xl border border-[#E0EBE0] bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697D6B] uppercase tracking-wider">Low / Out Stock</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#14304A] mt-1.5">
            {products.filter((p) => p.stockQuantity <= 10).length}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">Action Required</span>
        </div>
      </div>

      {/* 3. View Mode Toggle & Category Quick-Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-[#E3EDE1] pb-3">
        {/* Left: View Mode Buttons */}
        <div className="flex items-center gap-1.5 bg-[#F0F5EF] p-1 rounded-xl border border-[#D8E6D6] w-fit">
          <button
            onClick={() => {
              setViewMode("categories");
              setSelectedCategory(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "categories" && !selectedCategory
                ? "bg-white text-[#14304A] shadow-2xs"
                : "text-[#637766] hover:text-[#14304A]"
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-[#559620]" />
            <span>Category Folders ({categoryGroups.length})</span>
          </button>

          <button
            onClick={() => {
              setViewMode("accordion");
              setSelectedCategory(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "accordion"
                ? "bg-white text-[#14304A] shadow-2xs"
                : "text-[#637766] hover:text-[#14304A]"
            }`}
          >
            <List className="w-3.5 h-3.5 text-[#1853A8]" />
            <span>Accordion List</span>
          </button>

          <button
            onClick={() => {
              setViewMode("table");
              setSelectedCategory(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "table" && !selectedCategory
                ? "bg-white text-[#14304A] shadow-2xs"
                : "text-[#637766] hover:text-[#14304A]"
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-amber-600" />
            <span>Full Catalog Table</span>
          </button>
        </div>

        {/* Right: Quick Jump Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#637766] whitespace-nowrap">Jump to Category:</label>
          <select
            value={selectedCategory || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                handleOpenCategory(val);
              } else {
                setSelectedCategory(null);
              }
            }}
            className="text-xs font-bold text-[#14304A] bg-white border border-[#CCDCCD] rounded-xl px-3 py-1.5 outline-none focus:border-[#559620] cursor-pointer"
          >
            <option value="">-- Select Category --</option>
            {categoryGroups.map((g) => (
              <option key={g.name} value={g.name}>
                {g.name} ({g.totalCount})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Quick Category Pills Scroll Bar */}
      <div className="overflow-x-auto pb-1.5 -mt-2">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer border ${
              selectedCategory === null && viewMode === "categories"
                ? "bg-[#14304A] text-white border-[#14304A] shadow-xs"
                : "bg-white text-[#556957] border-[#DCE8DC] hover:border-[#559620] hover:text-[#14304A]"
            }`}
          >
            All Categories ({products.length})
          </button>

          {categoryGroups.map((g) => {
            const isSelected = selectedCategory === g.name;
            const theme = CATEGORY_THEMES[g.name] || DEFAULT_THEME;
            const Icon = theme.icon;
            return (
              <button
                key={g.name}
                onClick={() => handleOpenCategory(g.name)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#559620] text-white border-[#559620] shadow-xs"
                    : "bg-white text-[#556957] border-[#DCE8DC] hover:border-[#559620] hover:text-[#14304A]"
                }`}
              >
                <Icon className={`w-3 h-3 ${isSelected ? "text-white" : theme.color}`} />
                <span>{g.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/25 text-white" : "bg-[#EDF3EC] text-[#556A58]"}`}>
                  {g.totalCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SCENARIO A: A SPECIFIC CATEGORY IS OPENED (Drill-down Workspace) */}
      {/* ------------------------------------------------------------- */}
      {selectedCategory && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Category Banner with Back Button & Stats */}
          <div className="rounded-3xl border border-[#DCE8D8] bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Category Breadcrumb & Title */}
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#559620] hover:text-[#417518] hover:underline cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to All Categories</span>
                </button>

                <div className="flex items-center gap-3">
                  {(() => {
                    const theme = CATEGORY_THEMES[selectedCategory] || DEFAULT_THEME;
                    const Icon = theme.icon;
                    return (
                      <div className={`w-12 h-12 rounded-2xl ${theme.bg} ${theme.border} border flex items-center justify-center shrink-0`}>
                        <Icon className={`w-6 h-6 ${theme.color}`} />
                      </div>
                    );
                  })()}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14304A]">
                        {selectedCategory}
                      </h2>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#EBF5E7] text-[#559620] border border-[#D5EAD0]">
                        {currentCategoryInfo?.totalCount || 0} Products
                      </span>
                    </div>
                    <p className="text-xs text-[#637766] mt-0.5">
                      Showing active products, inventory stock, and pricing for this segment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Micro-Stats */}
              <div className="flex items-center gap-3 bg-[#F8FAF7] border border-[#E2EDE0] rounded-2xl p-3 shrink-0">
                <div className="text-center px-3 border-r border-[#E0EBE0]">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#718573]">In Stock</span>
                  <div className="text-base font-bold text-emerald-700">
                    {currentCategoryInfo?.inStockCount || 0}
                  </div>
                </div>
                <div className="text-center px-3 border-r border-[#E0EBE0]">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#718573]">Low / Out</span>
                  <div className="text-base font-bold text-amber-600">
                    {(currentCategoryInfo?.lowStockCount || 0) + (currentCategoryInfo?.outOfStockCount || 0)}
                  </div>
                </div>
                <div className="text-center px-3 border-r border-[#E0EBE0]">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#718573]">Rx Required</span>
                  <div className="text-base font-bold text-[#1853A8]">
                    {currentCategoryInfo?.prescriptionCount || 0}
                  </div>
                </div>
                <div className="text-center px-3">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#718573]">Price Span</span>
                  <div className="text-base font-bold text-[#14304A]">
                    ₹{currentCategoryInfo?.minPrice} - ₹{currentCategoryInfo?.maxPrice}
                  </div>
                </div>
              </div>

            </div>

            {/* Filter bar for this category */}
            <div className="mt-5 pt-4 border-t border-[#EEF4ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#8FA292] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search in ${selectedCategory}...`}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#637766]">Stock Filter:</span>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="text-xs font-semibold text-[#14304A] bg-white border border-[#CCDCCD] rounded-xl px-3 py-2 outline-none focus:border-[#559620] cursor-pointer"
                >
                  <option value="all">All Statuses ({displayedProducts.length})</option>
                  <option value="Active">Active / In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Data Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#637766] px-1">
              <span>
                Showing {displayedProducts.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
                {Math.min(page * pageSize, displayedProducts.length)} of {displayedProducts.length} items in {selectedCategory}
              </span>
              <span>
                Page {page} of {totalPages}
              </span>
            </div>

            <DataTable
              columns={columns}
              data={paginatedProducts}
              emptyMessage={`No products found in "${selectedCategory}" matching your criteria.`}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          page === pageNum
                            ? "bg-[#559620] text-white"
                            : "bg-white text-[#14304A] border border-[#CCDCCD] hover:bg-[#F2F7F2]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-xs text-[#718573]">...</span>}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCENARIO B: CATEGORY FOLDERS VIEW (Default Card Grid View) */}
      {/* ------------------------------------------------------------- */}
      {!selectedCategory && viewMode === "categories" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Search bar for categories */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E0EBE0] shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8FA292] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories or medicines by name..."
                className="w-full text-xs pl-10 pr-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-[#637766]">
              <span>Click any category card below to view its product table</span>
            </div>
          </div>

          {/* Grid of Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategoryGroups.map((group) => {
              const theme = CATEGORY_THEMES[group.name] || DEFAULT_THEME;
              const Icon = theme.icon;

              return (
                <div
                  key={group.name}
                  onClick={() => handleOpenCategory(group.name)}
                  className="group rounded-3xl border border-[#DCE8D8] bg-white p-5 hover:border-[#559620] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Top: Icon + Count */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className={`w-11 h-11 rounded-2xl ${theme.bg} ${theme.border} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className={`w-5 h-5 ${theme.color}`} />
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${theme.badgeBg}`}>
                        {group.totalCount} Products
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-[#14304A] group-hover:text-[#559620] transition-colors leading-snug">
                      {group.name}
                    </h3>

                    {/* Stock Overview Chips */}
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#637766]">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {group.inStockCount} In Stock
                      </span>
                      {group.lowStockCount > 0 && (
                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                          {group.lowStockCount} Low
                        </span>
                      )}
                      {group.prescriptionCount > 0 && (
                        <span className="font-semibold text-[#1853A8] bg-[#EBF3FC] px-1.5 py-0.5 rounded-md">
                          Rx
                        </span>
                      )}
                    </div>

                    {/* Sample Product Previews */}
                    <div className="mt-3.5 pt-3 border-t border-[#F0F5EE] space-y-1">
                      <span className="text-[10px] font-bold text-[#8FA292] uppercase tracking-wider block">
                        Included Medicines:
                      </span>
                      <div className="text-xs text-[#556957] line-clamp-2 leading-relaxed">
                        {group.products.slice(0, 3).map((p) => p.name).join(", ")}
                        {group.totalCount > 3 && ` + ${group.totalCount - 3} more`}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Price Span & Open Action */}
                  <div className="mt-4 pt-3 border-t border-[#F0F5EE] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#14304A]">
                      ₹{group.minPrice} - ₹{group.maxPrice}
                    </span>
                    <span className="font-bold text-[#559620] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <span>View Products</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCENARIO C: ACCORDION VIEW (Expand / Collapse Inline) */}
      {/* ------------------------------------------------------------- */}
      {!selectedCategory && viewMode === "accordion" && (
        <div className="space-y-3 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-[#637766]">
              All {categoryGroups.length} Therapeutic Categories
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={expandAllAccordions}
                className="text-xs font-bold text-[#559620] hover:underline cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-[#CCDCCD]">&bull;</span>
              <button
                onClick={collapseAllAccordions}
                className="text-xs font-bold text-[#637766] hover:underline cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {categoryGroups.map((group) => {
              const isExpanded = expandedCategories.has(group.name);
              const theme = CATEGORY_THEMES[group.name] || DEFAULT_THEME;
              const Icon = theme.icon;

              return (
                <div
                  key={group.name}
                  className="rounded-2xl border border-[#DCE8D8] bg-white overflow-hidden shadow-2xs transition-all"
                >
                  {/* Accordion Header */}
                  <div
                    onClick={() => toggleAccordion(group.name)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#FAFCFA] transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${theme.bg} ${theme.border} border flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${theme.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-sm sm:text-base font-bold text-[#14304A]">
                            {group.name}
                          </h3>
                          <span className="text-xs font-bold px-2 py-0.2 rounded-full bg-[#EDF3EC] text-[#556A58]">
                            {group.totalCount} Products
                          </span>
                        </div>
                        <span className="text-[11px] text-[#718573]">
                          ₹{group.minPrice} - ₹{group.maxPrice} &bull; {group.totalStockUnits} units in stock
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCategory(group.name);
                        }}
                        className="text-xs font-bold text-[#559620] hover:underline px-2 py-1 rounded cursor-pointer"
                      >
                        Open Workspace &rarr;
                      </button>
                      <div className="w-7 h-7 rounded-lg bg-[#F2F5F2] flex items-center justify-center text-[#637766]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Accordion Body: Table */}
                  {isExpanded && (
                    <div className="border-t border-[#EEF4ED] p-4 bg-[#FAFCFB]">
                      <DataTable
                        columns={columns}
                        data={group.products}
                        emptyMessage="No products in this category."
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SCENARIO D: FULL TABLE VIEW (Classic Flat Catalog) */}
      {/* ------------------------------------------------------------- */}
      {!selectedCategory && viewMode === "table" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E0EBE0] shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8FA292] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by medicine name, brand, or SKU..."
                className="w-full text-xs pl-10 pr-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="text-xs font-semibold text-[#14304A] bg-white border border-[#CCDCCD] rounded-xl px-3 py-2 outline-none focus:border-[#559620] cursor-pointer"
              >
                <option value="all">All Statuses ({products.length})</option>
                <option value="Active">Active / In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#637766] px-1">
            <span>
              Showing {displayedProducts.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(page * pageSize, displayedProducts.length)} of {displayedProducts.length} products
            </span>
            <span>
              Page {page} of {totalPages}
            </span>
          </div>

          <DataTable
            columns={columns}
            data={paginatedProducts}
            emptyMessage="No healthcare products found matching your search criteria."
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        page === pageNum
                          ? "bg-[#559620] text-white"
                          : "bg-white text-[#14304A] border border-[#CCDCCD] hover:bg-[#F2F7F2]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="text-xs text-[#718573]">...</span>}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          )}

        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will deactivate the SKU and remove it from the active catalog.`}
        confirmLabel="Delete Product"
        isDestructive={true}
      />

    </div>
  );
}
