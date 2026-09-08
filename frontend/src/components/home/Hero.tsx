"use client";

import React from "react";
import Image from "next/image";
import {
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { Container } from "@/components/ui/Container";

const TRUST_FEATURES = [
  {
    icon: ShieldCheck,
    title: "100% Genuine",
    subtitle: "Direct from labs",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    subtitle: "256-bit encrypted",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    subtitle: "Reliable & safe",
  },
  {
    icon: CheckCircle2,
    title: "Trusted Pharmacy",
    subtitle: "Licensed pharmacists",
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
            <p className="text-xs sm:text-[13px] font-bold tracking-[0.18em] uppercase text-[#687C67] mb-2.5">
              CARE FOR TODAY. HEALTHIER TOMORROW.
            </p>

            {/* Main Headline */}
            <h1 className="font-serif font-normal text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] text-[#14304A] tracking-[-0.02em] leading-[1.04]">
              Trusted Healthcare <br />
              <span className="text-[#559620]">For Every You.</span>
            </h1>

            {/* Subheading */}
            <p className="mt-3 text-sm sm:text-base md:text-lg text-[#4A5D4C] leading-relaxed max-w-lg">
              Wide range of genuine medicines, healthcare products and wellness essentials — delivered to your doorstep.
            </p>

            {/* Revamped Premium Trust Badges */}
            <div className="mt-7 pt-5 border-t border-[#DCEBD9]/80">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3">
                {TRUST_FEATURES.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="group flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-xs border border-[#D5E7D3] shadow-2xs hover:border-[#559620]/60 hover:shadow-xs transition-all duration-200 cursor-default"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#EBF6E8] group-hover:bg-[#559620] text-[#559620] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-[#14304A] whitespace-nowrap">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-[#6F8271] font-medium hidden sm:inline-block">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right side spacer allowing the background products to shine through cleanly */}
          <div className="hidden lg:block lg:col-span-5 min-h-[360px]" />

        </div>
      </Container>
    </section>
  );
};
