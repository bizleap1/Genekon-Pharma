"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Truck,
  Eye,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download
} from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FilterBar } from "@/components/admin/FilterBar";
import { ADMIN_ORDERS, AdminOrder } from "@/data/adminData";
import { useToast } from "@/context/ToastContext";

export default function AdminOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>(ADMIN_ORDERS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: `All (${orders.length})` },
    { id: "processing", label: "Processing (1)" },
    { id: "shipped", label: "Shipped (1)" },
    { id: "delivered", label: "Delivered (2)" },
    { id: "cancelled", label: "Cancelled (1)" },
  ];

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesCust = o.customerName.toLowerCase().includes(q);
        const matchesPhone = o.customerPhone.includes(q);
        if (!matchesId && !matchesCust && !matchesPhone) return false;
      }
      if (activeTab !== "all" && o.orderStatus.toLowerCase() !== activeTab.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [orders, search, activeTab]);

  const columns = [
    {
      header: "Order ID",
      render: (o: AdminOrder) => (
        <Link
          href={`/admin/orders/${o.id}`}
          className="font-mono font-bold text-[#14304A] hover:text-[#559620] block"
        >
          {o.id}
        </Link>
      ),
    },
    {
      header: "Customer",
      render: (o: AdminOrder) => (
        <div>
          <span className="font-bold text-[#14304A] block">{o.customerName}</span>
          <span className="text-[11px] text-[#697D6B]">+91 {o.customerPhone}</span>
        </div>
      ),
    },
    {
      header: "Items",
      render: (o: AdminOrder) => (
        <div>
          <span className="font-semibold text-[#14304A]">
            {o.itemCount} items
          </span>
          <span className="text-[11px] text-[#718573] block truncate max-w-xs">
            {o.items.map((i) => i.name).join(", ")}
          </span>
        </div>
      ),
    },
    {
      header: "Order Value",
      render: (o: AdminOrder) => (
        <div>
          <span className="font-extrabold text-[#14304A]">₹{o.totalAmount}</span>
          <span className="text-[10px] text-[#6A806E] block">{o.paymentMethod}</span>
        </div>
      ),
    },
    {
      header: "Payment",
      render: (o: AdminOrder) => <StatusBadge status={o.paymentStatus} size="sm" />,
    },
    {
      header: "Order Status",
      render: (o: AdminOrder) => <StatusBadge status={o.orderStatus} />,
    },
    {
      header: "Date & Time",
      render: (o: AdminOrder) => (
        <span className="text-xs text-[#637766]">{o.orderDate}</span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (o: AdminOrder) => (
        <Link
          href={`/admin/orders/${o.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAFCFA] border border-[#CCDCCD] hover:bg-[#F0F5F1] text-xs font-bold text-[#14304A] transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-[#559620]" />
          <span>Details</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14304A]">
            Pharmacy Order Management
          </h2>
          <p className="text-xs text-[#637766] mt-0.5">
            Process retail dispatches, track temperature-controlled delivery partners, and manage returns.
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.success("Orders export CSV generated successfully.")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#559620]" />
          <span>Export Orders CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#E2EAE0] w-fit overflow-x-auto shadow-2xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#559620] text-white shadow-2xs"
                  : "text-[#14304A] hover:text-[#559620]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by Order ID, customer name or phone..."
      />

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No customer orders found matching your search or status filter."
      />

    </div>
  );
}
