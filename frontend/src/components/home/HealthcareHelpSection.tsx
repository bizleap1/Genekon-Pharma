"use client";

import React from "react";
import {
  MessageCircle,
  Phone,
  Clock,
  ShieldCheck,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { Container } from "@/components/ui/Container";

export const HealthcareHelpSection: React.FC = () => {
  return (
    <section className="py-6 sm:py-10 bg-white">
      <Container>
        <div className="relative rounded-3xl border border-[#D5E8D0] bg-gradient-to-r from-[#F0F8EC] via-[#F4FAF0] to-[#EAF5E5] p-7 sm:p-10 lg:p-12 overflow-hidden shadow-xs">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 flex flex-col justify-center max-w-2xl">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#D0E5CB] text-[#559620] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs w-fit">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>PHARMACIST ASSISTANCE DESK</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] text-[#14304A] tracking-tight leading-tight">
                Need Help Finding The Right <br className="hidden sm:inline" />
                <span className="text-[#559620]">Healthcare Product?</span>
              </h2>

              <p className="mt-3 text-xs sm:text-sm md:text-base text-[#4C6050] leading-relaxed">
                Can&apos;t find your prescribed medicine, or unsure about generic equivalents?
                Connect with our licensed pharmacy experts directly on WhatsApp for real-time stock
                availability, dosage guidance, and fast assisted ordering.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/919370102691?text=Hi%20Genekon,%20I%20need%20help%20finding%20the%20right%20healthcare%20product."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-full transition-all shadow-sm hover:scale-[1.02]"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Chat on WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="tel:9370102691"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#14304A] border border-[#CADFC5] text-xs sm:text-sm font-bold px-5 py-3.5 rounded-full transition-colors shadow-2xs"
                >
                  <Phone className="w-4 h-4 text-[#1853A8]" />
                  <span>Call: 9370102691</span>
                </a>
              </div>

            </div>

            {/* Right Side Trust Callout Box */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="rounded-2xl border border-[#D8EBD2] bg-white/90 backdrop-blur-xs p-5 shadow-2xs space-y-3.5 text-xs text-[#14304A]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Quick 5-Min Response</span>
                    <span className="text-[11px] text-[#637666]">Available 9:00 AM – 9:00 PM</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-[#EDF5EC]">
                  <div className="w-8 h-8 rounded-xl bg-[#EBF3FC] text-[#1853A8] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Licensed Pharmacist Advice</span>
                    <span className="text-[11px] text-[#637666]">Verified alternatives &amp; dosages</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-[#EDF5EC]">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF2E8] text-[#D97706] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Send Prescription on Chat</span>
                    <span className="text-[11px] text-[#637666]">Instant cart creation &amp; payment link</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </Container>
    </section>
  );
};
