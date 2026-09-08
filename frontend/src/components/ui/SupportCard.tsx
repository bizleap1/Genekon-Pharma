import React from "react";
import { MessageCircle, Phone, ArrowRight } from "lucide-react";

interface SupportCardProps {
  title?: string;
  subtitle?: string;
  phoneNumber?: string;
  whatsappText?: string;
  variant?: "card" | "compact" | "banner";
  className?: string;
}

export const SupportCard: React.FC<SupportCardProps> = ({
  title = "Need Help with Your Order?",
  subtitle = "Our licensed pharmacists are here to assist with medicine availability, dosages, and prescriptions.",
  phoneNumber = "9370102691",
  whatsappText = "Chat on WhatsApp",
  variant = "card",
  className = "",
}) => {
  const whatsappUrl = `https://wa.me/91${phoneNumber}?text=Hello%20Genekon%20Pharmacy,%20I%20need%20assistance`;

  if (variant === "compact") {
    return (
      <div
        className={`rounded-2xl border border-[#DDE7DC] bg-[#F7FAF7] p-4 flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#14304A]">{title}</p>
            <p className="text-[11px] text-[#607464]">{subtitle}</p>
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-2xs shrink-0"
        >
          <span>Chat</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-[#DCE8D8] bg-white p-5 sm:p-6 shadow-2xs relative overflow-hidden ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-[#EAF7EC] text-[#25D366] flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 fill-current" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-[#14304A]">{title}</h4>
          <p className="text-xs text-[#637766] mt-1 leading-relaxed">
            {subtitle}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>{whatsappText}</span>
              <ArrowRight className="w-3 h-3" />
            </a>

            <a
              href={`tel:${phoneNumber}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F0F5F2] hover:bg-[#E2ECE4] text-[#14304A] text-xs font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#559620]" />
              <span>{phoneNumber}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
