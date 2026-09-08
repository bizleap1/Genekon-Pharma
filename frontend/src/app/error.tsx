"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, Headphones } from "lucide-react";
import { Container } from "@/components/ui/Container";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFCFA] px-4 py-12 text-[#14304A]">
      <Container className="max-w-md w-full">
        <div className="rounded-3xl border border-[#DCE8D8] bg-white p-8 sm:p-10 text-center shadow-lg">
          {/* Warning Icon */}
          <div className="w-16 h-16 rounded-3xl bg-[#FEECEB] text-[#E02D3C] border border-[#F8C8C5] flex items-center justify-center mx-auto mb-5 shadow-xs">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14304A] tracking-tight">
            Something went wrong
          </h1>

          <p className="text-xs sm:text-sm text-[#5D7360] mt-2 mb-6 leading-relaxed">
            We encountered an unexpected error while loading this page. Rest assured, your medical data, cart, and account remain secure.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] active:bg-[#3D6E16] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs sm:text-sm font-bold text-[#14304A] transition-colors"
            >
              <Home className="w-4 h-4 text-[#559620]" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Support Helpline */}
          <div className="mt-8 pt-5 border-t border-[#EAF2E8] flex items-center justify-center gap-2 text-xs text-[#6B806E]">
            <Headphones className="w-3.5 h-3.5 text-[#1853A8]" />
            <span>Need pharmacy help? </span>
            <Link href="/contact" className="text-[#1853A8] font-bold hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
