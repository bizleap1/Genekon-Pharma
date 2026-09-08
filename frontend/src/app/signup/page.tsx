"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Smartphone,
  ShieldCheck,
  ShoppingBag,
  Package,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { authStore } from "@/stores/authStore";
import { cartStore } from "@/stores/cartStore";
import { authApi } from "@/api/auth";
import { restoreIntendedActionAfterLogin } from "@/hooks/useAuthGuard";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const toast = useToast();
  const { triggerGoogleLogin, isGoogleLoading } = useGoogleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Network check
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("Network error: You appear to be offline. Please check your internet connection.");
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters)");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (!agreedToTerms) {
      setError("Please accept the Terms of Service and Privacy Policy to proceed");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.registerUser({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        password,
        role: "CUSTOMER",
      });

      if (res.success && res.data) {
        authStore.loginCustomer(
          {
            name: res.data.user.name,
            mobile: res.data.user.mobile,
            email: res.data.user.email,
          },
          res.data.token
        );

        cartStore.mergeGuestCart();
        toast.success("Account created successfully! Welcome to Genekon Healthcare.");
        restoreIntendedActionAfterLogin(router, { addToCart }, { toggleWishlist }, toast);
      } else {
        setError(res.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create account. An account with this mobile/email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF6] flex flex-col justify-between relative overflow-x-hidden text-[#14304A]">
      {/* Top Bar Header */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-10 pt-6 pb-2 flex items-center justify-between">
        <div>
          <Link href="/" className="inline-block">
            <div className="relative h-10 w-36 sm:w-44">
              <Image
                src="/images/genekon-brand-logo.png"
                alt="Genekon Pharmaceuticals"
                fill
                sizes="(max-width: 640px) 144px, 176px"
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>
          <p className="text-[9px] sm:text-[10px] font-extrabold tracking-wider text-[#559620] uppercase mt-0.5">
            BETTER SCIENCE &bull; HEALTHIER TOMORROW
          </p>
        </div>

        {/* Top Right Motto */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#637766]">
          <span>For a Healthier Tomorrow</span>
          <span className="w-6 h-[2px] bg-[#559620] rounded-full inline-block" />
        </div>
      </header>

      {/* Main 2-Column Split Content */}
      <main className="flex-1 flex items-center py-6 sm:py-10">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Healthcare Brand Showcase */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center space-y-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EDF7E9] text-[#447719] inline-block mb-3">
                  NEW PATIENT REGISTRATION
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#14304A] leading-[1.15]">
                  Join <span className="text-[#14304A]">Genekon</span>{" "}
                  <span className="text-[#559620]">Healthcare</span>
                </h1>
                <p className="text-xs sm:text-sm text-[#556A58] mt-3 max-w-md leading-relaxed">
                  Create an account to manage authentic prescriptions, doorstep medicine delivery, refill reminders, and personalized health recommendations.
                </p>
              </div>

              {/* 3 Trust Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="rounded-2xl border border-[#E0EBE0] bg-white/85 p-3.5 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-[#EBF5E7] text-[#559620] flex items-center justify-center mb-2.5">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-bold text-[#14304A]">100% Authentic</h2>
                  <p className="text-[11px] text-[#637766] mt-0.5 leading-snug">
                    Sourced directly from licensed manufacturers
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E0EBE0] bg-white/85 p-3.5 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-[#EBF3FC] text-[#1853A8] flex items-center justify-center mb-2.5">
                    <Package className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-bold text-[#14304A]">Fast Delivery</h2>
                  <p className="text-[11px] text-[#637766] mt-0.5 leading-snug">
                    Prompt dispatch across Nagpur &amp; central India
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E0EBE0] bg-white/85 p-3.5 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-[#EBF5E7] text-[#559620] flex items-center justify-center mb-2.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-bold text-[#14304A]">Rx Privacy</h2>
                  <p className="text-[11px] text-[#637766] mt-0.5 leading-snug">
                    End-to-end encrypted medical data storage
                  </p>
                </div>
              </div>

              {/* Product Visual Showcase Box */}
              <div className="relative rounded-2xl overflow-hidden border border-[#DCE8D8] bg-white shadow-2xs p-3 flex items-center justify-center max-w-md">
                <div className="relative w-full h-44 sm:h-48">
                  <Image
                    src="/images/login-product-showcase.png"
                    alt="Genekon Pharmaceutical Products"
                    fill
                    sizes="(max-width: 640px) 100vw, 420px"
                    priority
                    className="object-contain object-center"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-widest text-[#6E8271] uppercase">
                <span className="w-5 h-[2px] bg-[#559620] rounded-full inline-block" />
                <span>PHARMACEUTICALS &bull; PEOPLE &bull; PROGRESS</span>
              </div>
            </div>

            {/* Right Column: Sign Up Card */}
            <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-[460px] rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-9 shadow-lg relative">
                {/* Brand Logo Inside Card */}
                <div className="text-center mb-6">
                  <div className="relative h-9 w-36 mx-auto mb-2.5">
                    <Image
                      src="/images/genekon-brand-logo.png"
                      alt="Genekon Pharmaceuticals"
                      fill
                      sizes="144px"
                      className="object-contain object-center"
                    />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#14304A]">
                    Create Account
                  </h2>
                  <p className="text-xs text-[#637766] mt-1">
                    Sign up to order authentic medicines and manage prescriptions
                  </p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {error && (
                    <div className="p-2.5 rounded-xl bg-[#FEECEB] border border-[#F8C8C5] text-xs font-bold text-[#E02D3C]">
                      {error}
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#14304A] mb-1">
                      Full Name *
                    </label>
                    <div className="relative flex items-center rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] focus-within:border-[#559620] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#559620]/15 transition-all">
                      <User className="w-4 h-4 text-[#8E9F90] absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 text-[#14304A] font-semibold bg-transparent outline-none placeholder:text-[#9AA89C]"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-[#14304A] mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative flex items-center rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] overflow-hidden focus-within:border-[#559620] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#559620]/15 transition-all">
                      <span className="px-3.5 py-2.5 text-xs sm:text-sm font-extrabold text-[#14304A] border-r border-[#D9E6DA] bg-[#F2F7F1]">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setPhone(val);
                          if (error) setError("");
                        }}
                        placeholder="10-digit mobile number"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 text-[#14304A] font-semibold bg-transparent outline-none placeholder:text-[#9AA89C]"
                      />
                    </div>
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-[#14304A] mb-1">
                      Email Address <span className="text-[#8E9F90] font-normal">(optional)</span>
                    </label>
                    <div className="relative flex items-center rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] focus-within:border-[#559620] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#559620]/15 transition-all">
                      <Mail className="w-4 h-4 text-[#8E9F90] absolute left-3.5 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="e.g. ramesh@example.com"
                        className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 text-[#14304A] font-semibold bg-transparent outline-none placeholder:text-[#9AA89C]"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#14304A] mb-1">
                      Create Password *
                    </label>
                    <div className="relative flex items-center rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] focus-within:border-[#559620] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#559620]/15 transition-all">
                      <Lock className="w-4 h-4 text-[#8E9F90] absolute left-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="Minimum 6 characters"
                        className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 text-[#14304A] font-semibold bg-transparent outline-none placeholder:text-[#9AA89C]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-[#8E9F90] hover:text-[#14304A] transition-colors cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-[#14304A] mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative flex items-center rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] focus-within:border-[#559620] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#559620]/15 transition-all">
                      <Lock className="w-4 h-4 text-[#8E9F90] absolute left-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="Re-enter your password"
                        className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 text-[#14304A] font-semibold bg-transparent outline-none placeholder:text-[#9AA89C]"
                      />
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2 text-xs text-[#556A58] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded-sm border-[#CCDCCD] text-[#559620] focus:ring-[#559620]"
                      />
                      <span className="leading-snug">
                        I agree to Genekon&apos;s{" "}
                        <Link href="/terms" className="text-[#559620] font-bold hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy-policy" className="text-[#559620] font-bold hover:underline">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                  </div>

                  {/* Primary Submit Button: Green */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-[#559620] hover:bg-[#467E19] active:bg-[#3D6E16] text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <span className="animate-pulse">Creating Account...</span>
                    ) : (
                      <>
                        <span>Create Genekon Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Continue with Google */}
                  <button
                    type="button"
                    onClick={triggerGoogleLogin}
                    disabled={loading || isGoogleLoading}
                    className="w-full py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] hover:bg-[#F2F7F2] text-xs sm:text-sm font-bold text-[#14304A] transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{isGoogleLoading ? "Connecting with Google..." : "Sign up with Google"}</span>
                  </button>
                </form>

                {/* Already have an account link */}
                <div className="mt-5 pt-3 border-t border-[#EDF3EC] text-center text-xs text-[#637766]">
                  <span>Already have a Genekon account? </span>
                  <Link
                    href="/login"
                    className="text-[#1853A8] font-bold hover:underline"
                  >
                    Sign In &rarr;
                  </Link>
                </div>

                {/* Switch to Wholesale Portal */}
                <div className="mt-3 text-center text-xs text-[#637766]">
                  <span>Hospital, clinic or pharmacy? </span>
                  <Link
                    href="/wholesale/register"
                    className="text-[#559620] font-bold hover:underline"
                  >
                    Wholesale B2B Registration &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Bottom Footer */}
      <footer className="border-t border-[#E2EAE0] bg-white/70 py-4 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between text-xs text-[#718573] gap-2">
        <p>&copy; 2026 Genekon Pharmaceuticals Pvt Ltd. All rights reserved.</p>
        <div className="flex items-center gap-2 font-bold text-[#556A58]">
          <span>A Healthier World, Together</span>
          <span className="w-6 h-[2px] bg-[#559620] rounded-full inline-block" />
        </div>
      </footer>
    </div>
  );
}
