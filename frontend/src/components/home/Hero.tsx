"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Container } from "@/components/ui/Container";

const TRUST_FEATURES = [
  {
    icon: ShieldCheck,
    title: "100% Genuine Products",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
  },
  {
    icon: Truck,
    title: "Easy Home Delivery",
  },
  {
    icon: CheckCircle2,
    title: "Trusted Pharmacy",
  },
];

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden border-b border-[#E2EDE0] min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex items-start">
      {/* Full-width Hero SVG Background anchored strictly to the BOTTOM */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Image
          src="/hero-section-bg.svg"
          alt="Genekon Healthcare Hero Background"
          fill
          priority
          className="object-cover object-bottom"
        />
        {/* Subtle gradient for left-side text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent lg:from-white/85 lg:via-white/30 lg:to-transparent" />
      </div>

      <Container className="relative z-10 pt-7 sm:pt-9 lg:pt-11 pb-16">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE CONTENT */}
          <div className="lg:col-span-7 flex flex-col justify-start max-w-xl">
            
            {/* Eyebrow */}
            <p className="text-xs sm:text-[13px] font-bold tracking-[0.16em] uppercase text-[#14304A]/80 mb-3">
              BETTER HEALTH. BRIGHTER TOMORROW.
            </p>

            {/* Main Headline */}
            <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] text-[#14304A] tracking-[-0.03em] leading-[1.08]">
              Trusted Medicines <br />
              <span className="text-[#559620]">for a Healthier You.</span>
            </h1>

            {/* Subheading */}
            <p className="mt-3.5 text-sm sm:text-base md:text-lg text-[#4A5D4C] leading-relaxed max-w-lg">
              Wide range of genuine medicines, healthcare products and wellness essentials — delivered with care.
            </p>

            {/* CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <Link
                href="/category/medicines"
                className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-full bg-[#559620] hover:bg-[#488219] text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <span>Shop Medicines</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center px-6 sm:px-7 py-3 rounded-full bg-white hover:bg-[#F3F8EE] text-[#14304A] font-semibold text-sm sm:text-base border border-[#D5E7D3] hover:border-[#559620]/50 transition-all duration-200 shadow-2xs"
              >
                Explore Healthcare
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 pt-5 border-t border-[#DCEBD9]/80">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 sm:gap-6">
                {TRUST_FEATURES.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2 text-[#14304A]">
                      <Icon className="w-5 h-5 text-[#14304A] shrink-0" strokeWidth={1.75} />
                      <span className="text-xs sm:text-[13px] font-semibold tracking-tight whitespace-nowrap">
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right side accent matching the attached reference image */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center min-h-[340px] relative pointer-events-none select-none">
            <div className="font-script text-5xl xl:text-6xl text-[#14304A] leading-tight text-center -rotate-6 opacity-90 tracking-wide">
              Care<br />Beyond<br />Medicines
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};
