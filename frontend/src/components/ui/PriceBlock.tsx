import React from "react";

interface PriceBlockProps {
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showBadge?: boolean;
}

export const PriceBlock: React.FC<PriceBlockProps> = ({
  price,
  originalPrice,
  discountPercent,
  size = "md",
  className = "",
  showBadge = true,
}) => {
  const calculatedDiscount =
    discountPercent ||
    (originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null);

  const sizeConfigs = {
    sm: {
      price: "text-sm sm:text-base font-extrabold",
      original: "text-xs",
      badge: "text-[10px] px-1.5 py-0.5",
    },
    md: {
      price: "text-base sm:text-lg font-extrabold",
      original: "text-xs sm:text-sm",
      badge: "text-[11px] px-2 py-0.5",
    },
    lg: {
      price: "text-2xl sm:text-3xl font-extrabold",
      original: "text-sm sm:text-base",
      badge: "text-xs px-2.5 py-1",
    },
  };

  const cfg = sizeConfigs[size];

  return (
    <div className={`flex items-baseline flex-wrap gap-2 ${className}`}>
      <span className={`text-[#14304A] tracking-tight ${cfg.price}`}>
        ₹{price.toLocaleString("en-IN")}
      </span>

      {originalPrice && originalPrice > price && (
        <span className={`text-[#85988A] line-through ${cfg.original}`}>
          ₹{originalPrice.toLocaleString("en-IN")}
        </span>
      )}

      {showBadge && calculatedDiscount && calculatedDiscount > 0 && (
        <span
          className={`font-bold bg-[#EDF7E9] text-[#559620] rounded-md ${cfg.badge}`}
        >
          {calculatedDiscount}% OFF
        </span>
      )}
    </div>
  );
};
