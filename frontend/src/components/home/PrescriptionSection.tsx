"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  UserCheck,
  Truck,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Lock,
  Clock
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProtectedAction } from "@/components/auth/ProtectedAction";

const STEPS = [
  {
    step: "01",
    title: "Upload Prescription",
    desc: "Take a clear photo or upload a PDF of your doctor's valid prescription in seconds.",
    icon: UploadCloud,
    badgeBg: "bg-[#EBF3FC]",
    badgeText: "text-[#1853A8]",
    borderHover: "hover:border-[#1853A8]/40",
  },
  {
    step: "02",
    title: "Pharmacist Verification",
    desc: "Licensed pharmacists review dosages, cross-check contraindications, and confirm your order.",
    icon: UserCheck,
    badgeBg: "bg-[#EDF7E9]",
    badgeText: "text-[#559620]",
    borderHover: "hover:border-[#559620]/40",
  },
  {
    step: "03",
    title: "Medicine Delivery",
    desc: "Your medications are securely sealed in tamper-proof packages and promptly delivered to your door.",
    icon: Truck,
    badgeBg: "bg-[#FAF2E8]",
    badgeText: "text-[#D97706]",
    borderHover: "hover:border-[#D97706]/40",
  },
];

export const PrescriptionSection: React.FC = () => {
  const router = useRouter();

  return (
    <section className="py-8 sm:py-12 bg-white">
      <Container>
        <div className="relative rounded-3xl border border-[#DCE9D8] bg-gradient-to-br from-[#FAFCFB] via-[#F4F9F2]/70 to-[#F6FAF4] p-6 sm:p-10 lg:p-12 shadow-xs overflow-hidden">
          
          {/* Top Headline & Intro */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#DDECE0]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#DCE9D8] text-[#559620] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>HASSLE-FREE RX ORDERING</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#14304A] tracking-tight leading-tight">
                Quick 3-Step <br className="hidden sm:inline" />
                <span className="text-[#559620]">Prescription Upload</span>
              </h2>

              <p className="mt-3 text-xs sm:text-sm text-[#4E6252] leading-relaxed max-w-xl">
                Have a prescription from your doctor? Upload it directly and our certified pharmacy team
                will verify the medicines, suggest affordable alternatives, and deliver them right to your doorstep.
              </p>
            </div>

            {/* Quick Upload CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <ProtectedAction
                action={{
                  type: "UPLOAD_PRESCRIPTION",
                  title: "Upload Prescription",
                  redirectUrl: "/prescription/upload",
                }}
                onAction={() => router.push("/prescription/upload")}
                customMessage="Login required to upload and submit prescriptions"
              >
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 bg-[#559620] hover:bg-[#467e19] text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-full transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Prescription Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </ProtectedAction>
            </div>
          </div>

          {/* 3-Step Visual Flow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mt-8 relative">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className={`group relative rounded-2xl border border-[#DDECE0] bg-white p-6 shadow-2xs ${s.borderHover} hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
                >
                  <div>
                    {/* Top Row: Icon & Step Number */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${s.badgeBg} ${s.badgeText} flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs`}>
                        <Icon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className="text-sm font-black font-mono text-[#7B8F7E]/50 tracking-wider">
                        STEP {s.step}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[#14304A] mb-2">
                      {s.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-xs sm:text-[13px] text-[#556958] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  {/* Flow indicator on card bottom */}
                  <div className="mt-5 pt-3 border-t border-[#EAF2E8] flex items-center justify-between text-[11px] font-bold text-[#559620]">
                    <span>Verified Process</span>
                    <span className="text-xs font-mono">✓</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Trust & Compliance Bar */}
          <div className="mt-8 pt-6 border-t border-[#DDECE0] flex flex-wrap items-center justify-between gap-4 text-xs text-[#556958]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#559620]" />
              <span>Valid prescription mandatory for Schedule H &amp; X drugs</span>
            </div>

            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#1853A8]" />
              <span>End-to-end encrypted medical record storage</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#559620]" />
              <span>Pharmacist verification within 15 minutes</span>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};
