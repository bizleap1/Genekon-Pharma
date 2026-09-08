"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Tag,
  Percent,
  Copy,
  Check,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Gift
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { ALL_PRODUCTS } from "@/data/products";

interface Coupon {
  code: string;
  discount: string;
  minOrder: string;
  description: string;
  expiry: string;
  badge: string;
}

const COUPONS: Coupon[] = [
  {
    code: "GENEKON20",
    discount: "Flat 20% OFF",
    minOrder: "Min order ₹499",
    description: "Get 20% off on your medicine and wellness orders. Valid across all verified brands.",
    expiry: "Valid till end of month",
    badge: "SITEWIDE",
  },
  {
    code: "FIRSTMED",
    discount: "Flat ₹150 OFF",
    minOrder: "Min order ₹699",
    description: "Welcome offer for your first healthcare order with Genekon Pharmacy.",
    expiry: "New Users Only",
    badge: "NEW USERS",
  },
  {
    code: "BULK500",
    discount: "Extra ₹500 OFF",
    minOrder: "Min order ₹2,999",
    description: "Special savings on high-value chronic refills, medical devices, and nutrition supplements.",
    expiry: "Limited Redemptions",
    badge: "DEVICE SPECIAL",
  },
];

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "high-discount" | "devices" | "nutrition">("all");

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const offerProducts = ALL_PRODUCTS.filter((product) => {
    if (!product.discountPercent || product.discountPercent <= 0) return false;
    if (activeTab === "high-discount") return product.discountPercent >= 18;
    if (activeTab === "devices") return product.category === "Medical Devices";
    if (activeTab === "nutrition") return product.category === "Vitamins & Nutrition";
    return true;
  });

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
            <span className="text-[#14304A] font-semibold">Special Offers &amp; Discounts</span>
          </nav>

          {/* Clean Healthcare Offers Hero */}
          <div className="relative rounded-3xl border border-[#DCE8D8] bg-linear-to-r from-[#EDF7E9] via-[#F6FAF4] to-white p-6 sm:p-10 mb-10 overflow-hidden shadow-2xs">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#559620]/15 text-[#3E7016] text-xs font-bold uppercase tracking-wider mb-3">
                <Gift className="w-3.5 h-3.5" />
                <span>Verified Health Savings</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#14304A] tracking-tight leading-tight">
                Quality Healthcare, <br />
                Priced Responsibly.
              </h1>
              <p className="text-xs sm:text-sm text-[#576B5A] mt-2.5 leading-relaxed">
                Save on essential prescription medicines, daily vitamins, dermatological care, and diagnostic medical equipment without ever compromising on authenticity.
              </p>
            </div>
          </div>

          {/* Available Promo Codes Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#14304A] tracking-tight">
                  Active Coupons &amp; Vouchers
                </h2>
                <p className="text-xs text-[#657967] mt-0.5">
                  Apply these codes at checkout for instant order deductions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {COUPONS.map((coupon) => {
                const isCopied = copiedCode === coupon.code;
                return (
                  <div
                    key={coupon.code}
                    className="relative rounded-2xl border border-dashed border-[#BCD5BA] bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#EDF7E9] text-[#447719]">
                          {coupon.badge}
                        </span>
                        <span className="text-[11px] text-[#869988] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {coupon.expiry}
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-[#14304A]">
                        {coupon.discount}
                      </h3>
                      <p className="text-xs font-semibold text-[#559620] mt-0.5">
                        {coupon.minOrder}
                      </p>
                      <p className="text-xs text-[#627765] mt-2 leading-relaxed">
                        {coupon.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#EAF2E8] flex items-center justify-between gap-2">
                      <code className="font-mono text-xs font-extrabold bg-[#F2F7F1] text-[#14304A] px-2.5 py-1.5 rounded-lg tracking-wider border border-[#D5E4D2]">
                        {coupon.code}
                      </code>

                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isCopied
                            ? "bg-[#559620] text-white"
                            : "bg-[#14304A] text-white hover:bg-[#10273F]"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discount Categories Filter Tabs */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EDE1]">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#14304A] tracking-tight">
                  Featured Healthcare Deals
                </h2>
                <p className="text-xs text-[#657967] mt-0.5">
                  Hand-picked savings on bestselling wellness and medicine items
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: "all" as const, label: "All Deals" },
                  { id: "high-discount" as const, label: "Flat 18%+ Off" },
                  { id: "nutrition" as const, label: "Vitamins & Nutrition" },
                  { id: "devices" as const, label: "Medical Devices" },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? "bg-[#559620] text-white shadow-2xs"
                          : "bg-white border border-[#D5DFE6] text-[#14304A] hover:bg-[#F2F7F2]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Offer Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4 mb-12">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Wholesale Bulk Supply Banner */}
          <div className="rounded-3xl border border-[#DCE8D8] bg-[#14304A] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#9ED872]">
                INSTITUTIONAL &amp; PHARMACY WHOLESALE
              </span>
              <h3 className="font-serif text-xl sm:text-2xl tracking-tight">
                Looking for Wholesale Medicine Supply?
              </h3>
              <p className="text-xs text-[#C5D5C8] max-w-xl">
                We supply licensed retail pharmacies, clinics, and hospitals with verified batch testing, GST invoices, and volume tier pricing.
              </p>
            </div>
            <Link
              href="/wholesale"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#559620] hover:bg-[#478218] text-white text-xs font-bold transition-all shrink-0 shadow-xs"
            >
              <span>Explore Wholesale Supply</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
