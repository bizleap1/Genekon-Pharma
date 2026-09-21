"use client";

import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { 
  Leaf, 
  ShieldCheck, 
  Truck, 
  Pill,
  HeartPulse
} from "lucide-react";

export const AboutUsSection: React.FC = () => {
  return (
    <section className="relative w-full pt-10 pb-20 lg:pt-12 lg:pb-24 overflow-hidden">
      
      {/* User provided background image covering the entire section */}
      <div className="absolute inset-0 -z-20">
        <Image 
          src="/images/aboutus-bg.png" 
          alt="Genekon Pharmaceuticals About Us"
          fill
          priority
          className="object-cover object-right lg:object-right"
          sizes="100vw"
        />
      </div>

      {/* Gradient overlay to ensure text readability on mobile/tablet */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent lg:from-white/70 lg:via-transparent lg:to-transparent -z-10" />

      <Container className="max-w-[1600px] relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          
          {/* CONTENT COLUMN (~60%) */}
          <div className="w-full lg:w-[58%] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
            
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-brand-dark">
                ABOUT US
              </span>
              <div className="w-8 h-[2px] bg-brand-green rounded-full" />
            </div>

            {/* Main Heading */}
            <h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6 drop-shadow-sm"
              style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
            >
              <span className="text-brand-dark block mb-1">Genekon Pharmaceuticals</span>
              <span className="text-brand-green">Pvt Ltd</span>
            </h2>

            {/* Supporting Copy */}
            <p className="text-brand-muted text-base sm:text-lg leading-relaxed max-w-2xl font-sans mb-12 drop-shadow-sm">
              One of the growing names in the pharmaceutical industry, focused on providing quality healthcare products, dependable service and better access to everyday healthcare.
            </p>

            {/* Journey & Commitment Blocks */}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 relative mb-16">
              {/* Subtle Divider (Desktop only between blocks) */}
              <div className="hidden sm:block absolute left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-[#CBD6CB] to-transparent" />

              {/* Left Block */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center border border-[#E8EEE8]">
                    <Leaf className="w-5 h-5 text-brand-green" />
                  </div>
                  <h3 
                    className="text-xl font-bold text-brand-dark"
                    style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
                  >
                    Our Journey
                  </h3>
                </div>
                <p className="text-brand-muted text-sm sm:text-base leading-relaxed font-sans pr-0 sm:pr-6">
                  Established in 2020, Genekon Pharmaceuticals Pvt Ltd has continued to grow by focusing on quality products, dependable service and long-term customer relationships. Our journey is built around making healthcare more accessible while continuously expanding our product range.
                </p>
              </div>

              {/* Right Block */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center border border-[#E8EEE8]">
                    <HeartPulse className="w-5 h-5 text-brand-blue" />
                  </div>
                  <h3 
                    className="text-xl font-bold text-brand-dark"
                    style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
                  >
                    Our Commitment
                  </h3>
                </div>
                <p className="text-brand-muted text-sm sm:text-base leading-relaxed font-sans pl-0 sm:pl-4">
                  At Genekon, customer trust and quality remain at the centre of everything we do. Our team continues to improve our product offerings, strengthen service standards and build a reliable healthcare experience for a growing community.
                </p>
              </div>
            </div>

            {/* Bottom Trust Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[#CBD6CB]/60">
              
              <div className="flex flex-col gap-3 group">
                <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8EEE8] flex items-center justify-center group-hover:bg-[#E8F5E9] transition-colors shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-brand-green" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-dark mb-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Trusted Quality</h4>
                  <p className="text-[11px] sm:text-xs text-brand-muted font-sans">Quality-focused products</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 group">
                <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8EEE8] flex items-center justify-center group-hover:bg-[#E8F5E9] transition-colors shadow-sm">
                  <Pill className="w-4 h-4 text-brand-green" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-dark mb-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Wide Range</h4>
                  <p className="text-[11px] sm:text-xs text-brand-muted font-sans">Healthcare for everyday needs</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 group">
                <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8EEE8] flex items-center justify-center group-hover:bg-[#E8F5E9] transition-colors shadow-sm">
                  <Truck className="w-4 h-4 text-brand-green" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-dark mb-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Reliable Service</h4>
                  <p className="text-[11px] sm:text-xs text-brand-muted font-sans">Convenient healthcare access</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 group">
                <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8EEE8] flex items-center justify-center group-hover:bg-[#E8F5E9] transition-colors shadow-sm">
                  <HeartPulse className="w-4 h-4 text-brand-green" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-dark mb-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Healthier Tomorrow</h4>
                  <p className="text-[11px] sm:text-xs text-brand-muted font-sans">Care built around people</p>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN (EMPTY - Allows background to show through) */}
          <div className="hidden lg:block w-[42%]" />

        </div>
      </Container>
    </section>
  );
};

