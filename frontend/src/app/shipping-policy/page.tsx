"use client";

import React from "react";
import Link from "next/link";
import { Truck, ShieldCheck, MapPin, Clock } from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export default function ShippingPolicyPage() {
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
            <span className="text-[#14304A] font-semibold">Shipping &amp; Delivery</span>
          </nav>

          {/* Document Container */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-12 shadow-2xs">
            <div className="border-b border-[#E3EDE1] pb-6 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-xs font-bold uppercase tracking-wider mb-2.5">
                <Truck className="w-3.5 h-3.5" />
                <span>FAST &amp; SAFE MEDICINE LOGISTICS</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#14304A] tracking-tight">
                Shipping &amp; Delivery Policy
              </h1>
              <p className="text-xs text-[#718573] mt-2">
                Last updated: September 2026 | Genekon Pharmaceuticals Pvt. Ltd.
              </p>
            </div>

            <div className="space-y-8 text-xs sm:text-sm text-[#3E5342] leading-relaxed">
              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  1. Delivery Coverage
                </h2>
                <p>
                  Genekon Pharmaceuticals delivers across Nagpur city via our dedicated local fleet, as well as pan-India through top tier cold-chain certified courier partners (BlueDart, Delhivery Healthcare).
                </p>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  2. Shipping Options &amp; Delivery Timelines
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div className="rounded-2xl border border-[#DCE8D8] bg-[#FAFCFA] p-4">
                    <div className="flex items-center gap-2 text-[#559620] font-bold text-xs mb-1">
                      <Clock className="w-4 h-4" />
                      <span>Nagpur Local Express Delivery</span>
                    </div>
                    <p className="font-serif text-base font-bold text-[#14304A]">
                      Same-Day or Within 24 Hours
                    </p>
                    <p className="text-xs text-[#637766] mt-1">
                      Available for all orders placed before 3:00 PM within Nagpur municipal limits.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#DCE8D8] bg-[#FAFCFA] p-4">
                    <div className="flex items-center gap-2 text-[#1853A8] font-bold text-xs mb-1">
                      <Truck className="w-4 h-4" />
                      <span>Standard Regional Dispatch</span>
                    </div>
                    <p className="font-serif text-base font-bold text-[#14304A]">
                      2 to 4 Business Days
                    </p>
                    <p className="text-xs text-[#637766] mt-1">
                      Applicable for rest of Maharashtra and major Indian metro locations.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  3. Shipping Charges &amp; Free Delivery Threshold
                </h2>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong className="text-[#14304A]">Orders of ₹500 and above:</strong> 100% FREE Standard Delivery.
                  </li>
                  <li>
                    <strong className="text-[#14304A]">Orders below ₹500:</strong> Nominal flat shipping fee of ₹40.
                  </li>
                  <li>
                    <strong className="text-[#14304A]">Express Same-Day Delivery (Nagpur):</strong> ₹40 flat fee.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  4. Cold-Chain Certified Packaging
                </h2>
                <p>
                  Temperature-sensitive medicines (including insulin, eye drops, and select biologicals) are dispatched inside insulated polyurethane boxes equipped with certified frozen gel refrigerant packs, ensuring strict 2°C to 8°C temperature retention throughout transit.
                </p>
              </section>

              <section>
                <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
                  5. Real-Time Tracking
                </h2>
                <p>
                  As soon as your order is packed and dispatched, you will receive an SMS and WhatsApp notification with your live tracking AWB. You can also monitor real-time progress anytime via our{" "}
                  <Link href="/track-order" className="text-[#559620] font-bold underline">
                    Track Order Portal
                  </Link>.
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
