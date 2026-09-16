"use client";

import React, { useState, useEffect } from "react";
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

const HERO_SLIDES = [
  "/hero-section-bg.svg",
  "/hero-slider-2.png",
  "/hero-slider-3.png",
  "/hero-slider-4.png",
  "/hero-slider-5.png"
];

export const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden border-b border-[#E2EDE0] min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex items-start">
      {/* Full-width Hero Background Slider anchored strictly to the BOTTOM */}
      <div className="absolute inset-0 w-full h-full pointer-events-none bg-white">
        {HERO_SLIDES.map((slide, idx) => (
          <Image
            key={slide}
            src={slide}
            alt={`Genekon Healthcare Hero Background ${idx + 1}`}
            fill
            priority={idx === 0}
            className={`object-cover object-bottom transition-opacity duration-1000 ${
              currentSlide === idx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
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



            {/* CTA Buttons */}
            <div className="mt-7 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/category/medicines"
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-full bg-[#559620] hover:bg-[#488219] text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <span>Shop Medicines</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/categories"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-7 py-3 rounded-full bg-white hover:bg-[#F3F8EE] text-[#14304A] font-semibold text-sm sm:text-base border border-[#D5E7D3] hover:border-[#559620]/50 transition-all duration-200 shadow-2xs"
              >
                Explore Healthcare
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-[#DCEBD9]/80 w-full">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 sm:gap-x-8 items-center">
                {TRUST_FEATURES.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2 sm:gap-3 text-[#14304A]">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#559620] shrink-0" strokeWidth={2} />
                      <span className="text-xs sm:text-[15px] font-semibold tracking-tight leading-tight">
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </Container>
    </section>
  );
};
