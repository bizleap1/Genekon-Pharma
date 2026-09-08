"use client";

import React from "react";
import { Star, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";

const REVIEWS = [
  {
    id: "rev-1",
    name: "Rajesh Sharma",
    location: "Nagpur, Maharashtra",
    role: "Regular Prescription Customer",
    rating: 5,
    date: "1 week ago",
    text: "Ordered my father's diabetes and cardiac medications through Genekon. The prescription verification was swift, the packaging was tamper-evident, and the medicines were from fresh, long-expiry batches. Truly dependable.",
  },
  {
    id: "rev-2",
    name: "Dr. Amit Verma",
    location: "Wardha, Maharashtra",
    role: "Clinic Practice Lead",
    rating: 5,
    date: "2 weeks ago",
    text: "We source our OPD diagnostic consumables and daily maintenance stock through Genekon's wholesale supply. Pricing is transparent, GST invoices are accurate, and cold-chain items always arrive in pristine condition.",
  },
  {
    id: "rev-3",
    name: "Pooja Deshmukh",
    location: "Amravati, Maharashtra",
    role: "CarePlus Monthly Refill Member",
    rating: 5,
    date: "3 weeks ago",
    text: "The WhatsApp pharmacist support was surprisingly helpful when our regular brand was out of stock. They suggested the exact generic equivalent with the same active salt, saving us nearly 25% on our monthly bill.",
  },
];

export const CustomerTestimonials: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-[#FAFCFA] border-y border-[#E5EFE3]">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#559620] text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>VERIFIED PATIENT EXPERIENCES</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#14304A] tracking-tight">
            Trusted by Families &amp; Doctors
          </h2>

          <p className="text-xs sm:text-sm text-[#556958] mt-2 leading-relaxed">
            Authentic feedback from real patients, families, and healthcare partners relying on Genekon daily.
          </p>
        </div>

        {/* 3 Clean Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-[#E0ECE0] bg-white p-6 shadow-2xs hover:shadow-md hover:border-[#559620]/40 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Rating & Date */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-0.5 text-[#EAA21D]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#EAA21D]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#7A8E7E] font-medium">
                    {rev.date}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-[13px] text-[#445647] leading-relaxed italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="mt-5 pt-4 border-t border-[#F0F5EE] flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#14304A]">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-[#697C6B]">
                    {rev.location}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#559620] bg-[#EDF7E9] px-2 py-0.5 rounded-full shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
