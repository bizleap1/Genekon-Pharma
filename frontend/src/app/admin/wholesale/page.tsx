"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  FileCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Phone,
  Mail,
  X,
  ShieldCheck,
  Download
} from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FilterBar } from "@/components/admin/FilterBar";
import { ADMIN_WHOLESALE_APPS, AdminWholesaleApp } from "@/data/adminData";
import { adminApi } from "@/api/admin";

export default function AdminWholesalePage() {
  const [apps, setApps] = useState<AdminWholesaleApp[]>([]);

  useEffect(() => {
    adminApi.getWholesaleApplications().then((res) => {
      if (res.data) {
        setApps(res.data);
      }
    });
  }, []);

  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<AdminWholesaleApp | null>(null);
  const [alertMsg, setAlertMsg] = useState("");

  const filtered = apps.filter((a) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!a.businessName.toLowerCase().includes(q) && !a.ownerName.toLowerCase().includes(q) && !a.gstNumber.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleStatus = (id: string, status: "Approved" | "Rejected") => {
    const decision = status === "Approved" ? "APPROVED" : "REJECTED";
    adminApi.reviewWholesaleApplication(id, decision).catch(() => {});

    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    setAlertMsg(`Wholesale application ${id} marked as "${status}".`);
    setSelectedApp(null);
    setTimeout(() => setAlertMsg(""), 3000);
  };

  const columns = [
    {
      header: "Business Name",
      render: (a: AdminWholesaleApp) => (
        <div>
          <span className="font-bold text-[#14304A] block">{a.businessName}</span>
          <span className="text-[11px] text-[#6B806F]">{a.city}</span>
        </div>
      ),
    },
    {
      header: "Owner / Director",
      accessor: "ownerName" as keyof AdminWholesaleApp,
    },
    {
      header: "Business Type",
      accessor: "businessType" as keyof AdminWholesaleApp,
    },
    {
      header: "Tax & Licensing",
      render: (a: AdminWholesaleApp) => (
        <div className="space-y-0.5 text-[11px]">
          <p className="font-mono font-bold text-[#14304A]">GST: {a.gstNumber}</p>
          <p className="font-mono text-[#6A806D]">DL: {a.drugLicenseNumber}</p>
        </div>
      ),
    },
    {
      header: "Expected Volume",
      accessor: "monthlyExpectedVolume" as keyof AdminWholesaleApp,
    },
    {
      header: "Status",
      render: (a: AdminWholesaleApp) => <StatusBadge status={a.status} />,
    },
    {
      header: "Actions",
      className: "text-right",
      render: (a: AdminWholesaleApp) => (
        <button
          onClick={() => setSelectedApp(a)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAFCFA] border border-[#CCDCCD] hover:bg-[#F2F7F1] text-xs font-bold text-[#14304A] cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-[#559620]" />
          <span>Verify</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14304A]">
          B2B Wholesale Partner Management
        </h2>
        <p className="text-xs text-[#637766] mt-0.5">
          Review business registration applications, statutory Form 20B/21B drug licenses, and credit tiers.
        </p>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-2xl bg-[#EDF7E9] border border-[#CDE5C8] text-[#447719] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#559620]" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by business name, owner or GSTIN..."
      />

      {/* Wholesale Table */}
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No wholesale applications found."
      />

      {/* Details & Verification Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-[#DCE8D8]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3EDE1]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#559620]" />
                <h3 className="font-serif text-lg font-bold text-[#14304A]">
                  Verify Partner Credentials
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-[#859987] hover:text-[#14304A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#4F6452] mb-6">
              <div className="p-4 rounded-xl bg-[#FAFCFA] border border-[#E3EDE1] space-y-2">
                <p><strong>Business Name:</strong> {selectedApp.businessName}</p>
                <p><strong>Owner / Contact:</strong> {selectedApp.ownerName}</p>
                <p><strong>Business Category:</strong> {selectedApp.businessType}</p>
                <p><strong>Contact Phone:</strong> +91 {selectedApp.phone}</p>
                <p><strong>Contact Email:</strong> {selectedApp.email}</p>
                <p><strong>Location:</strong> {selectedApp.city}</p>
                <p><strong>Expected Volume:</strong> {selectedApp.monthlyExpectedVolume}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#EDF7E9] border border-[#D4E6D2] space-y-1.5">
                <p className="flex items-center gap-1.5 text-[#14304A]">
                  <ShieldCheck className="w-4 h-4 text-[#559620]" />
                  <span>GSTIN: <strong className="font-mono">{selectedApp.gstNumber}</strong></span>
                </p>
                <p className="flex items-center gap-1.5 text-[#14304A]">
                  <FileCheck className="w-4 h-4 text-[#559620]" />
                  <span>Drug License (20B/21B): <strong className="font-mono">{selectedApp.drugLicenseNumber}</strong></span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E3EDE1] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleStatus(selectedApp.id, "Rejected")}
                className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold"
              >
                Reject Application
              </button>

              <button
                type="button"
                onClick={() => handleStatus(selectedApp.id, "Approved")}
                className="px-5 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Approve &amp; Activate B2B Pricing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
