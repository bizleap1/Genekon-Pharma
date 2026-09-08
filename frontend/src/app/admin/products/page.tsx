"use client";

import React, { useState, useMemo } from "react";
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
  Download
} from "lucide-react";
import { FilterBar } from "@/components/admin/FilterBar";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ADMIN_PRODUCTS, AdminProduct } from "@/data/adminData";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>(ADMIN_PRODUCTS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");

  const categories = ["Medicines", "Vitamins & Nutrition", "Medical Devices", "Personal Care", "Ayurveda"];
  const statuses = ["Active", "Low Stock", "Out of Stock"];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesSku) return false;
      }
      if (category !== "all" && p.category !== category) return false;
      if (stockStatus !== "all" && p.status !== stockStatus) return false;
      return true;
    });
  }, [products, search, category, stockStatus]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the active catalog?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

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
            <span className="font-bold text-[#14304A] hover:text-[#1853A8] block">
              {p.name}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-[#697D6B] mt-0.5">
              <span className="font-mono">{p.sku}</span>
              {p.prescriptionRequired && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-sm bg-[#EBF3FC] text-[#1853A8]">
                  Rx
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "category" as keyof AdminProduct,
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
          {p.reservedQuantity > 0 && (
            <span className="text-[10px] text-[#718573] block">
              ({p.reservedQuantity} in transit)
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
            className="p-1.5 rounded-lg text-[#657968] hover:text-[#14304A] hover:bg-[#F2F5F2]"
            title="View in storefront"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/admin/products/edit"
            className="p-1.5 rounded-lg text-[#657968] hover:text-[#559620] hover:bg-[#F2F5F2]"
            title="Edit product"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => handleDelete(p.id, p.name)}
            className="p-1.5 rounded-lg text-[#657968] hover:text-red-600 hover:bg-red-50 cursor-pointer"
            title="Delete product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14304A]">
            Product Catalog Management
          </h2>
          <p className="text-xs text-[#637766] mt-0.5">
            Manage active SKUs, pharmaceutical compositions, pricing rules, and inventory levels.
          </p>
        </div>

        <Link
          href="/admin/products/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by medicine name, brand, or SKU..."
        categoryFilter={category}
        onCategoryChange={setCategory}
        categories={categories}
        statusFilter={stockStatus}
        onStatusChange={setStockStatus}
        statuses={statuses}
        onExport={() => alert("Product catalog CSV exported.")}
      />

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        emptyMessage="No healthcare products found matching your search and filter criteria."
      />

    </div>
  );
}
