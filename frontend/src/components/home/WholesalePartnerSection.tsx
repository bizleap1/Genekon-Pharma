"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Stethoscope,
  Store,
  PackageCheck,
  BadgePercent,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { Container } from "@/components/ui/Container";

const INSTITUTIONS = [
  {
    icon: Store,
    title: "Medical Stores & Retail",
    desc: "Seamless bulk medicine refills, high-margin OTC essentials, and dedicated credit terms for pharmacy owners.",
  },
  {
    icon: Stethoscope,
    title: "Clinics & OPD Practices",
    desc: "Direct delivery of daily clinical supplies, diagnostic test kits, and pre-packaged prescription therapies.",
  },
  {
    icon: Building2,
    title: "Hospitals & Nursing Homes",
    desc: "Institutional procurement with batch COA certification, priority SOS delivery, and ICU-grade inventory assurance.",
  },
];

const B2B_BENEFITS = [
  {
    icon: BadgePercent,
    title: "Wholesale Tier Pricing",
    subtitle: "Direct manufacturer-discounted pricing with transparent volume slabs.",
  },
  {
    icon: PackageCheck,
    title: "Verified & Compliant Supply",
    subtitle: "100% genuine batches with GST-compliant invoicing and manufacturer warranties.",
  },
  {
    icon: Truck,
    title: "Reliable Cold-Chain Logistics",
    subtitle: "Temperature-controlled distribution with guaranteed 24-48h dispatch windows.",
  },
];

export const WholesalePartnerSection: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <Container>
        <div className="relative rounded-3xl bg-gradient-to-br from-[#10273F] via-[#14304A] to-[#0D2135] text-white p-7 sm:p-10 lg:p-14 overflow-hidden shadow-md">
          
          {/* Subtle decorative background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#559620]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1853A8]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-[#88D64C] text-xs font-bold uppercase tracking-wider mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>B2B Institutional Healthcare</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                  Healthcare Supply Solutions <br className="hidden sm:inline" />
                  <span className="text-[#88D64C]">For Businesses</span>
                </h2>

                <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                  Whether you run a community pharmacy, polyclinic, or multi-specialty hospital,
                  Genekon provides reliable bulk procurement, guaranteed authentic stock, and institutional wholesale rates.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/b2b"
                  className="inline-flex items-center gap-2 bg-[#559620] hover:bg-[#467e19] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-all shadow-sm hover:scale-[1.02]"
                >
                  <span>Become a Partner</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="tel:7666168147"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 px-4 py-3 rounded-full transition-colors"
                >
                  <span>Speak to B2B Desk (+91 7666168147)</span>
                </a>
              </div>
            </div>

            {/* Target Sectors: 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mt-8">
              {INSTITUTIONS.map((inst, idx) => {
                const Icon = inst.icon;
                return (
                  <div
                    key={idx}
                    className="group rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 p-5 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/10 text-[#88D64C] flex items-center justify-center mb-3.5 transition-transform group-hover:scale-110">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                        {inst.title}
                      </h3>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {inst.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-semibold text-[#88D64C]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dedicated Wholesale Portal</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom 3 Core Wholesale Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
              {B2B_BENEFITS.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#559620]/20 text-[#88D64C] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-neutral-300 mt-0.5 leading-normal">
                        {b.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </Container>
    </section>
  );
};
