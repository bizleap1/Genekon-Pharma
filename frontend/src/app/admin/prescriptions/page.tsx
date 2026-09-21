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
  MessageCircle,
  Clock
} from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { prescriptionService, UploadedPrescriptionRecord } from "@/services/prescriptionService";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1 bg-[#EDF7E9] text-[#559620] px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
          <CheckCircle2 className="w-3 h-3" /> Approved
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1 bg-[#FEECEB] text-[#E02D3C] px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    case "NEEDS_REUPLOAD":
      return (
        <span className="inline-flex items-center gap-1 bg-[#FAF2E8] text-[#D97706] px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
          <AlertCircle className="w-3 h-3" /> Needs Re-upload
        </span>
      );
    case "USED_FOR_ORDER":
      return (
        <span className="inline-flex items-center gap-1 bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
          <CheckCircle2 className="w-3 h-3" /> Used for Order
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 bg-[#EBF3FC] text-brand-primary px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
  }
};

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<UploadedPrescriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = () => {
    setLoading(true);
    prescriptionService.getAllAdminPrescriptions().then((data) => {
      setPrescriptions(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inspectRx, setInspectRx] = useState<UploadedPrescriptionRecord | null>(null);
  const [actionAlert, setActionAlert] = useState("");
  
  // For Rejection / Needs Re-upload note
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState<"REJECTED" | "NEEDS_REUPLOAD" | null>(null);

  const filtered = prescriptions.filter((rx) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !(rx.patientName || "").toLowerCase().includes(q) && 
        !(rx.id || "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (statusFilter !== "all" && rx.status !== statusFilter) return false;
    return true;
  });

  const handleAction = async (id: string, decision: "APPROVED" | "REJECTED" | "NEEDS_REUPLOAD") => {
    if ((decision === "REJECTED" || decision === "NEEDS_REUPLOAD") && !showRejectInput) {
      setShowRejectInput(decision);
      return;
    }
    
    if ((decision === "REJECTED" || decision === "NEEDS_REUPLOAD") && !rejectionReason.trim()) {
      alert("Please provide a reason.");
      return;
    }

    try {
      const updated = await prescriptionService.reviewPrescription(id, decision, decision === "APPROVED" ? undefined : rejectionReason);
      setPrescriptions((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
      setActionAlert(`Prescription ${id.substring(0,8)} marked as ${decision}.`);
      setInspectRx(null);
      setShowRejectInput(null);
      setRejectionReason("");
      setTimeout(() => setActionAlert(""), 3000);
    } catch(err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const columns = [
    {
      header: "Rx ID",
      render: (rx: UploadedPrescriptionRecord) => (
        <span className="font-mono font-bold text-[#14304A]">#{rx.id.substring(0,8)}</span>
      ),
    },
    {
      header: "Patient",
      render: (rx: UploadedPrescriptionRecord) => (
        <div>
          <span className="font-bold text-[#14304A] block">{rx.patientName || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Uploaded File",
      render: (rx: UploadedPrescriptionRecord) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#559620]" />
          <div>
            <span className="font-bold text-[#14304A] block">{rx.fileName}</span>
            <span className="text-[10px] text-[#788E7A]">{prescriptionService.formatFileSize(rx.fileSize)} &bull; {new Date(rx.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Verification Status",
      render: (rx: UploadedPrescriptionRecord) => <StatusBadge status={rx.status} />,
    },
    {
      header: "Actions",
      className: "text-right",
      render: (rx: UploadedPrescriptionRecord) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setInspectRx(rx)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAFCFA] border border-[#CCDCCD] hover:bg-[#F2F7F1] text-xs font-bold text-[#14304A] cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#559620]" />
            <span>Inspect</span>
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
        searchPlaceholder="Search by patient name..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statuses={["PENDING", "APPROVED", "REJECTED", "NEEDS_REUPLOAD", "USED_FOR_ORDER"]}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage={loading ? "Loading..." : "No prescriptions found."}
      />

      {/* Prescription Inspection Modal */}
      {inspectRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-[#DCE8D8] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3EDE1]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#559620]" />
                <h3 className="font-serif text-lg font-bold text-[#14304A]">
                  Review Prescription #{inspectRx.id.substring(0,8)}
                </h3>
              </div>
              <button
                onClick={() => {
                  setInspectRx(null);
                  setShowRejectInput(null);
                  setRejectionReason("");
                }}
                className="p-1 rounded-lg text-[#859987] hover:text-[#14304A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#4F6452] mb-5">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#FAFCFA] border border-[#E3EDE1]">
                <p><strong>Patient:</strong> {inspectRx.patientName}</p>
                <p><strong>Uploaded:</strong> {new Date(inspectRx.createdAt || Date.now()).toLocaleString()}</p>
                <p><strong>Status:</strong> <StatusBadge status={inspectRx.status} /></p>
                <p><strong>Doctor:</strong> {inspectRx.doctorName || "Not verified"}</p>
              </div>

              {inspectRx.customerNote && (
                <div className="p-3 rounded-xl bg-[#FFFBF2] border border-[#F3DFC8] text-[11px] text-[#785E42]">
                  <strong>Customer Note:</strong> {inspectRx.customerNote}
                </div>
              )}
              {inspectRx.rejectionReason && (
                <div className="p-3 rounded-xl bg-[#FEECEB] border border-[#F8C8C5] text-[11px] text-[#E02D3C]">
                  <strong>Rejection/Reupload Reason:</strong> {inspectRx.rejectionReason}
                </div>
              )}
            </div>

            {/* Document Viewer */}
            <div className="rounded-2xl border-2 border-dashed border-[#CCDCCD] bg-[#FAFCFB] p-8 text-center mb-6">
              <FileText className="w-14 h-14 text-[#559620] mx-auto mb-2 opacity-80" />
              <p className="font-bold text-[#14304A] text-xs">
                {inspectRx.fileName} ({prescriptionService.formatFileSize(inspectRx.fileSize)})
              </p>
              {inspectRx.fileUrl ? (
                <a href={inspectRx.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#559620] font-bold hover:underline mt-2 inline-block">
                  Open Original File ↗
                </a>
              ) : (
                <p className="text-[11px] text-[#718573] mt-0.5">
                  Secure Medical Record
                </p>
              )}
            </div>

            {/* Pharmacist Actions */}
            {inspectRx.status !== "USED_FOR_ORDER" && (
              <div className="pt-3 border-t border-[#E3EDE1]">
                {showRejectInput ? (
                  <div className="space-y-3 mb-4 animate-in fade-in zoom-in-95">
                    <label className="block text-xs font-bold text-[#14304A]">
                      Reason for {showRejectInput === "NEEDS_REUPLOAD" ? "Re-upload Request" : "Rejection"}
                    </label>
                    <textarea 
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g., Prescription date is too old or handwriting illegible."
                      className="w-full text-xs p-2 border border-[#CCDCCD] rounded-lg outline-none focus:border-[#559620]"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowRejectInput(null)} className="px-3 py-1.5 text-xs border rounded-lg cursor-pointer">Cancel</button>
                      <button onClick={() => handleAction(inspectRx.id, showRejectInput)} className={`px-3 py-1.5 text-xs text-white rounded-lg cursor-pointer ${showRejectInput === 'NEEDS_REUPLOAD' ? 'bg-[#D97706]' : 'bg-red-600'}`}>Confirm {showRejectInput === 'NEEDS_REUPLOAD' ? 'Request' : 'Reject'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleAction(inspectRx.id, "NEEDS_REUPLOAD")}
                      className="px-3.5 py-2 rounded-xl border border-[#D97706] text-[#D97706] hover:bg-[#FFF6E5] text-xs font-bold cursor-pointer"
                    >
                      Request Re-upload
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(inspectRx.id, "REJECTED")}
                        className="px-3.5 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer"
                      >
                        Reject Rx
                      </button>
                      {inspectRx.status !== "APPROVED" && (
                        <button
                          type="button"
                          onClick={() => handleAction(inspectRx.id, "APPROVED")}
                          className="px-5 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Approve Rx
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
