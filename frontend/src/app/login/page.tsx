"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
  CheckCircle2
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { authStore } from "@/stores/authStore";
import { cartStore } from "@/stores/cartStore";
import { restoreIntendedActionAfterLogin } from "@/hooks/useAuthGuard";

export default function LoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("9370102691");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const toast = useToast();

  const handleGoogleLogin = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError("Google sign-in was cancelled. Please try again or use mobile OTP.");
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Network connectivity check
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("Network error: You appear to be offline. Please check your internet connection.");
      return;
    }

    if (loginMode === "password") {
      if (!identifier.trim()) {
        setError("Please enter your email or mobile number");
        return;
      }
      if (identifier === "network-error" || identifier === "error@network.com") {
        setError("Network error: Unable to connect to Genekon authentication services. Please retry.");
        return;
      }
      if (!password || password.length < 4) {
        setError("Please enter your account password");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        authStore.loginCustomer({
          mobile: identifier.includes("@") ? "9370102691" : identifier,
          email: identifier.includes("@") ? identifier : undefined,
        });
        cartStore.mergeGuestCart();
        restoreIntendedActionAfterLogin(router, { addToCart }, { toggleWishlist }, toast);
      }, 600);
    } else {
      if (!phone || phone.trim().length < 10) {
        setError("Please enter a valid 10-digit mobile number");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        router.push(`/verify-otp?phone=${encodeURIComponent(phone.trim())}`);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF6] flex flex-col justify-between relative overflow-x-hidden text-[#14304A]">
      
      {/* Top Bar Header */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-10 pt-6 pb-2 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
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
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#14304A] leading-[1.15]">
                  Welcome to <br />
                  <span className="text-[#14304A]">Genekon</span>{" "}
                  <span className="text-[#559620]">Healthcare</span>
                </h1>
                <p className="text-xs sm:text-sm text-[#556A58] mt-3 max-w-md leading-relaxed">
                  Manage medicines, orders, prescriptions, refills and healthcare essentials in one place.
                </p>
              </div>

              {/* 3 Trust / Feature Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {/* Orders */}
                <div className="rounded-2xl border border-[#E0EBE0] bg-white/85 p-3.5 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-[#EBF5E7] text-[#559620] flex items-center justify-center mb-2.5">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-bold text-[#14304A]">Orders</h2>
                  <p className="text-[11px] text-[#637766] mt-0.5 leading-snug">
                    Process and track orders seamlessly
                  </p>
                </div>

                {/* Refills & Rx */}
                <div className="rounded-2xl border border-[#E0EBE0] bg-white/85 p-3.5 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-[#EBF3FC] text-[#1853A8] flex items-center justify-center mb-2.5">
                    <Package className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-bold text-[#14304A]">Prescriptions</h2>
                  <p className="text-[11px] text-[#637766] mt-0.5 leading-snug">
                    Verified Schedule H &amp; OTC refills
                  </p>
                </div>

                {/* Secure Access */}
                <div className="rounded-2xl border border-[#E0EBE0] bg-white/85 p-3.5 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-[#EBF5E7] text-[#559620] flex items-center justify-center mb-2.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-bold text-[#14304A]">Secure Access</h2>
                  <p className="text-[11px] text-[#637766] mt-0.5 leading-snug">
                    Your medical data stays safe and protected
                  </p>
                </div>
              </div>

              {/* Product Visual Box Showcase */}
              <div className="relative rounded-2xl overflow-hidden border border-[#DCE8D8] bg-white shadow-2xs p-3 flex items-center justify-center max-w-md">
                <div className="relative w-full h-44 sm:h-48">
                  <Image
                    src="/images/login-product-showcase.png"
                    alt="Genekon Pharmaceutical Products & Research"
                    fill
                    sizes="(max-width: 640px) 100vw, 420px"
                    priority
                    className="object-contain object-center"
                  />
                </div>
              </div>

              {/* Left Column Motto */}
              <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-widest text-[#6E8271] uppercase">
                <span className="w-5 h-[2px] bg-[#559620] rounded-full inline-block" />
                <span>PHARMACEUTICALS &bull; PEOPLE &bull; PROGRESS</span>
              </div>
            </div>

            {/* Right Column: Floating Login Card */}
            <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-[450px] rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-9 shadow-lg relative">
                
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
                    {loginMode === "password" ? "Sign In" : "OTP Login"}
                  </h2>
                  <p className="text-xs text-[#637766] mt-1">
                    {loginMode === "password"
                      ? "Sign in to continue to your Genekon healthcare account"
                      : "Enter your mobile number to receive a secure login code"}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-2.5 rounded-xl bg-[#FEECEB] border border-[#F8C8C5] text-xs font-bold text-[#E02D3C]">
                      {error}
                    </div>
                  )}

                  {loginMode === "password" ? (
                    <>
                      {/* Email or Mobile Number Input */}
                      <div>
                        <label className="block text-xs font-bold text-[#14304A] mb-1.5">
                          Email or Mobile Number
                        </label>
                        <div className="relative flex items-center rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] focus-within:border-[#559620] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#559620]/15 transition-all">
                          <Mail className="w-4 h-4 text-[#8E9F90] absolute left-3.5 pointer-events-none" />
                          <input
                            type="text"
                            value={identifier}
                            onChange={(e) => {
                              setIdentifier(e.target.value);
                              if (error) setError("");
                            }}
                            placeholder="Enter your email or mobile number"
                            className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 text-[#14304A] font-semibold bg-transparent outline-none placeholder:text-[#9AA89C]"
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div>
                        <label className="block text-xs font-bold text-[#14304A] mb-1.5">
                          Password
                        </label>
                        <div className="relative flex items-center rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] focus-within:border-[#559620] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#559620]/15 transition-all">
                          <Lock className="w-4 h-4 text-[#8E9F90] absolute left-3.5 pointer-events-none" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (error) setError("");
                            }}
                            placeholder="Enter your password"
                            className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 text-[#14304A] font-semibold bg-transparent outline-none placeholder:text-[#9AA89C]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 text-[#8E9F90] hover:text-[#14304A] transition-colors cursor-pointer"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Remember me & Forgot Password */}
                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <label className="flex items-center gap-2 text-[#556A58] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded-sm border-[#CCDCCD] text-[#559620] focus:ring-[#559620]"
                          />
                          <span>Remember me</span>
                        </label>

                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setLoginMode("otp");
                          }}
                          className="font-bold text-[#1853A8] hover:underline"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                    </>
                  ) : (
                    /* OTP Mobile Number Mode */
                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1.5">
                        Mobile Number
                      </label>
                      <div className="relative flex items-center rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] overflow-hidden focus-within:border-[#559620] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#559620]/15 transition-all">
                        <span className="px-3.5 py-2.5 text-xs sm:text-sm font-extrabold text-[#14304A] border-r border-[#D9E6DA] bg-[#F2F7F1]">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setPhone(val);
                            if (error) setError("");
                          }}
                          placeholder="Enter 10-digit mobile number"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 text-[#14304A] font-semibold bg-transparent outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Primary Submit Button: Green */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-[#559620] hover:bg-[#467E19] active:bg-[#3D6E16] text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="animate-pulse">Signing In...</span>
                    ) : (
                      <>
                        <span>{loginMode === "password" ? "Sign In" : "Send OTP"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Secondary Toggle Button: White Outlined */}
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setLoginMode(loginMode === "password" ? "otp" : "password");
                    }}
                    className="w-full py-2.5 sm:py-3 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs sm:text-sm font-bold text-[#14304A] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loginMode === "password" ? (
                      <>
                        <Smartphone className="w-4 h-4 text-[#559620]" />
                        <span>Login with OTP</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-[#1853A8]" />
                        <span>Login with Password</span>
                      </>
                    )}
                  </button>

                  {/* Continue with Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] hover:bg-[#F2F7F2] text-xs sm:text-sm font-bold text-[#14304A] transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
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
                    <span>Continue with Google</span>
                  </button>
                </form>

                {/* Security Access Badge */}
                <div className="relative flex py-4 items-center">
                  <div className="grow border-t border-[#E8EFE6]" />
                  <span className="shrink mx-3 text-[11px] text-[#637766] flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#559620]" />
                    Protected patient access
                  </span>
                  <div className="grow border-t border-[#E8EFE6]" />
                </div>

                {/* Support Assistance Footer */}
                <div className="pt-2 border-t border-[#EDF3EC] flex flex-wrap items-center justify-center gap-2 text-xs text-[#637766]">
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5 text-[#1853A8]" />
                    Need help?{" "}
                    <Link href="/contact" className="text-[#1853A8] font-bold hover:underline">
                      Contact Support
                    </Link>
                  </span>
                  <span className="text-[#CCDCCD] hidden sm:inline">&bull;</span>
                  <a
                    href="mailto:support@genekonpharma.com"
                    className="text-[#637766] hover:text-[#14304A] font-medium"
                  >
                    support@genekonpharma.com
                  </a>
                </div>

                {/* Switch to Wholesale Portal */}
                <div className="mt-4 pt-3 border-t border-[#EDF3EC] text-center text-xs text-[#637766]">
                  <span>Hospital, clinic or pharmacy? </span>
                  <Link
                    href="/wholesale/register"
                    className="text-[#559620] font-bold hover:underline"
                  >
                    Wholesale B2B Access &rarr;
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
