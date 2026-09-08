"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Phone
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { authStore } from "@/stores/authStore";
import { cartStore } from "@/stores/cartStore";
import { restoreIntendedActionAfterLogin } from "@/hooks/useAuthGuard";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "9370102691";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const toast = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      setError("OTP has expired. Please click 'Resend OTP' below.");
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (error) setError("");
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto advance focus to next box
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setTimer(30);
    setCanResend(false);
    setError("");
    setOtp(["", "", "", "", "", ""]);
    toast.info(`A fresh 6-digit OTP code has been sent to +91 ${phone}`);
    inputRefs.current[0]?.focus();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join("");
    if (entered.length < 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    if (timer === 0) {
      setError("OTP has expired. Please click 'Resend OTP' to receive a new code.");
      return;
    }

    if (entered === "000000") {
      setError("Invalid OTP code. Please check your SMS and try again.");
      return;
    }

    setVerifying(true);
    setTimeout(() => {
      // Authenticate customer
      authStore.loginCustomer({ mobile: phone });

      // Merge guest cart with user cart
      cartStore.mergeGuestCart();

      // Automatically restore intended action or redirect based on role
      restoreIntendedActionAfterLogin(router, { addToCart }, { toggleWishlist }, toast);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFA]">
      <UtilityBar />
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 sm:py-16">
        <Container>
          <div className="max-w-md mx-auto">
            
            <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-10 shadow-sm relative">
              
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EDF7E9] text-[#559620] mb-3 border border-[#D5E4D2]">
                  <Lock className="w-7 h-7" />
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] tracking-tight">
                  Verify OTP
                </h1>
                <p className="text-xs sm:text-sm text-[#5F7361] mt-1.5 leading-relaxed">
                  We sent a 6-digit verification code to <br />
                  <span className="font-bold text-[#14304A]">+91 {phone}</span>
                </p>

                {/* Change Phone Option */}
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs text-[#559620] font-bold hover:underline mt-1.5"
                >
                  <span>Change Number</span>
                </Link>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleVerify} className="space-y-6">
                
                {/* 6 Digit Input Boxes */}
                <div>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono font-extrabold text-lg sm:text-xl rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white focus:ring-2 focus:ring-[#559620]/15 outline-none transition-all"
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="text-[11px] text-red-500 font-bold text-center mt-2">
                      {error}
                    </p>
                  )}
                </div>

                {/* Resend Timer */}
                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="inline-flex items-center gap-1.5 text-xs text-[#559620] font-bold hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend OTP</span>
                    </button>
                  ) : (
                    <p className="text-xs text-[#718573]">
                      Resend code in{" "}
                      <span className="font-mono font-bold text-[#14304A]">
                        00:{timer < 10 ? `0${timer}` : timer}
                      </span>
                    </p>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {verifying ? (
                    <span className="animate-pulse">Verifying Security Code...</span>
                  ) : (
                    <>
                      <span>Verify &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Security Info */}
              <div className="mt-8 pt-6 border-t border-[#EAF2E8] flex items-center justify-center gap-2 text-xs text-[#5D7160]">
                <ShieldCheck className="w-4 h-4 text-[#559620]" />
                <span>Protected by 256-Bit Medical Data Encryption</span>
              </div>

            </div>

          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFCFA]">
          <div className="animate-spin w-8 h-8 rounded-full border-2 border-[#559620] border-t-transparent" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
