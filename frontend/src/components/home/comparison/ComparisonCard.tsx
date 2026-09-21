"use client";

import React, { useState } from "react";
import { ResolvedComparison } from "@/types/comparison";
import { ComparisonProduct } from "./ComparisonProduct";
import { VSBadge } from "./VSBadge";
import { useCart } from "@/context/CartContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  Heart,
  Pill,
  Activity,
  ShieldCheck,
  Sparkles,
  Thermometer,
} from "lucide-react";

interface ComparisonCardProps {
  comparison: ResolvedComparison;
  className?: string;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  comparison,
  className = "",
}) => {
  const { addToCart } = useCart();
  const { requireAuth } = useAuthGuard();
  const [added, setAdded] = useState(false);

  const alt = comparison.alternativeProduct;
  const isAltOutOfStock =
    alt.stockStatus === "Out of Stock" ||
    alt.stockQuantity === 0 ||
    alt.inStock === false;

  const handleAddToCart = () => {
    if (isAltOutOfStock) return;

    requireAuth(
      () => {
        const res = addToCart(alt, 1);
        if (res.success) {
          setAdded(true);
          setTimeout(() => setAdded(false), 1800);
        }
      },
      {
        type: "ADD_TO_CART",
        title: `Add ${alt.name} to Cart`,
        payload: { product: alt, quantity: 1 },
        redirectUrl: typeof window !== "undefined" ? window.location.pathname : "/cart",
      }
    );
  };

  // Render clinical category icon
  const renderIcon = () => {
    const iconClass = "w-4 h-4 text-brand-primary";
    switch (comparison.iconName) {
      case "heart":
        return <Heart className={iconClass} />;
      case "activity":
        return <Activity className={iconClass} />;
      case "shield":
        return <ShieldCheck className={iconClass} />;
      case "sparkles":
        return <Sparkles className={iconClass} />;
      case "thermometer":
        return <Thermometer className={iconClass} />;
      case "pill":
      default:
        return <Pill className={iconClass} />;
    }
  };

  return (
    <div
      className={`flex flex-col rounded-3xl bg-brand-soft-blue/50 border border-[#DCE7F0] shadow-[0_4px_16px_rgba(20,48,74,0.05)] overflow-hidden transition-all duration-200 hover:shadow-[0_8px_24px_rgba(20,48,74,0.08)] hover:border-brand-primary/30 ${className}`}
    >
      {/* 1. Clinical Header */}
      <div className="bg-[#F0F6FB] px-4 py-3 border-b border-[#E2EEF7] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white border border-[#D0E2F0] flex items-center justify-center shrink-0">
            {renderIcon()}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-[#14304A] truncate">
              {comparison.title}
            </h3>
            {comparison.subtitle && (
              <p className="text-[10px] sm:text-[11px] text-[#556958] truncate">
                {comparison.subtitle}
              </p>
            )}
          </div>
        </div>

        {comparison.category && (
          <span className="hidden sm:inline-block text-[10px] font-semibold text-brand-primary bg-white border border-[#D0E2F0] px-2 py-0.5 rounded-full shrink-0">
            {comparison.category}
          </span>
        )}
      </div>

      {/* 2. Split Comparison Grid (Reference vs Alternative) */}
      <div className="relative grid grid-cols-2 flex-1">
        {/* Left: Market Reference Product */}
        <ComparisonProduct
          product={comparison.referenceProduct}
          isAlternative={false}
          unitPrice={comparison.referenceUnitPrice}
          className="border-r border-[#E3EDE5]/80"
        />

        {/* Center: Floating VS Badge positioned right between the product images */}
        <div className="absolute left-1/2 top-[102px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
          <VSBadge />
        </div>

        {/* Right: Better-Priced Alternative Product */}
        <ComparisonProduct
          product={comparison.alternativeProduct}
          isAlternative={true}
          savingsPercent={comparison.savingsPercent}
          unitPrice={comparison.alternativeUnitPrice}
          onAddToCart={handleAddToCart}
          isAdded={added}
        />
      </div>
    </div>
  );
};
