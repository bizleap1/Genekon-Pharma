"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Phone,
  Search,
  X,
  ShieldCheck,
  MessageCircle
} from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FilterBar } from "@/components/admin/FilterBar";
import { ADMIN_PRESCRIPTIONS, AdminPrescription } from "@/data/adminData";
import { adminApi } from "@/api/admin";

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<AdminPrescription[]>([]);

  useEffect(() => {
    adminApi.getPendingPrescriptions().then((res) => {
      if (res.data) {
        setPrescriptions(res.data);
      }
    });
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inspectRx, setInspectRx] = useState<AdminPrescription | null>(null);
  const [actionAlert, setActionAlert] = useState("");

  const filtered = prescriptions.filter((rx) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!rx.customerName.toLowerCase().includes(q) && !rx.id.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (statusFilter !== "all" && rx.status !== statusFilter) return false;
    return true;
  });

  const handleAction = (id: string, newStatus: "Approved" | "Rejected" | "Information Requested") => {
    const decision = newStatus === "Approved" ? "APPROVED" : "REJECTED";
    adminApi.reviewPrescription(id, decision).catch(() => {});

    setPrescriptions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    setActionAlert(`Prescription ${id} marked as "${newStatus}".`);
    setInspectRx(null);
    setTimeout(() => setActionAlert(""), 3000);
  };

  const columns = [
    {
      header: "Rx ID",
      render: (rx: AdminPrescription) => (
        <span className="font-mono font-bold text-[#14304A]">{rx.id}</span>
      ),
    },
    {
      header: "Customer",
      render: (rx: AdminPrescription) => (
        <div>
          <span className="font-bold text-[#14304A] block">{rx.customerName}</span>
          <span className="text-[11px] text-[#697D6B]">+91 {rx.customerPhone}</span>
        </div>
      ),
    },
    {
      header: "Doctor & Clinic",
      render: (rx: AdminPrescription) => (
        <div>
          <span className="font-semibold text-[#14304A] block">{rx.doctorName}</span>
          <span className="text-[11px] text-[#718573]">{rx.clinicName}</span>
        </div>
      ),
    },
    {
      header: "Uploaded File",
      render: (rx: AdminPrescription) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#559620]" />
          <div>
            <span className="font-bold text-[#14304A] block">{rx.fileName}</span>
            <span className="text-[10px] text-[#788E7A]">{rx.fileSize} &bull; {rx.uploadDate}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Verification Status",
      render: (rx: AdminPrescription) => <StatusBadge status={rx.status} />,
    },
    {
      header: "Actions",
      className: "text-right",
      render: (rx: AdminPrescription) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setInspectRx(rx)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAFCFA] border border-[#CCDCCD] hover:bg-[#F2F7F1] text-xs font-bold text-[#14304A] cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#559620]" />
            <span>Inspect Rx</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14304A]">
          Clinical Prescription Review Queue
        </h2>
        <p className="text-xs text-[#637766] mt-0.5">
          Verify registered medical practitioner details, Schedule H regulations, dosage parameters, and drug interactions.
        </p>
      </div>

      {actionAlert && (
        <div className="p-4 rounded-2xl bg-[#EDF7E9] border border-[#CDE5C8] text-[#447719] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#559620]" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by Rx ID or patient name..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statuses={["Pending Review", "Approved", "Information Requested", "Rejected"]}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No prescriptions currently pending in this queue."
      />

      {/* Prescription Inspection Modal */}
      {inspectRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-[#DCE8D8]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3EDE1]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#559620]" />
                <h3 className="font-serif text-lg font-bold text-[#14304A]">
                  Review Prescription #{inspectRx.id}
                </h3>
              </div>
              <button
                onClick={() => setInspectRx(null)}
                className="p-1 rounded-lg text-[#859987] hover:text-[#14304A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#4F6452] mb-5">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#FAFCFA] border border-[#E3EDE1]">
                <p><strong>Patient:</strong> {inspectRx.customerName} (+91 {inspectRx.customerPhone})</p>
                <p><strong>Uploaded:</strong> {inspectRx.uploadDate}</p>
                <p><strong>Doctor:</strong> {inspectRx.doctorName}</p>
                <p><strong>Clinic:</strong> {inspectRx.clinicName}</p>
              </div>

              {inspectRx.notes && (
                <div className="p-3 rounded-xl bg-[#FFFBF2] border border-[#F3DFC8] text-[11px] text-[#785E42]">
                  <strong>Clinical Notes:</strong> {inspectRx.notes}
                </div>
              )}
            </div>

            {/* Simulated Medical Document Viewer */}
            <div className="rounded-2xl border-2 border-dashed border-[#CCDCCD] bg-[#FAFCFB] p-8 text-center mb-6">
              <FileText className="w-14 h-14 text-[#559620] mx-auto mb-2 opacity-80" />
              <p className="font-bold text-[#14304A] text-xs">
                {inspectRx.fileName} ({inspectRx.fileSize})
              </p>
              <p className="text-[11px] text-[#718573] mt-0.5">
                High-Resolution Scanned Prescription Document
              </p>
            </div>

            {/* Pharmacist Actions */}
            <div className="pt-3 border-t border-[#E3EDE1] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleAction(inspectRx.id, "Information Requested")}
                className="px-3.5 py-2 rounded-xl border border-[#D97706] text-[#D97706] hover:bg-[#FFF6E5] text-xs font-bold cursor-pointer"
              >
                Request Info
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAction(inspectRx.id, "Rejected")}
                  className="px-3.5 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer"
                >
                  Reject Rx
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(inspectRx.id, "Approved")}
                  className="px-5 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Approve &amp; Dispense
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
