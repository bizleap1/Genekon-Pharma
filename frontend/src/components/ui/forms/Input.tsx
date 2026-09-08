"use client";

import React, { forwardRef } from "react";
import { FormField } from "./FormField";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  optional?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      optional,
      required,
      id,
      className = "",
      leftIcon,
      rightIcon,
      type = "text",
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const inputElement = (
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[#7C917E]">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`w-full text-xs font-semibold px-4 py-3 rounded-2xl border transition-all outline-none bg-white text-[#14304A] placeholder:text-[#9FB1A1] ${
            leftIcon ? "pl-10" : ""
          } ${rightIcon ? "pr-10" : ""} ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
              : "border-[#CCDCCD] focus:border-[#559620] focus:ring-2 focus:ring-[#EDF7E9]"
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 flex items-center text-[#7C917E]">
            {rightIcon}
          </div>
        )}
      </div>
    );

    if (label || hint || error) {
      return (
        <FormField
          id={inputId}
          label={label}
          required={required}
          optional={optional}
          hint={hint}
          error={error}
        >
          {inputElement}
        </FormField>
      );
    }

    return inputElement;
  }
);

Input.displayName = "Input";
