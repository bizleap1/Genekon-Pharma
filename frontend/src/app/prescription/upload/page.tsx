"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  UserCheck,
  Clock,
  MessageCircle,
  Phone,
  Mail,
  Headphones,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  AlertCircle,
  X,
  FileCheck
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { useAuthStore } from "@/stores/authStore";
import { prescriptionService, UploadedPrescriptionRecord } from "@/services/prescriptionService";

const FAQS = [
  {
    q: "What types of prescriptions are accepted?",
    a: "We accept valid physical prescriptions written by registered medical practitioners (allopathic, ayurvedic, or dental) with doctor name, registration number, patient name, and date clearly visible.",
  },
  {
    q: "Can I upload a prescription on WhatsApp?",
    a: "Yes! You can simply click 'Send on WhatsApp' or message us at 9370102691 with your prescription photo. Our pharmacist will create your cart immediately.",
  },
  {
    q: "Is my prescription information confidential?",
    a: "Absolutely. All uploaded documents are stored in 256-bit encrypted secure medical servers and reviewed exclusively by licensed pharmacists.",
  },
  {
    q: "What if my prescription is not clear?",
    a: "If handwriting or dosage frequency is unclear, our licensed pharmacist will call you or message you to confirm details with your doctor before dispensing.",
  },
  {
    q: "How long does it take to process my order?",
    a: "Prescription verification typically takes 10-15 minutes during operating hours (9 AM – 9 PM). Once confirmed, medicines are dispatched promptly.",
  },
  {
    q: "Can I order without a prescription?",
    a: "For OTC essentials, vitamins, skincare, and personal care products, no prescription is required. Schedule H and X prescription drugs require a doctor's advice by Indian law.",
  },
];

