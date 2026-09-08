"use client";

import React from "react";
import { CartProvider, useCart } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";
import { LoginRequiredModal } from "@/components/ui/LoginRequiredModal";
import { CheckCircle2, X } from "lucide-react";

function GlobalCartToast() {
  const { toastMessage, dismissToast } = useCart();

  if (!toastMessage) return null;

  return (
    <aside
      role="region"
      aria-label="Cart Notification"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#14304A] text-white p-4 rounded-2xl shadow-2xl border border-[#559620]/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#559620]/20 text-[#559620] flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-[#559620]" />
        </div>
        <p className="text-xs font-bold leading-snug">{toastMessage}</p>
      </div>
      <button
        onClick={dismissToast}
        className="text-[#96A89A] hover:text-white transition-colors p-1 cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
          <GlobalCartToast />
          <LoginRequiredModal />
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}
