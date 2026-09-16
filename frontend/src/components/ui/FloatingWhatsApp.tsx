"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "./WhatsAppIcon";

export const FloatingWhatsApp: React.FC = () => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Hide on all admin routes — this is a customer-facing widget only
  if (pathname?.startsWith("/admin")) return null;

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
        className="flex items-center justify-center w-[52px] h-[52px] bg-[#29A745] hover:bg-[#218838] rounded-full shadow-lg transition-transform duration-300 transform hover:scale-110 select-none hover:shadow-xl"
        title="Chat with Genekon Pharmacist on WhatsApp"
      >
        <WhatsAppIcon size={30} variant="monochrome" className="text-white" />
      </a>
    </aside>
  );
};
