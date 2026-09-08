"use client";

import React from "react";
import { ErrorMessage } from "./ErrorMessage";

interface FormFieldProps {
  label?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string | null;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  optional = false,
  hint,
  error,
  id,
  className = "",
  children,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-xs font-bold text-[#14304A]">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {optional && (
            <span className="text-[11px] font-medium text-[#7C917E]">(Optional)</span>
          )}
        </div>
      )}

      {children}

      {hint && !error && (
        <p className="text-[11px] text-[#708573] leading-relaxed">{hint}</p>
      )}

      <ErrorMessage error={error} />
    </div>
  );
};
