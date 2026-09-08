"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Truck, Phone, Tag } from "lucide-react";
import { ProtectedAction } from "@/components/auth/ProtectedAction";

export const UtilityBar: React.FC = () => {
  const router = useRouter();

  return (
    <div className="border-b border-[#E0EDD8] bg-[#F1F7EC] text-xs text-[#526354] select-none py-2">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-y-1 text-[11px] sm:text-xs">
        {/* Left: Promo Code */}
        <div className="flex items-center gap-1.5 font-bold text-[#2E6B17]">
          <Tag className="w-3.5 h-3.5 fill-[#2E6B17]" />
          <span>Flat 20% OFF on first order</span>
          <span className="text-[#89A880] font-normal mx-0.5">|</span>
          <span className="font-normal text-[#526354]">Use Code:</span>
          <span className="font-extrabold text-[#2E6B17] tracking-wider">GENEKON20</span>
        </div>

        {/* Center: Trust Badges */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 text-[#3C4E40]">
          <div className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#69A82F]" />
            <span>Genuine Medicines</span>
          </div>
          <span className="text-[#C8DCC0]">|</span>
          <div className="flex items-center gap-1 font-medium">
            <Lock className="w-3.5 h-3.5 text-[#315FAE]" />
            <span>Secure Payments</span>
          </div>
          <span className="text-[#C8DCC0]">|</span>
          <div className="flex items-center gap-1 font-medium">
            <Truck className="w-3.5 h-3.5 text-[#69A82F]" />
            <span>Reliable Delivery</span>
          </div>
        </div>

        {/* Right: Help, Track Order, Phone Number */}
        <div className="flex items-center gap-3 sm:gap-4 font-medium">
          <Link href="/help" className="hover:text-[#2E6B17] transition-colors hidden sm:inline">
            Need Help?
          </Link>
          <span className="text-[#C8DCC0] hidden sm:inline">|</span>
          <ProtectedAction
            action={{
              type: "TRACK_ORDER",
              title: "Track Order",
              redirectUrl: "/track-order",
            }}
            onAction={() => router.push("/track-order")}
            customMessage="Login required to track orders"
          >
            <button
              type="button"
              className="hover:text-[#2E6B17] transition-colors hidden sm:inline cursor-pointer"
            >
              Track Order
            </button>
          </ProtectedAction>
          <span className="text-[#C8DCC0] hidden sm:inline">|</span>
          <a
            href="tel:9370102691"
            className="flex items-center gap-1.5 font-bold text-[#2E6B17] hover:underline"
          >
            <Phone className="w-3.5 h-3.5 fill-[#2E6B17]" />
            <span>9370102691</span>
          </a>
        </div>
      </div>
    </div>
  );
};
