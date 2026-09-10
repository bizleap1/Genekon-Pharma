"use client";

import React from "react";
import Link from "next/link";
import { RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export default function ReturnPolicyPage() {
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
            <span className="text-[#14304A] font-semibold">Returns &amp; Refunds</span>
          </nav>

          {/* Document Container */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-12 shadow-2xs">
            <div className="border-b border-[#E3EDE1] pb-6 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-xs font-bold uppercase tracking-wider mb-2.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>CUSTOMER SATISFACTION GUARANTEE</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#14304A] tracking-tight">
                Return, Refund &amp; Replacement Policy
              </h1>
              <p className="text-xs text-[#718573] mt-2">
                Last updated: September 2026 | Genekon Pharmaceuticals Pvt. Ltd.
              </p>
            </div>

            <div className="space-y-8 text-xs sm:text-sm text-[#3E5342] leading-relaxed">
              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  1. 7-Day Return Window
                </h2>
                <p>
                  We accept returns for eligible items within <strong className="text-[#14304A]">7 days</strong> of physical delivery under the following conditions:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>The product arrived damaged, leaked, or physically compromised during transit.</li>
                  <li>The product delivered does not match the item specified on your invoice or doctor prescription.</li>
                  <li>The product arrived with an expiry date within 30 days of receipt.</li>
                </ul>
              </section>

              <section className="rounded-2xl bg-[#FFF9F2] border border-[#F3DFC8] p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#14304A]">
                      Non-Returnable Medical Products (Statutory Rules)
                    </h3>
                    <p className="text-xs text-[#6F5943] mt-1 leading-relaxed">
                      In accordance with Indian Drugs and Cosmetics Rules, the following items CANNOT be returned once delivered for clinical safety reasons:
                    </p>
                    <ul className="list-disc pl-5 mt-2 text-xs text-[#6F5943] space-y-1">
                      <li>Temperature-sensitive refrigerated medicines (e.g. Insulin, Vaccines, Biological serums).</li>
                      <li>Opened blister strips, unsealed bottles, or medicines with broken tamper-evident seals.</li>
                      <li>Opened personal diagnostic devices (e.g. Blood glucose test strips, lancets).</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  2. How to Initiate a Return or Replacement
                </h2>
                <p>
                  Simply take a clear photograph of the damaged product and outer packaging seal, and send it to our WhatsApp support desk at{" "}
                  <strong className="text-[#559620]">+91 7666168147</strong> or email{" "}
                  <strong className="text-[#559620]">support@genekon.com</strong> with your Order ID. Our pharmacist will approve and arrange reverse pickup within 24 hours.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  3. Refund Processing Timelines
                </h2>
                <p>
                  Once the returned product arrives at our Nagpur facility and is verified, refunds will be credited back to your original payment method within <strong className="text-[#14304A]">3 to 5 business days</strong>. For Cash on Delivery (COD) orders, refunds are issued via direct UPI or bank NEFT transfer.
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