export default function UploadPrescriptionPage() {
  const { user, isLoggedIn, openLoginModal } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [patientName, setPatientName] = useState(user?.name || "Prerna Sharma");
  const [notes, setNotes] = useState("");
  const [submittedRecord, setSubmittedRecord] = useState<UploadedPrescriptionRecord | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = prescriptionService.validateFile(file);
      if (!validation.valid) {
        setFileError(validation.error || "Invalid file");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      // Simulate brief upload progress
      setIsUploading(true);
      setUploadProgress(15);
      let p = 15;
      const interval = setInterval(() => {
        p += 30;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setIsUploading(false);
        }
        setUploadProgress(p);
      }, 120);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setFileError("");
  };

  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openLoginModal(
        {
          type: "UPLOAD_PRESCRIPTION",
          title: "Upload Prescription",
          redirectUrl: "/prescription/upload",
        },
        "Login required to submit and verify prescriptions"
      );
      return;
    }

    if (!selectedFile) {
      setFileError("Please select a prescription file to upload.");
      return;
    }

    setIsUploading(true);
    const record = await prescriptionService.uploadPrescription(
      selectedFile,
      { patientName, notes },
      (pct) => setUploadProgress(pct)
    );
    setIsUploading(false);
    setSubmittedRecord(record);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFA]">
      <UtilityBar />
      <Header />
      <CategoryNav />

      <main className="flex-1 py-6 sm:py-8">
        <Container>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#6F8271] mb-5">
            <Link href="/" className="hover:text-[#14304A] transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-[#14304A] font-semibold">Upload Prescription</span>
          </nav>

          {submittedRecord ? (
            /* Success Confirmation State */
            <div className="rounded-3xl border border-[#D5EAD0] bg-white p-8 sm:p-12 text-center max-w-lg mx-auto my-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#EDF7E9] text-[#559620] flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-9 h-9" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EDF7E9] text-[#447719] inline-block mb-2">
                Prescription Received
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A]">
                Submitted for Verification!
              </h1>
              <p className="text-xs sm:text-sm text-[#556958] mt-2 mb-5 leading-relaxed">
                Your prescription tracking ID is <strong>#{submittedRecord.id}</strong>. A registered pharmacist at our Nagpur Central Dispensary is currently inspecting your medication requirements.
              </p>

              <div className="p-4 rounded-xl bg-[#F4F9F2] text-xs text-[#3D5240] text-left mb-6 space-y-1.5 border border-[#D5EAD0]">
                <div className="flex justify-between">
                  <span className="text-[#687C68]">Patient:</span>
                  <strong>{submittedRecord.patientName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#687C68]">File:</span>
                  <span className="truncate max-w-[200px]">{submittedRecord.fileName} ({submittedRecord.fileSize})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#687C68]">Estimated Verification:</span>
                  <strong className="text-[#559620]">Within 10-15 Minutes</strong>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/account/prescriptions"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#559620] hover:bg-[#467e19] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-colors shadow-2xs"
                >
                  <span>View in My Prescriptions</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    setSubmittedRecord(null);
                    setSelectedFile(null);
                    setNotes("");
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-[#14304A] text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-colors cursor-pointer"
                >
                  <span>Upload Another Rx</span>
                </button>
              </div>
            </div>
          ) : (
            /* Main 3-Box Hero Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Box 1: Headline & 3 Highlights (Span 4) */}
              <div className="lg:col-span-4 flex flex-col justify-between rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-xs">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] uppercase text-[#687C67] mb-2">
                    YOUR HEALTH, OUR PRIORITY
                  </p>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] tracking-tight leading-tight">
                    Upload Your <br />
                    <span className="text-[#559620]">Prescription</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-[#506352] mt-3 leading-relaxed">
                    Get genuine medicines easily and safely. Upload your doctor&apos;s prescription and our licensed pharmacists will verify the dosage and prepare your order.
                  </p>
                </div>

                {/* 3 Trust Points */}
                <div className="mt-8 pt-6 border-t border-[#E5EFE3] space-y-3.5 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#14304A]">100% Confidential &amp; Safe</h4>
                      <p className="text-[11px] text-[#697C6B]">Encrypted under medical privacy standards</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#EBF3FC] text-[#1853A8] flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#14304A]">Pharmacist Audit</h4>
                      <p className="text-[11px] text-[#697C6B]">Verified by registered B.Pharm / M.Pharm</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF2E8] text-[#D97706] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#14304A]">Quick 15-Min Turnaround</h4>
                      <p className="text-[11px] text-[#697C6B]">Fast confirmation and dispatch</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Drag & Drop Upload + Form (Span 4) */}
              <div className="lg:col-span-4 rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#14304A] text-center mb-1">
                    Upload Doctor&apos;s Prescription
                  </h3>
                  <p className="text-xs text-[#697C6B] text-center mb-4">
                    Clear photo or scan (JPG, PNG, PDF &bull; Max 5 MB)
                  </p>

                  {/* Dropzone */}
                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-[#559620]/30 hover:border-[#559620] rounded-2xl p-6 transition-all bg-[#FAFCFA] flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-[#14304A] mb-1">
                        Select Prescription File
                      </span>
                      <p className="text-[11px] text-[#697C6B] mb-4">
                        Take a photo or browse from your device
                      </p>

                      <label className="inline-flex items-center gap-2 bg-[#559620] hover:bg-[#467e19] text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors cursor-pointer shadow-2xs">
                        <UploadCloud className="w-4 h-4" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    /* Selected File Card */
                    <div className="rounded-2xl border border-[#D5EAD0] bg-[#F4F9F2] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText className="w-5 h-5 text-[#559620] shrink-0" />
                          <div className="overflow-hidden text-left">
                            <span className="text-xs font-bold text-[#14304A] truncate block">
                              {selectedFile.name}
                            </span>
                            <span className="text-[10px] text-[#697C6B]">
                              {prescriptionService.formatFileSize(selectedFile.size)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearFile}
                          className="text-[#8CA08E] hover:text-red-500 p-1 cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      {isUploading && (
                        <div className="w-full h-1.5 rounded-full bg-[#D5EAD0] overflow-hidden">
                          <div
                            className="h-full bg-[#559620] transition-all duration-150"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}

                      <div className="text-[11px] font-bold text-[#559620] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Document ready for pharmacist inspection</span>
                      </div>
                    </div>
                  )}

                  {fileError && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#FEECEB] border border-[#F8C8C5] text-xs font-bold text-[#E02D3C] flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{fileError}</span>
                    </div>
                  )}

                  {/* Patient Name & Notes Inputs */}
                  <form onSubmit={handleSubmitPrescription} className="mt-4 space-y-3 text-left">
                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        Patient Full Name
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Name on prescription"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] outline-none focus:border-[#559620]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        Special Instructions / Refill Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Please dispense 30 days quantity only"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] outline-none focus:border-[#559620] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedFile || isUploading}
                      className="w-full py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Submit to Pharmacist</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* WhatsApp Alternative */}
                <div className="mt-4 pt-3 border-t border-[#E8EFE6] text-center">
                  <div className="p-3 rounded-2xl bg-[#F0F8EC] border border-[#D5EAD0]">
                    <a
                      href="https://wa.me/919370102691?text=Hi%20Genekon,%20I%20am%20sharing%20my%20prescription%20for%20ordering%20medicines."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors w-full shadow-2xs"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Send on WhatsApp</span>
                    </a>
                    <p className="text-[10px] text-[#526657] mt-1">
                      Direct photo upload via WhatsApp also accepted
                    </p>
                  </div>
                </div>
              </div>

              {/* Box 3: Need Help Support Desk (Span 4) */}
              <div className="lg:col-span-4 rounded-3xl border border-[#DCE8D8] bg-[#F4F9F2] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 fill-white text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#14304A]">Need Help?</h3>
                      <p className="text-xs text-[#526657]">We&apos;re Just a Message Away.</p>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/919370102691"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between text-xs font-bold text-[#559620] bg-white border border-[#CADFC5] px-4 py-2 rounded-xl w-full hover:bg-slate-50 transition-colors mb-5"
                  >
                    <span>Chat on WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>

                  {/* Direct Contact List */}
                  <div className="space-y-3 pt-3 border-t border-[#D5EAD0] text-xs text-[#14304A]">
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#1853A8]" />
                      <div>
                        <span className="text-[#697C6B] block text-[10px]">Call Central Desk</span>
                        <a href="tel:9370102691" className="font-bold hover:underline">
                          9370102691
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-[#1853A8]" />
                      <div>
                        <span className="text-[#697C6B] block text-[10px]">Email Support</span>
                        <a href="mailto:support@genekonpharma.com" className="font-bold hover:underline">
                          support@genekonpharma.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 pt-1">
                      <Headphones className="w-4 h-4 text-[#559620] mt-0.5" />
                      <div>
                        <span className="font-bold block">Talk to Our Pharmacist Team</span>
                        <span className="text-[11px] text-[#556958]">
                          Assistance with substitute generics &amp; availability
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Operating Hours */}
                <div className="mt-4 pt-3 border-t border-[#D5EAD0] flex items-center justify-between text-[11px] text-[#556958]">
                  <span>Registered Pharmacists On Duty</span>
                  <span className="font-bold text-[#559620]">9 AM - 9 PM</span>
                </div>
              </div>

            </div>
          )}

          {/* FAQs Section */}
          <div className="mt-12 pt-8 border-t border-[#E3EDE1] max-w-3xl mx-auto">
            <h2 className="font-serif text-xl sm:text-2xl text-[#14304A] text-center mb-6">
              Frequently Asked Questions About Prescriptions
            </h2>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E0ECE0] bg-white overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-[#14304A] hover:bg-[#FAFCFA] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-[#559620] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#8CA08E] shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-xs text-[#556958] leading-relaxed border-t border-[#F0F5EE] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
