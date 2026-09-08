"use client";

import React from "react";
import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export default function TermsPage() {
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
            <span className="text-[#14304A] font-semibold">Terms &amp; Conditions</span>
          </nav>

          {/* Document Container */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-12 shadow-2xs">
            <div className="border-b border-[#E3EDE1] pb-6 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-xs font-bold uppercase tracking-wider mb-2.5">
                <FileText className="w-3.5 h-3.5" />
                <span>LEGAL &amp; REGULATORY TERMS</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#14304A] tracking-tight">
                Terms of Service
              </h1>
              <p className="text-xs text-[#718573] mt-2">
                Last updated: September 2026 | Genekon Pharmaceuticals Pvt. Ltd.
              </p>
            </div>

            <div className="space-y-8 text-xs sm:text-sm text-[#3E5342] leading-relaxed">
              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or purchasing from Genekon Pharmaceuticals, you agree to be bound by these Terms of Service. If you do not agree to these terms, you should not access our digital store or utilize our ordering services.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  2. Prescription Dispensing Guidelines
                </h2>
                <p>
                  In accordance with the Drugs and Cosmetics Act of India, Schedule H, H1, and X pharmaceutical medications will strictly NOT be dispensed without a valid, legible prescription issued by a registered medical practitioner. Genekon reserves the absolute right to reject or cancel orders if a prescription is expired, unclear, forged, or inconsistent with safe clinical dispensing standards.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  3. Pricing &amp; Batch Availability
                </h2>
                <p>
                  Product prices are listed in Indian Rupees (INR) inclusive of all applicable GST taxes. While we maintain rigorous inventory synchronization, occasional stock changes may necessitate batch substitutions with identical chemical salt equivalents upon customer consent.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  4. Medical Advice Disclaimer
                </h2>
                <p>
                  The informational content, articles, and product descriptions available on Genekon are provided strictly for educational purposes and do not constitute a substitute for direct clinical advice, diagnosis, or treatment by a qualified doctor.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  5. Governing Law &amp; Jurisdiction
                </h2>
                <p>
                  These terms are governed exclusively by the laws of India. Any disputes arising out of the services rendered shall be subject to the exclusive jurisdiction of the competent courts in Nagpur, Maharashtra.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
