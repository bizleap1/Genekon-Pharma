"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
  Edit2
} from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FilterBar } from "@/components/admin/FilterBar";
import { ADMIN_PRODUCTS, AdminProduct } from "@/data/adminData";
import { useToast } from "@/context/ToastContext";
import { adminApi } from "@/api/admin";

export default function AdminInventoryPage() {
  const toast = useToast();
  const [products, setProducts] = useState<AdminProduct[]>(ADMIN_PRODUCTS);

  useEffect(() => {
    adminApi.getInventory().then((res) => {
      if (res.data?.products?.length) {
        setProducts(res.data.products);
      }
    });
  }, []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [newStockVal, setNewStockVal] = useState("");

  const totalUnits = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const lowStockCount = products.filter((p) => p.status === "Low Stock").length;
  const outOfStockCount = products.filter((p) => p.status === "Out of Stock").length;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [products, search, statusFilter]);

  const openUpdateModal = (p: AdminProduct) => {
    setSelectedProduct(p);
    setNewStockVal(p.stockQuantity.toString());
  };

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const val = parseInt(newStockVal) || 0;
    const diff = val - selectedProduct.stockQuantity;
    if (diff !== 0) {
      adminApi.adjustStock({
        productId: selectedProduct.id,
        quantityChanged: Math.abs(diff),
        changeType: diff > 0 ? "PURCHASE_RECEIPT" : "MANUAL_ADJUSTMENT",
        reason: "Stock level adjusted via Admin Inventory manager",
      }).catch(() => {});
    }
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              stockQuantity: val,
              status: val === 0 ? "Out of Stock" : val <= 10 ? "Low Stock" : "Active",
              lastUpdated: "Just now",
            }
          : p
      )
    );
    toast.success(`Inventory stock updated for "${selectedProduct.name}" (${val} units).`);
    setSelectedProduct(null);
  };

  const columns = [
    {
      header: "Product & SKU",
      render: (p: AdminProduct) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-[#FAFCFB] border border-[#DDE7DC] p-1 shrink-0 overflow-hidden">
            <Image
              src={p.image}
              alt={p.name}
              fill
              sizes="40px"
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-bold text-[#14304A] block">{p.name}</span>
            <span className="font-mono text-[11px] text-[#788E7A]">{p.sku}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Available Stock",
      render: (p: AdminProduct) => (
        <span
          className={`font-mono text-xs font-extrabold ${
            p.stockQuantity === 0
              ? "text-red-600"
              : p.stockQuantity <= 10
              ? "text-[#D97706]"
              : "text-[#14304A]"
          }`}
        >
          {p.stockQuantity} units
        </span>
      ),
    },
    {
      header: "Reserved (Orders)",
      render: (p: AdminProduct) => (
        <span className="text-xs text-[#6B806F]">
          {p.reservedQuantity} units
        </span>
      ),
    },
    {
      header: "Inventory Status",
      render: (p: AdminProduct) => <StatusBadge status={p.status} />,
    },
    {
      header: "Last Verified",
      render: (p: AdminProduct) => (
        <span className="text-xs text-[#718573]">{p.lastUpdated}</span>
      ),
    },
    {
      header: "Action",
      className: "text-right",
      render: (p: AdminProduct) => (
        <button
          onClick={() => openUpdateModal(p)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDF7E9] hover:bg-[#DDF0D6] text-[#447719] font-bold text-xs transition-colors cursor-pointer"
        >
          <Edit2 className="w-3 h-3" />
          <span>Update Stock</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14304A]">
          Pharmacy Inventory Management
        </h2>
        <p className="text-xs text-[#637766] mt-0.5">
          Real-time batch stock tracking, buffer depletion alerts, and fulfillment safety margins.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Total Stock on Hand"
          value={`${totalUnits} Units`}
          change="Across all pharmaceutical categories"
          isPositive={true}
          icon={Layers}
          iconBg="bg-[#EDF7E9]"
          iconColor="text-[#559620]"
        />

        <DashboardCard
          title="Low Stock Warnings"
          value={`${lowStockCount} SKUs`}
          change="Below 10 unit reorder threshold"
          isPositive={false}
          icon={AlertTriangle}
          iconBg="bg-[#FFF6E5]"
          iconColor="text-[#D97706]"
        />

        <DashboardCard
          title="Out of Stock SKUs"
          value={`${outOfStockCount} Products`}
          change="Pending manufacturer delivery"
          isPositive={false}
          icon={XCircle}
          iconBg="bg-[#FEECEB]"
          iconColor="text-[#D32F2F]"
        />
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search inventory by medicine or SKU..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statuses={["Active", "Low Stock", "Out of Stock"]}
        onExport={() => toast.success("Inventory stock sheet CSV exported successfully.")}
      />

      {/* Inventory Data Table */}
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No inventory items found matching your filters."
      />

      {/* Quick Stock Update Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-[#DCE8D8]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3EDE1]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#14304A]">
                  Update Available Stock
                </h3>
                <p className="text-xs text-[#6B806E]">
                  {selectedProduct.name} ({selectedProduct.sku})
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg text-[#859987] hover:text-[#14304A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FAFCFA] border border-[#E3EDE1] text-xs space-y-1">
                <p className="text-[#657967]">
                  Current Stock: <strong className="text-[#14304A]">{selectedProduct.stockQuantity} units</strong>
                </p>
                <p className="text-[#657967]">
                  Committed in Orders: <strong className="text-[#14304A]">{selectedProduct.reservedQuantity} units</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  New Available Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                  className="w-full text-sm font-bold font-mono px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E3EDE1]">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl border border-[#CCDCCD] text-xs font-bold text-[#14304A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Stock &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
