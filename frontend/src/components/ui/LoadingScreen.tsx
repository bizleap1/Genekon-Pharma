"use client";

import React from "react";
import Image from "next/image";

interface LoadingScreenProps {
  fullScreen?: boolean;
  message?: string;
  subMessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  fullScreen = true,
  message = "Loading genuine healthcare...",
  subMessage = "Care for today. Healthier tomorrow.",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-[#FAFCFB] transition-opacity duration-300 ${
        fullScreen ? "fixed inset-0 z-50 min-h-screen w-full" : "min-h-[360px] w-full py-12"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      {/* Background Soft Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-[#EBF5E6]/60 blur-3xl pointer-events-none -z-10 animate-pulse" />

      <div className="flex flex-col items-center max-w-xs text-center px-4">
        {/* Animated Brand Emblem with Spinner Rings */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          {/* Outer Static Track Ring */}
          <div className="absolute inset-0 rounded-full border-[3.5px] border-[#E2EFE0]" />

          {/* Active Gradient Spinner Ring */}
          <div className="absolute inset-0 rounded-full border-[3.5px] border-t-[#559620] border-r-[#1853A8] border-b-transparent border-l-transparent animate-spin [animation-duration:1.1s]" />

          {/* Inner Counter-Spinning Subtle Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-b-[#559620]/40 border-l-[#1853A8]/40 border-t-transparent border-r-transparent animate-spin [animation-duration:2.2s] [animation-direction:reverse]" />

          {/* Center Pulsing Genekon Icon */}
          <div className="relative w-11 h-11 rounded-2xl bg-white shadow-md border border-[#E2EFE0] flex items-center justify-center overflow-hidden p-1.5 animate-pulse">
            <Image
              src="/images/genekon-icon.png"
              alt="Genekon"
              width={36}
              height={36}
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Brand Title */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="font-heading font-black text-base tracking-[0.18em] text-[#14304A] uppercase">
            GENEKON
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#559620] animate-ping" />
        </div>

        {/* Primary Message with Animated Ellipsis */}
        <p className="text-xs font-semibold text-[#3C5340] tracking-wide mb-2 flex items-center justify-center gap-1">
          <span>{message}</span>
        </p>

        {/* Animated Heartbeat / ECG Wave */}
        <div className="w-32 h-6 flex items-center justify-center my-1 text-[#559620]">
          <svg
            viewBox="0 0 120 24"
            className="w-full h-full stroke-current fill-none stroke-[2.2] stroke-linecap-round stroke-linejoin-round opacity-80"
          >
            <path
              d="M 0 12 L 35 12 L 44 3 L 53 21 L 62 8 L 71 16 L 78 12 L 120 12"
              strokeDasharray="140"
              strokeDashoffset="140"
              className="animate-[pulse_1.8s_ease-in-out_infinite]"
            />
          </svg>
        </div>

        {/* Tagline / Subtitle */}
        {subMessage && (
          <p className="text-[11px] text-[#788C7B] tracking-normal font-medium mt-1">
            {subMessage}
          </p>
        )}

        {/* Verified Badge */}
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DDE7DC] shadow-xs text-[10px] font-bold text-[#559620]">
          <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Licensed Pharmacy &amp; Genuine Medicines</span>
        </div>
      </div>
    </div>
  );
};
