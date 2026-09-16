import React from "react";
import { ShieldCheck, Truck, Sparkles } from "lucide-react";

interface ComparisonTrustStripProps {
  className?: string;
}

export const ComparisonTrustStrip: React.FC<ComparisonTrustStripProps> = ({
  className = "",
}) => {
  const trustPoints = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#559620] shrink-0" />,
      title: "100% Genuine Medicines",
      subtitle: "Trusted sourcing & certified batches",
    },
    {
      icon: <Truck className="w-5 h-5 text-[#1853A8] shrink-0" />,
      title: "Fast & Reliable Delivery",
      subtitle: "At your doorstep with cold-chain care",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#559620] shrink-0" />,
      title: "Better Prices, Healthier You",
      subtitle: "Save more on every verified order",
    },
  ];

  return (
    <div
      className={`mt-8 pt-6 border-t border-[#E3EDE5] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 ${className}`}
    >
      {trustPoints.map((point, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAFCFA] border border-[#E9F0EA]"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-[#DCE9D8] flex items-center justify-center shadow-2xs shrink-0">
            {point.icon}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#14304A] truncate">
              {point.title}
            </h4>
            <p className="text-[11px] text-[#556958] truncate">
              {point.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
