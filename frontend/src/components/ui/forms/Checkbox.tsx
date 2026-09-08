"use client";

import React, { forwardRef } from "react";
import { Check } from "lucide-react";
import { ErrorMessage } from "./ErrorMessage";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  description?: string;
  error?: string | null;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, id, className = "", checked, onChange, ...props }, ref) => {
    const checkboxId = id || `chk-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="space-y-1">
        <label
          htmlFor={checkboxId}
          className={`flex items-start gap-3 select-none cursor-pointer group ${className}`}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              checked={checked}
              onChange={onChange}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-[#559620]/30 ${
                checked
                  ? "bg-[#559620] border-[#559620] text-white shadow-2xs"
                  : error
                  ? "border-red-400 bg-red-50/30"
                  : "border-[#CCDCCD] bg-white group-hover:border-[#559620]"
              }`}
            >
              {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          <div className="flex-1">
            <span className="text-xs font-semibold text-[#14304A] leading-tight block">
              {label}
            </span>
            {description && (
              <p className="text-[11px] text-[#708573] mt-0.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </label>

        {error && <ErrorMessage error={error} className="ml-8" />}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
