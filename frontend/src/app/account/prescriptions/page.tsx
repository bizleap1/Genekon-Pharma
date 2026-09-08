"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  UploadCloud,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Calendar,
  User,
  Building2,
  X,
  ExternalLink
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { MOCK_PRESCRIPTIONS, CustomerPrescription } from "@/data/customer";

export default function PrescriptionsHistoryPage() {
  const [selectedRx, setSelectedRx] = useState<CustomerPrescription | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFA]">
      <UtilityBar />
      <Header />
      <CategoryNav />

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
            {/* Sidebar */}
            <AccountSidebar />

            {/* Main Content */}
            <div className="flex-1 w-full space-y-6">
              
              {/* Header */}
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

                {/* Prescriptions Grid */}
                <div className="space-y-4">
                  {MOCK_PRESCRIPTIONS.map((rx) => {
                    const isActive = rx.status === "Verified & Active";

                    return (
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
                                {rx.id}
                              </span>
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${rx.statusColor}`}>
                                {rx.status}
                              </span>
                            </div>

                            <h3 className="font-serif text-base font-bold text-[#14304A] mt-1">
                              {rx.doctorName}
                            </h3>
                            <p className="text-xs text-[#637766]">
                              {rx.clinicName}
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-[#788E7B] mt-2 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#559620]" />
                                Uploaded: {rx.uploadDate}
                              </span>
                              <span>&bull;</span>
                              <span>Valid till: {rx.validUntil}</span>
                              <span>&bull;</span>
                              <span>{rx.fileName} ({rx.fileSize})</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAF2E8]">
                          <button
                            type="button"
                            onClick={() => setSelectedRx(rx)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] hover:bg-[#F0F5F1] text-xs font-bold text-[#14304A] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#559620]" />
                            <span>View Rx</span>
                          </button>

                          {isActive && (
                            <Link
                              href="/category/medicines"
                              className="px-4 py-2 rounded-xl bg-[#14304A] hover:bg-[#10273F] text-white text-xs font-bold transition-colors"
                            >
                              Order Medicines
                            </Link>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Prescription Regulatory Compliance Callout */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-[#FAFCFA] p-6 sm:p-8 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-[#559620] shrink-0 mt-0.5" />
                <div className="text-xs text-[#526654] leading-relaxed">
                  <h4 className="font-serif text-sm font-bold text-[#14304A] mb-1">
                    Confidential &amp; Legally Compliant Storage
                  </h4>
                  <p>
                    In accordance with the Indian Drugs and Cosmetics Act, our licensed pharmacists archive your uploaded prescriptions for statutory dispensing audits. Your medical records are never monetized or shared with third parties.
                  </p>
                </div>
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
                  Prescription Document ({selectedRx.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRx(null)}
                className="p-1 rounded-lg text-[#859987] hover:text-[#14304A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#526654] mb-6">
              <p>
                <strong className="text-[#14304A]">Doctor:</strong> {selectedRx.doctorName}
              </p>
              <p>
                <strong className="text-[#14304A]">Clinic:</strong> {selectedRx.clinicName}
              </p>
              <p>
                <strong className="text-[#14304A]">Patient:</strong> {selectedRx.patientName}
              </p>
              <p>
                <strong className="text-[#14304A]">Upload Date:</strong> {selectedRx.uploadDate} &bull; Valid till: {selectedRx.validUntil}
              </p>
            </div>

            {/* Mock prescription visual preview */}
            <div className="rounded-2xl border-2 border-dashed border-[#C5D6C7] bg-[#FAFCFA] p-8 text-center mb-6">
              <FileText className="w-12 h-12 text-[#559620] mx-auto mb-2 opacity-80" />
              <p className="font-bold text-[#14304A] text-xs">
                {selectedRx.fileName}
              </p>
              <p className="text-[11px] text-[#718573] mt-0.5">
                Pharmacist Verified Digital Medical Record
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedRx(null)}
                className="px-4 py-2 rounded-xl border border-[#CCDCCD] text-xs font-bold text-[#14304A] hover:bg-[#F2F7F2]"
              >
                Close
              </button>
              <Link
                href="/category/medicines"
                className="px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold"
              >
                Order Medicines &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
