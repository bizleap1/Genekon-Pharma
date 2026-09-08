"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { Container } from "@/components/ui/Container";

export const OfferBanner: React.FC = () => {
  return (
    <section className="py-5 bg-white">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-[#DCE9D8] bg-gradient-to-r from-[#EBF5E7] via-[#E4F1DF] to-[#E9F4E5] p-6 sm:p-8 lg:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Heading & Button */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <h2 className="font-serif font-normal text-3xl sm:text-4xl lg:text-[42px] text-[#14304A] leading-[1.1] tracking-[-0.02em]">
                Care More. <br />
                Spend Smarter.
              </h2>

              <p className="mt-2.5 text-xs sm:text-sm text-[#4A5E4E] leading-relaxed max-w-sm">
                Special savings across healthcare &amp; wellness essentials.
              </p>

              <div className="mt-5">
                <Link
                  href="/offers"
                  className="inline-flex items-center gap-2 bg-[#559620] hover:bg-[#467f1a] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-150 shadow-xs"
                >
                  <span>Explore Offers</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Center Column: Product Composition & 30% Badge */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[340px] aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden shadow-2xs">
                <Image
                  src="/images/banners/offer-banner-products.jpg"
                  alt="Special Offer Health Essentials"
                  fill
                  sizes="(max-width: 768px) 90vw, 40vw"
                  className="object-cover"
                />
              </div>

              {/* Floating 30% OFF Circle Badge */}
              <div className="absolute -top-3 right-4 sm:right-8 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-[#1853A8] text-white flex flex-col items-center justify-center shadow-md leading-tight text-center border-2 border-white">
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">
                  UP TO
                </span>
                <span className="text-base sm:text-lg font-extrabold -my-0.5">
                  30%
                </span>
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">
                  OFF
                </span>
              </div>
            </div>

            {/* Right Column: Wellness Tagline */}
            <div className="lg:col-span-3 flex flex-col items-start lg:items-end text-left lg:text-right justify-center">
              <div className="w-9 h-9 rounded-xl bg-white/80 border border-[#D5E6D3] flex items-center justify-center text-[#1853A8] mb-3">
                <Leaf className="w-5 h-5 text-[#1853A8]" />
              </div>

              <h3 className="font-serif font-normal text-xl sm:text-2xl text-[#14304A] leading-snug">
                Wellness <br />
                <span className="text-[#1853A8]">For a Brighter</span> <br />
                Tomorrow
              </h3>
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
};
