"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lock, X, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export const LoginRequiredModal: React.FC = () => {
  const router = useRouter();
  const { loginModal, closeLoginModal } = useAuthStore();

  if (!loginModal.isOpen) return null;

  const handleContinueLogin = () => {
    closeLoginModal();
    router.push("/login");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-required-title"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#DCE8D8]">
        {/* Close X */}
        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 p-1 rounded-lg text-[#859987] hover:text-[#14304A] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#EDF7E9] text-[#559620] border border-[#D5E4D2] flex items-center justify-center mb-4 mx-auto sm:mx-0">
          <Lock className="w-6 h-6" />
        </div>

        {/* Heading & Message */}
        <h3
          id="login-required-title"
          className="font-serif text-xl sm:text-2xl font-bold text-[#14304A] text-center sm:text-left tracking-tight"
        >
          {loginModal.message}
        </h3>

        <p className="text-xs sm:text-sm text-[#596E5C] mt-2 mb-6 leading-relaxed text-center sm:text-left">
          Please log in to your verified Genekon account to proceed with your medicines, prescriptions, and healthcare orders securely.
        </p>

        {/* Trust Badges */}
        <div className="p-3.5 rounded-2xl bg-[#F7FAF6] border border-[#E3EDE1] mb-6 flex items-center gap-2.5 text-xs text-[#425845]">
          <ShieldCheck className="w-4 h-4 text-[#559620] shrink-0" />
          <span>Your cart and selected items will be saved automatically.</span>
        </div>

        {/* Action Buttons as requested */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeLoginModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#CCDCCD] text-xs sm:text-sm font-bold text-[#14304A] hover:bg-[#F2F7F2] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleContinueLogin}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
