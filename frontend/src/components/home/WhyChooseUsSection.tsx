"use client";

import React from "react";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  BadgeCheck,
  RotateCcw
} from "lucide-react";
import { Container } from "@/components/ui/Container";

const TRUST_CARDS = [
  {
    icon: ShieldCheck,
    title: "Genuine Medicines",
    desc: "100% authentic medications sourced directly from licensed pharma manufacturers with strict batch quality checks.",
    badgeColor: "bg-[#EDF7E9] text-[#559620]",
    borderColor: "hover:border-[#559620]/40",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    desc: "Bank-grade 256-bit SSL encrypted checkout supporting UPI, cards, net banking, and reliable Cash on Delivery.",
    badgeColor: "bg-[#EBF3FC] text-[#1853A8]",
    borderColor: "hover:border-[#1853A8]/40",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    desc: "Fast doorstep dispatch with temperature-controlled cold chain handling and real-time live package tracking.",
    badgeColor: "bg-[#EDF7E9] text-[#559620]",
    borderColor: "hover:border-[#559620]/40",
  },
  {
    icon: BadgeCheck,
    title: "Verified Supply",
    desc: "Strict adherence to Indian Drugs & Cosmetics regulations, tamper-evident seals, and certified pharmacist reviews.",
    badgeColor: "bg-[#EBF3FC] text-[#1853A8]",
    borderColor: "hover:border-[#1853A8]/40",
  },
  {
    icon: RotateCcw,
    title: "Easy Reordering",
    desc: "Convenient 1-click monthly prescription refills with smart automated reminders so you never run out of daily doses.",
    badgeColor: "bg-[#FAF2E8] text-[#D97706]",
    borderColor: "hover:border-[#D97706]/40",
  },
];

export const WhyChooseUsSection: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-[#FAFCFA] border-y border-[#E5EFE3]">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-xs font-bold tracking-[0.16em] uppercase text-[#687C67] mb-2">
            PATIENT TRUST &amp; COMPLIANCE
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#14304A] tracking-tight">
            Why Choose Genekon
          </h2>
          <p className="text-xs sm:text-sm text-[#556958] mt-2 leading-relaxed">
            Delivering the highest clinical standards of authentic pharmaceutical care, secure ordering, and dependable delivery.
          </p>
        </div>

        {/* 5 Trust Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {TRUST_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`group rounded-2xl border border-[#E0ECE0] bg-white p-5 shadow-2xs ${card.borderColor} hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
              >
                <div>
                  <div className={`w-11 h-11 rounded-xl ${card.badgeColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-2xs`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#14304A] mb-1.5">
                    {card.title}
                  </h3>

                  <p className="text-xs text-[#5D7060] leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0F5EE] flex items-center gap-1 text-[11px] font-bold text-[#559620]">
                  <span>Genekon Certified</span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
