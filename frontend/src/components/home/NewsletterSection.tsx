"use client";

import React, { useState } from "react";
import { Mail, Check, ShieldCheck, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="py-10 sm:py-14 bg-white">
      <Container>
        <div className="relative rounded-3xl border border-[#DCE9D8] bg-gradient-to-r from-[#F4F9F2] via-[#F8FAF6] to-[#F1F7EE] p-8 sm:p-12 lg:p-14 text-center max-w-4xl mx-auto overflow-hidden shadow-xs">
          
          <div className="max-w-xl mx-auto">
            
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5E5] text-[#559620] flex items-center justify-center mx-auto mb-4 shadow-2xs">
              <Mail className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#14304A] tracking-tight leading-tight">
              Stay Updated With <br />
              <span className="text-[#559620]">Better Health Choices</span>
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-[#506352] leading-relaxed">
              Get certified pharmacist tips, medicine safety alerts, and exclusive monthly health savings delivered directly to your inbox.
            </p>

            {/* Email Subscription Form */}
            {subscribed ? (
              <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#EDF7E9] border border-[#BCE1B4] text-xs sm:text-sm font-bold text-[#559620] animate-in fade-in zoom-in duration-300">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Thank you! You are subscribed to Genekon Health Updates.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-7 flex flex-col sm:flex-row items-center gap-2.5 max-w-md mx-auto"
              >
                <div className="relative w-full">
                  <Mail className="w-4 h-4 text-[#8CA08E] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full pl-11 pr-4 py-3 rounded-full border border-[#CADDC7] bg-white text-xs sm:text-sm text-[#14304A] placeholder:text-[#8CA08E] outline-none focus:border-[#559620] focus:ring-3 focus:ring-[#559620]/10 transition-all shadow-2xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 bg-[#559620] hover:bg-[#467e19] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-all shadow-2xs cursor-pointer hover:scale-[1.02]"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Micro Trust Note */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#718573]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#559620]" />
              <span>We value your privacy. Unsubscribe anytime with 1 click.</span>
            </div>

          </div>

        </div>
      </Container>
    </section>
  );
};
