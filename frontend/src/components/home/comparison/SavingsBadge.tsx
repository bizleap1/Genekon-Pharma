import React from "react";

interface SavingsBadgeProps {
  savingsPercent: number | null;
  className?: string;
}

export const SavingsBadge: React.FC<SavingsBadgeProps> = ({
  savingsPercent,
  className = "",
}) => {
  if (!savingsPercent || savingsPercent <= 0) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide bg-[#559620] text-white shadow-xs animate-in fade-in duration-200 ${className}`}
      aria-label={`${savingsPercent}% savings`}
    >
      {savingsPercent}% SAVINGS
    </span>
  );
};
