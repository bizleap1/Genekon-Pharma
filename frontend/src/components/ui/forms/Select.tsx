"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { FormField } from "./FormField";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  optional?: boolean;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      optional,
      required,
      id,
      className = "",
      options = [],
      placeholder,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const selectElement = (
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`w-full appearance-none text-xs font-semibold px-4 py-3 rounded-2xl border transition-all outline-none bg-white text-[#14304A] cursor-pointer pr-10 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
              : "border-[#CCDCCD] focus:border-[#559620] focus:ring-2 focus:ring-[#EDF7E9]"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#7C917E]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );

    if (label || hint || error) {
      return (
        <FormField
          id={selectId}
          label={label}
          required={required}
          optional={optional}
          hint={hint}
          error={error}
        >
          {selectElement}
        </FormField>
      );
    }

    return selectElement;
  }
);

Select.displayName = "Select";
