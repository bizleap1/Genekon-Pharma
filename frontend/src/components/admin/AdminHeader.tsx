"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  MapPin,
  ShieldCheck,
  User,
  ChevronDown,
  Menu
} from "lucide-react";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title = "Management Console",
  subtitle = "Genekon Central Pharmacy & Wholesale Operations",
  onMenuClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2EAE0] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Mobile Menu Button & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 rounded-xl text-[#14304A] hover:bg-[#F2F7F1] transition-colors border border-[#E2EAE0]"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5 text-[#14304A]" />
        </button>

        <div>
          <h1 className="font-serif text-base sm:text-xl font-bold text-[#14304A]">
            {title}
          </h1>
          <p className="text-[11px] sm:text-xs text-[#637766] mt-0.5 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Center Search / Location Info */}
      <div className="flex items-center gap-4">
        
        {/* Dispensary Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF7E9] border border-[#D5E4D2] text-xs font-bold text-[#447719]">
          <span className="w-2 h-2 rounded-full bg-[#559620] animate-pulse" />
          <MapPin className="w-3.5 h-3.5" />
          <span>Nagpur Central Hub: Dispensing Live</span>
        </div>

        {/* Notifications Bell */}
        <Link
          href="/admin/prescriptions"
          className="relative p-2 rounded-xl border border-[#DCE8D8] bg-[#FAFCFA] hover:bg-[#F2F7F1] text-[#14304A] transition-colors"
          title="14 Pending Prescriptions"
        >
          <Bell className="w-4 h-4 text-[#14304A]" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D97706] text-white text-[10px] font-extrabold flex items-center justify-center">
            14
          </span>
        </Link>

        {/* Admin Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#E2EAE0]">
          <div className="w-8 h-8 rounded-xl bg-[#EDF7E9] text-[#559620] font-serif text-xs font-bold flex items-center justify-center border border-[#D5E4D2]">
            SM
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-[#14304A] leading-tight">
              Dr. Shreya Meshram
            </p>
            <p className="text-[10px] text-[#697E6B]">
              Lead Pharmacist &amp; Super Admin
            </p>
          </div>
        </div>

      </div>
    </header>
  );
};
