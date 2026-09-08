"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Layers,
  FileText,
  BadgeCheck,
  PhoneCall,
  Users
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

const TARGET_SECTORS = [
  {
    title: "Retail Pharmacies & Chemists",
    desc: "Consistent stock of top 500 essential fast-moving molecules, fast refill cycles, and wholesale margins that protect your profitability.",
    icon: Building2,
    benefits: ["Priority restocking", "Single-invoice consolidated orders", "Free doorstep delivery in Nagpur"],
  },
  {
    title: "Clinics & Nursing Homes",
    desc: "Surgical disposables, emergency injectables, IV fluids, and everyday clinic essentials directly dispatched with valid batch test reports.",
    icon: Users,
    benefits: ["Small-batch bulk pricing", "Emergency same-day delivery", "Doctor sample support"],
  },
  {
    title: "Multispeciality Hospitals",
    desc: "End-to-end pharmaceutical procurement contracts, strict cold-chain compliance, ICU critical care medicines, and scheduled routine deliveries.",
    icon: ShieldCheck,
    benefits: ["Form 20B/21B licensed sourcing", "Dedicated institutional manager", "Custom net payment terms"],
  },
  {
    title: "Corporate Wellness & Enterprises",
    desc: "Workplace first aid infrastructure, corporate executive health packages, diagnostics, and employee prescription fulfillment programs.",
    icon: Layers,
    benefits: ["Bulk wellness kits", "Employee discount perks", "Quarterly audit reports"],
  },
];

const B2B_BENEFITS = [
  {
    icon: TrendingDown,
    title: "Competitive Wholesale Pricing",
    desc: "Volume-based tier discounts direct from pharmaceutical manufacturers. No unverified middleman margins.",
  },
  {
    icon: Truck,
    title: "Reliable, Temperature-Controlled Supply",
    desc: "Maintained cold-chain facilities for insulin, vaccines, and biologics with daily dispatch routes across central India.",
  },
  {
    icon: FileText,
    title: "100% Tax Compliant & Batch Verified",
    desc: "Every shipment is accompanied by a compliant GST tax invoice and manufacturer batch analysis certificate.",
  },
  {
    icon: BadgeCheck,
    title: "Flexible Credit Facilities",
    desc: "Verified institutional partners enjoy 15 to 30 days credit cycles and flexible digital payment options.",
  },
];

export default function WholesaleLandingPage() {
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
            <span className="text-[#14304A] font-semibold">Wholesale Healthcare Supply</span>
          </nav>

          {/* B2B Hero Section */}
          <div className="relative rounded-3xl border border-[#DCE8D8] bg-linear-to-br from-[#14304A] via-[#10273F] to-[#0A1B2D] text-white p-8 sm:p-14 mb-14 overflow-hidden shadow-md">
            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#559620] text-white text-xs font-bold uppercase tracking-wider mb-4">
                <Building2 className="w-3.5 h-3.5" />
                <span>B2B INSTITUTIONAL PHARMACY</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl tracking-tight leading-tight">
                Reliable Healthcare Supply Partner <br />
                For Growing Businesses.
              </h1>
              <p className="text-xs sm:text-base text-[#D5E2D7] mt-4 leading-relaxed max-w-2xl">
                We supply licensed retail medical stores, clinics, hospitals, and corporate healthcare centers with guaranteed authentic medicines, cold-chain assurance, and dependable wholesale pricing.
              </p>

              {/* Target Pills */}
              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#98AD9C] font-semibold">Serving:</span>
                {["Pharmacies", "Clinics", "Hospitals", "Corporate Healthcare"].map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-full bg-white/10 text-white font-semibold border border-white/10"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/wholesale/register"
                  className="px-6 py-3 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Become a Partner</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="https://wa.me/919370102691?text=Hello%20Genekon,%20I%20would%20like%20to%20request%20the%20Wholesale%20Product%20Rate%20Card"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-[#25D366]" />
                  <span>Talk to Wholesale Manager</span>
                </a>
              </div>
            </div>
          </div>

          {/* Target Sectors 4-Box Grid */}
          <div className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-xs font-bold uppercase tracking-wider mb-2.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>WHO WE SUPPLY</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#14304A] tracking-tight">
                Tailored Solutions for Every Healthcare Facility
              </h2>
              <p className="text-xs sm:text-sm text-[#5D7160] mt-1.5">
                Whether you run a standalone medical shop or an entire hospital floor, we adapt to your order cadence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TARGET_SECTORS.map((sector, i) => {
                const Icon = sector.icon;
                return (
                  <div
                    key={i}
                    className="rounded-3xl border border-[#DCE8D8] bg-white p-7 sm:p-8 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center mb-5">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif text-xl text-[#14304A] font-bold">
                        {sector.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#617664] mt-2.5 leading-relaxed">
                        {sector.desc}
                      </p>

                      <div className="mt-5 space-y-2 border-t border-[#EAF2E8] pt-4">
                        {sector.benefits.map((b, bi) => (
                          <div key={bi} className="flex items-center gap-2 text-xs font-semibold text-[#14304A]">
                            <CheckCircle2 className="w-4 h-4 text-[#559620] shrink-0" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-3">
                      <Link
                        href="/wholesale/register"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#559620] hover:underline"
                      >
                        <span>Register your {sector.title.split(" ")[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* B2B Benefits Grid */}
          <div className="mb-16 rounded-3xl border border-[#DCE8D8] bg-white p-8 sm:p-12 shadow-2xs">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#14304A] tracking-tight">
                Why Healthcare Businesses Choose Genekon
              </h2>
              <p className="text-xs sm:text-sm text-[#5C705F] mt-1.5">
                Built specifically to solve supply volatility, counterfeit risks, and cash flow strain for healthcare operators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {B2B_BENEFITS.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="p-4 rounded-2xl bg-[#FAFCFA] border border-[#E3EDE1]">
                    <div className="w-10 h-10 rounded-xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-serif text-base font-bold text-[#14304A]">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-[#637766] mt-2 leading-relaxed">
                      {benefit.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wholesale Registration Callout */}
          <div className="rounded-3xl border border-[#DCE8D8] bg-[#14304A] text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-sm">
            <div className="max-w-2xl mx-auto space-y-3">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#9ED872]">
                FAST ONBOARDING WITHIN 24 HOURS
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl tracking-tight">
                Ready to Simplify Your Medicine Procurement?
              </h2>
              <p className="text-xs sm:text-sm text-[#D1E0D4] leading-relaxed">
                Complete our simple partner onboarding form with your GST and Drug License number to unlock wholesale catalog pricing.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/wholesale/register"
                  className="px-6 py-3 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs sm:text-sm font-bold transition-all shadow-xs"
                >
                  Start Partner Registration &rarr;
                </Link>
                <Link
                  href="/contact"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition-all"
                >
                  Contact B2B Desk
                </Link>
              </div>
            </div>
          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
