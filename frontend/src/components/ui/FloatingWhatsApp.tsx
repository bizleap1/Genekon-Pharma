"use client";

import React, { useState } from "react";
import { WhatsAppIcon } from "./WhatsAppIcon";

export const FloatingWhatsApp: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const phoneNumber = "7666168147";
  const whatsappUrl = `https://wa.me/91${phoneNumber}?text=Hello%20Genekon%20Pharmacy,%20I%20need%20assistance`;

  return (
    <aside
      role="complementary"
      aria-label="Direct WhatsApp Pharmacist Support"
      className="fixed bottom-6 right-6 z-40 flex items-center group pointer-events-auto"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white pl-3.5 pr-4 py-3 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 select-none"
        title="Chat with Genekon Pharmacist on WhatsApp"
      >
        <span className="relative flex items-center justify-center">
          <WhatsAppIcon size={24} variant="monochrome" className="text-white drop-shadow-xs" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full" />
        </span>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[11px] font-black uppercase tracking-wider text-white/90">
            WhatsApp Desk
          </span>
          <span className="text-xs font-extrabold text-white">
            +91 {phoneNumber}
          </span>
        </div>
      </a>
    </aside>
  );
};
