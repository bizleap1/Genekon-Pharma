"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <aside
      role="region"
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";
        const isWarning = toast.type === "warning";
        const isInfo = toast.type === "info";

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 ${
              isSuccess
                ? "bg-white/95 border-[#CDE5C8] text-[#14304A]"
                : isError
                ? "bg-white/95 border-red-200 text-[#14304A]"
                : isWarning
                ? "bg-white/95 border-amber-200 text-[#14304A]"
                : "bg-white/95 border-blue-200 text-[#14304A]"
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#559620]" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-600" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {isInfo && <Info className="w-5 h-5 text-[#1853A8]" />}
            </div>

            {/* Message Body */}
            <div className="flex-1 text-xs sm:text-sm font-semibold text-[#14304A] leading-snug">
              {toast.message}
            </div>

            {/* Close Button */}
            <button
              onClick={() => onClose(toast.id)}
              className="shrink-0 text-[#8C9BA5] hover:text-[#14304A] p-0.5 rounded cursor-pointer transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </aside>
  );
};
