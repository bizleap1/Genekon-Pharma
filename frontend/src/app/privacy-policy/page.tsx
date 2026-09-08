"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export default function PrivacyPolicyPage() {
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
            <span className="text-[#14304A] font-semibold">Privacy Policy</span>
          </nav>

          {/* Document Container */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-12 shadow-2xs">
            <div className="border-b border-[#E3EDE1] pb-6 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-xs font-bold uppercase tracking-wider mb-2.5">
                <Lock className="w-3.5 h-3.5" />
                <span>DATA PROTECTION &amp; CONFIDENTIALITY</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#14304A] tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xs text-[#718573] mt-2">
                Last updated: September 2026 | Genekon Pharmaceuticals Pvt. Ltd.
              </p>
            </div>

            <div className="space-y-8 text-xs sm:text-sm text-[#3E5342] leading-relaxed">
              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  1. Commitment to Patient Privacy
                </h2>
                <p>
                  Genekon Pharmaceuticals Pvt. Ltd. (&quot;Genekon&quot;, &quot;we&quot;, &quot;our&quot;) is deeply committed to protecting the privacy and confidentiality of personal health information. This Privacy Policy governs the collection, processing, and safeguarding of data collected through our website, WhatsApp prescription desks, and retail pharmacy operations in compliance with Indian Information Technology regulations and the Drugs &amp; Cosmetics Rules.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  2. Information We Collect
                </h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong className="text-[#14304A]">Personal Contact Details:</strong> Full name, delivery address, phone number, and email address.
                  </li>
                  <li>
                    <strong className="text-[#14304A]">Prescription Documents:</strong> Digital uploads or WhatsApp images of doctor prescriptions, physician name, patient name, and dosage instructions.
                  </li>
                  <li>
                    <strong className="text-[#14304A]">Transactional Details:</strong> Order items, order values, delivery preferences, and payment transaction IDs (we do not store sensitive credit card or UPI PINs).
                  </li>
                  <li>
                    <strong className="text-[#14304A]">B2B Credentials:</strong> GST registration numbers, Drug License copies (Form 20B/21B), and wholesale entity details.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  3. Prescription Confidentiality &amp; Medical Safeguards
                </h2>
                <p>
                  All uploaded medical prescriptions are stored on encrypted medical servers with 256-bit AES encryption. Prescriptions are accessible exclusively to licensed, registered clinical pharmacists for the purpose of validating dosages, checking drug interactions, and dispensing medications legally. We never sell, monetize, or disclose your medical history to advertising brokers.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  4. Sharing with Third-Party Logistics
                </h2>
                <p>
                  To fulfill doorstep deliveries, your shipping address and contact telephone number are securely shared with vetted logistics partners (e.g. BlueDart or Genekon internal courier personnel). Delivery personnel are never provided with your underlying diagnosis or medical conditions.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  5. Contact Our Privacy Officer
                </h2>
                <p>
                  For any questions or data deletion requests, please contact our Compliance Officer at{" "}
                  <a href="mailto:support@genekon.com" className="text-[#559620] font-bold underline">
                    support@genekon.com
                  </a>{" "}
                  or visit our registered dispensary at Gittikhadan, Katol Road, Nagpur, Maharashtra - 440013.
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
