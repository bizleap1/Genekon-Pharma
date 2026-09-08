"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-[#DCE8D8]">
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 p-1 rounded-lg text-[#859987] hover:text-[#14304A] cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive ? "bg-red-50 text-red-600" : "bg-[#EDF7E9] text-[#559620]"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 id="confirmation-modal-title" className="font-serif text-lg font-bold text-[#14304A]">
            {title}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-[#5C715E] leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3EDE1]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-[#CCDCCD] text-xs font-bold text-[#14304A] hover:bg-[#F2F7F2] transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors cursor-pointer ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#559620] hover:bg-[#467E19]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
