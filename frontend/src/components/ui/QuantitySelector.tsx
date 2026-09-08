"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className = "",
  disabled = false,
}) => {
  const handleDecrement = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const sizeClasses = {
    sm: "h-7 text-xs",
    md: "h-8 sm:h-9 text-xs sm:text-sm",
    lg: "h-10 sm:h-11 text-sm sm:text-base",
  };

  const buttonClasses = {
    sm: "w-6 h-full text-xs",
    md: "w-8 h-full text-xs sm:text-sm",
    lg: "w-10 h-full text-sm",
  };

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-[#D5DFE6] bg-white overflow-hidden shadow-2xs ${sizeClasses[size]} ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min || disabled}
        aria-label="Decrease quantity"
        className={`flex items-center justify-center text-[#14304A] hover:bg-[#F0F5F2] active:bg-[#E2ECE4] transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer ${buttonClasses[size]}`}
      >
        <Minus className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      </button>

      <span
        className={`px-2.5 font-bold text-[#14304A] select-none text-center min-w-[28px]`}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max || disabled}
        aria-label="Increase quantity"
        className={`flex items-center justify-center text-[#14304A] hover:bg-[#F0F5F2] active:bg-[#E2ECE4] transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer ${buttonClasses[size]}`}
      >
        <Plus className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      </button>
    </div>
  );
};
