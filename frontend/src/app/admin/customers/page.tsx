"use client";

import React, { useState, useMemo } from "react";
import { Users, Search, Download, Eye, Phone, Mail, Building2 } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FilterBar } from "@/components/admin/FilterBar";
import { ADMIN_CUSTOMERS, AdminCustomer } from "@/data/adminData";
import { useToast } from "@/context/ToastContext";

export default function AdminCustomersPage() {
  const toast = useToast();
  const [customers, setCustomers] = useState<AdminCustomer[]>(ADMIN_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "Retail" | "Wholesale">("all");

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.phone.includes(q) && !c.email.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (activeTab !== "all" && c.type !== activeTab) return false;
      return true;
    });
  }, [customers, search, activeTab]);

  const columns = [
    {
      header: "Customer",
      render: (c: AdminCustomer) => (
        <div>
          <span className="font-bold text-[#14304A] block">{c.name}</span>
          <span className="font-mono text-[10px] text-[#788E7A]">{c.id}</span>
        </div>
      ),
    },
    {
      header: "Account Type",
      render: (c: AdminCustomer) => <StatusBadge status={c.type} size="sm" />,
    },
    {
      header: "Contact Details",
      render: (c: AdminCustomer) => (
        <div className="space-y-0.5 text-xs text-[#526654]">
          <p className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#559620]" />
            <span>+91 {c.phone}</span>
          </p>
          <p className="flex items-center gap-1">
            <Mail className="w-3 h-3 text-[#1853A8]" />
            <span>{c.email}</span>
          </p>
        </div>
      ),
    },
    {
      header: "Location",
      accessor: "city" as keyof AdminCustomer,
    },
    {
      header: "Lifetime Orders",
      render: (c: AdminCustomer) => (
        <span className="font-bold text-[#14304A]">
          {c.totalOrders} orders
        </span>
      ),
    },
    {
      header: "Total Spend",
      render: (c: AdminCustomer) => (
        <span className="font-extrabold text-[#14304A]">
          ₹{c.totalSpend.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Status",
      render: (c: AdminCustomer) => <StatusBadge status={c.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14304A]">
            Customer Directory
          </h2>
          <p className="text-xs text-[#637766] mt-0.5">
            Manage individual patients, polyclinics, and wholesale pharmaceutical clients.
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.success("Customer directory exported successfully.")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#559620]" />
          <span>Export Customer CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#E2EAE0] w-fit">
        {[
          { id: "all" as const, label: `All (${customers.length})` },
          { id: "Retail" as const, label: "Retail Patients" },
          { id: "Wholesale" as const, label: "Wholesale Clinics / B2B" },
        ].map((tab) => {
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
        searchPlaceholder="Search by patient name, phone or email..."
      />

      {/* Customers Table */}
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No customer accounts match your search criteria."
      />
    </div>
  );
}
