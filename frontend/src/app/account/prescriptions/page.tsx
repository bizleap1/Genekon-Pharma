"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { prescriptionService, UploadedPrescriptionRecord } from "@/services/prescriptionService";
import { Clock, CheckCircle2, XCircle, FileText, UploadCloud, AlertCircle, Eye, Plus, Calendar, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

export default function PrescriptionsHistoryPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<UploadedPrescriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<UploadedPrescriptionRecord | null>(null);

  useEffect(() => {
    prescriptionService
      .getUserPrescriptions()
      .then((data) => setPrescriptions(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
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
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFA]">
      <main className="flex-1 py-8 sm:py-12">
        <Container>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#6F8271] mb-6">
            <Link href="/" className="hover:text-[#14304A] transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <Link href="/account" className="hover:text-[#14304A] transition-colors">
              My Account
            </Link>
            <span>&gt;</span>
            <span className="text-[#14304A] font-semibold">Prescriptions</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <AccountSidebar />

            <div className="flex-1 w-full space-y-6">
              <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E3EDE1] gap-4">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] font-bold">
                      Prescription Records
                    </h1>
                    <p className="text-xs sm:text-sm text-[#617564] mt-0.5">
                      Your uploaded doctor prescriptions are encrypted and verified by our registered clinical pharmacists.
                    </p>
                  </div>

                  <Link
                    href="/prescription/upload"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload New Rx</span>
                  </Link>
                </div>

                {loading ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-[#559620] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 bg-[#F4F9F2] text-[#559620] rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-[#14304A] mb-2">No prescriptions found</h3>
                    <p className="text-sm text-[#687C68] mb-6 max-w-sm mx-auto">
                      Upload a valid doctor's prescription to quickly order prescription-required medicines.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="rounded-2xl border border-[#E3EDE1] bg-white p-5 sm:p-6 shadow-2xs hover:border-[#559620]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center shrink-0 border border-[#D5E4D2]">
                            <FileText className="w-6 h-6" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-mono text-xs font-extrabold text-[#14304A]">
                                #{rx.id}
                              </span>
                              {getStatusBadge(rx.status)}
                            </div>

                            <h3 className="font-serif text-base font-bold text-[#14304A] mt-1">
                              {rx.doctorName || "Doctor details pending"}
                            </h3>
                            <p className="text-xs text-[#637766]">
                              Patient: {rx.patientName || "N/A"}
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-[#788E7B] mt-2 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#559620]" />
                                Uploaded: {new Date(rx.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                              <span>&bull;</span>
                              <span>{rx.fileName} ({prescriptionService.formatFileSize(rx.fileSize)})</span>
                            </div>

                            {rx.status === "NEEDS_REUPLOAD" && rx.rejectionReason && (
                              <div className="mt-3 p-2.5 bg-[#FAF2E8] border border-[#F2D7B6] rounded-xl text-xs text-[#D97706]">
                                <strong>Pharmacist Note:</strong> {rx.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAF2E8] w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setSelectedRx(rx)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] hover:bg-[#F0F5F1] text-xs font-bold text-[#14304A] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#559620]" />
                            <span>View details</span>
                          </button>

                          {rx.status === "APPROVED" && (
                            <Link
                              href="/category/medicines"
                              className="w-full sm:w-auto text-center px-4 py-2 rounded-xl bg-[#14304A] hover:bg-[#10273F] text-white text-xs font-bold transition-colors"
                            >
                              Order Medicines
                            </Link>
                          )}
                          
                          {rx.status === "NEEDS_REUPLOAD" && (
                            <Link
                              href="/prescription/upload"
                              className="w-full sm:w-auto text-center px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-colors"
                            >
                              Re-upload Rx
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </main>

      {/* View Prescription Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-[#DCE8D8]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E3EDE1]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#559620]" />
                <h3 className="font-serif text-lg font-bold text-[#14304A]">
                  Prescription #{selectedRx.id.substring(0, 8)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRx(null)}
                className="p-1 rounded-lg text-[#859987] hover:text-[#14304A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#526654] mb-6">
              <p><strong className="text-[#14304A]">Status:</strong> {getStatusBadge(selectedRx.status)}</p>
              <p><strong className="text-[#14304A]">Patient:</strong> {selectedRx.patientName || "N/A"}</p>
              <p><strong className="text-[#14304A]">Doctor:</strong> {selectedRx.doctorName || "Not verified yet"}</p>
              <p><strong className="text-[#14304A]">Upload Date:</strong> {new Date(selectedRx.createdAt || Date.now()).toLocaleDateString()}</p>
              {selectedRx.customerNote && (
                 <p><strong className="text-[#14304A]">Instructions:</strong> {selectedRx.customerNote}</p>
              )}
            </div>

            <div className="rounded-2xl border-2 border-dashed border-[#C5D6C7] bg-[#FAFCFA] p-8 text-center mb-6">
              <FileText className="w-12 h-12 text-[#559620] mx-auto mb-2 opacity-80" />
              <p className="font-bold text-[#14304A] text-xs">
                {selectedRx.fileName}
              </p>
              {selectedRx.fileUrl ? (
                <a href={selectedRx.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#559620] font-bold hover:underline mt-2 inline-block">
                  Open Original File ↗
                </a>
              ) : (
                <p className="text-[11px] text-[#718573] mt-0.5">
                  Secure Medical Record
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedRx(null)}
                className="px-4 py-2 rounded-xl border border-[#CCDCCD] text-xs font-bold text-[#14304A] hover:bg-[#F2F7F2] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
