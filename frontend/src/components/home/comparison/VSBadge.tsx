import React from "react";

interface VSBadgeProps {
  className?: string;
}

export const VSBadge: React.FC<VSBadgeProps> = ({ className = "" }) => {
  return (
    <div
      className={`relative z-10 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-[#1853A8] shadow-[0_2px_8px_rgba(24,83,168,0.15)] ${className}`}
      aria-label="Versus comparison"
    >
      <span className="text-[10px] sm:text-[11px] font-black text-[#1853A8] tracking-wider leading-none">
        VS
      </span>
    </div>
  );
};
