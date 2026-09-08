"use client";

import dynamic from "next/dynamic";
import React from "react";

const CartView = dynamic(() => import("@/components/cart/CartView"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFCFA]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#559620] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#556958]">Loading your medicines cart...</p>
      </div>
    </div>
  ),
});

export default function CartPage() {
  return <CartView />;
}
