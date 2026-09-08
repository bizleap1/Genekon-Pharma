import React from "react";
import Link from "next/link";
import {
  MessageSquare,
  PhoneCall,
  Mail,
  Clock,
  ArrowRight,
  Headphones
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const SupportSection: React.FC = () => {
  return (
    <section className="py-6 sm:py-8 bg-white">
      <Container>
        <SectionHeading
          eyebrow="DEDICATED PHARMACY SUPPORT"
          title="Need Help Finding Your Medicine? Speak With Our Team"
          description="Our care team and pharmacy assistants are available to help you with medicine availability, active order updates, and prescription queries."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: WhatsApp Support */}
          <div className="rounded-2xl border border-[#E7ECEF] bg-[#FAFCFB] p-5 sm:p-6 flex flex-col justify-between hover:border-[#69A82F]/40 hover:bg-white hover:shadow-sm transition-all">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#F3F8EE] text-[#69A82F] flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#69A82F]">
                Fastest Response
              </span>
              <h3 className="text-lg font-bold text-[#14304A] mt-1">
                Chat on WhatsApp
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-[#68746F] leading-relaxed">
                Connect directly on WhatsApp to check medicine stock, upload prescriptions, or
                request order tracking updates.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E7ECEF]">
              <a
                href="https://wa.me/?text=Hi%20GENEKON,%20I%20need%20assistance%20with%20my%20medicine%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#69A82F] hover:bg-[#588f27] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer select-none"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Card 2: Phone / Desk Support */}
          <div className="rounded-2xl border border-[#E7ECEF] bg-[#FAFCFB] p-5 sm:p-6 flex flex-col justify-between hover:border-[#315FAE]/40 hover:bg-white hover:shadow-sm transition-all">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#F2F6FC] text-[#315FAE] flex items-center justify-center mb-4">
                <PhoneCall className="w-5 h-5" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#315FAE]">
                Live Pharmacist Help
              </span>
              <h3 className="text-lg font-bold text-[#14304A] mt-1">
                Pharmacy Helpdesk
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-[#68746F] leading-relaxed">
                Speak with our patient care representative for dosage clarifications and order
                enquiries.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#14304A] bg-white border border-[#E7ECEF] px-3 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-[#315FAE]" />
                <span>Mon – Sat: 9:00 AM – 9:00 PM</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E7ECEF]">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-[#315FAE] text-[#315FAE] hover:bg-[#F2F6FC] text-xs sm:text-sm font-bold transition-colors"
              >
                <Headphones className="w-4 h-4" />
                <span>Contact Helpdesk</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Email Support */}
          <div className="rounded-2xl border border-[#E7ECEF] bg-[#FAFCFB] p-5 sm:p-6 flex flex-col justify-between hover:border-[#315FAE]/40 hover:bg-white hover:shadow-sm transition-all">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#F2F6FC] text-[#315FAE] flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#68746F]">
                Written Assistance
              </span>
              <h3 className="text-lg font-bold text-[#14304A] mt-1">
                Email Customer Support
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-[#68746F] leading-relaxed">
                Send us prescriptions, order feedback, or corporate healthcare queries. We respond
                promptly within 24 hours.
              </p>

              <div className="mt-4 text-xs font-mono font-semibold text-[#315FAE] bg-white border border-[#E7ECEF] px-3 py-1.5 rounded-lg w-fit">
                care@genekon.com
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E7ECEF]">
              <a
                href="mailto:care@genekon.com"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-[#E7ECEF] text-[#14304A] hover:bg-white hover:border-[#315FAE] hover:text-[#315FAE] text-xs sm:text-sm font-bold transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email</span>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
