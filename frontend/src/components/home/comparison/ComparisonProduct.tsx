import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { SavingsBadge } from "./SavingsBadge";
import { CheckCircle2, ShieldAlert, ShoppingCart, Check, Building2 } from "lucide-react";

interface ComparisonProductProps {
  product: Product;
  isAlternative?: boolean;
  savingsPercent?: number | null;
  unitPrice?: string | null;
  onAddToCart?: () => void;
  isAdded?: boolean;
  className?: string;
}

export const ComparisonProduct: React.FC<ComparisonProductProps> = ({
  product,
  isAlternative = false,
  savingsPercent = null,
  unitPrice = null,
  onAddToCart,
  isAdded = false,
  className = "",
}) => {
  const isOutOfStock =
    product.stockStatus === "Out of Stock" ||
    product.stockQuantity === 0 ||
    product.inStock === false;

  const primaryImage =
    product.images?.[0] || product.image || "/images/products/genekon-tablets-pack.jpg";
  const packInfo = product.packSize || product.dosageForm || "Standard Pack";
  const sellingPrice = Number(product.sellingPrice || product.price || 0);
  const mrp = Number(product.mrp || product.originalPrice || sellingPrice);

  return (
    <div
      className={`flex flex-col justify-between p-3 sm:p-4 transition-all duration-200 ${
        isAlternative
          ? "bg-[#F4F9F2]/80 rounded-r-2xl sm:rounded-r-3xl"
          : "bg-white rounded-l-2xl sm:rounded-l-3xl"
      } ${className}`}
    >
      <div>
        {/* Top Badges & Labels */}
        <div className="min-h-[26px] flex items-center justify-between gap-1 mb-2">
          {isAlternative ? (
            <div className="flex items-center justify-between w-full gap-1">
              <SavingsBadge savingsPercent={savingsPercent} />
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-[#1853A8] bg-[#EBF4FB] px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-2.5 h-2.5 text-[#1853A8]" />
                Best Value
              </span>
            </div>
          ) : (
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#6A7E6E] uppercase tracking-wider">
              Market Reference
            </span>
          )}
        </div>

        {/* Product Image */}
        <Link
          href={`/product/${product.id}`}
          className="group block relative w-full aspect-square max-w-[130px] sm:max-w-[140px] mx-auto mb-2.5 rounded-xl overflow-hidden bg-white border border-[#E9F0EA] p-2 flex items-center justify-center hover:border-[#559620]/50 transition-all"
        >
          <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 120px, 140px"
              className="object-contain"
              loading="lazy"
            />
          </div>
        </Link>

        {/* Product Name */}
        <Link
          href={`/product/${product.id}`}
          className="block group/title mb-1"
        >
          <h4 className="font-bold text-xs sm:text-sm text-[#14304A] leading-snug line-clamp-2 group-hover/title:text-[#1853A8] transition-colors">
            {product.name}
          </h4>
        </Link>

        {/* Brand / Manufacturer */}
        {(product.brand || product.manufacturer) && (
          <div className={`flex items-center gap-1.5 mb-1.5 px-2 py-1 rounded-md border ${
            isAlternative 
              ? "bg-white border-[#D2E7C6] shadow-[0_2px_8px_rgba(85,150,32,0.06)]" 
              : "bg-[#FAFAFA] border-[#E8E8E8]"
          }`}>
            {isAlternative ? (
              <div className="w-4 h-4 relative shrink-0">
                <Image 
                  src="/images/genekon-icon.png" 
                  alt="Genekon" 
                  fill 
                  className="object-contain" 
                />
              </div>
            ) : (
              <div className="w-4 h-4 bg-[#EFEFEF] rounded flex items-center justify-center shrink-0">
                <Building2 className="w-2.5 h-2.5 text-[#9AA59D]" />
              </div>
            )}
            <p className={`text-[10px] sm:text-[11px] font-bold truncate ${
              isAlternative ? "text-[#14304A]" : "text-[#7A8E7E]"
            }`}>
              {product.brand || product.manufacturer}
            </p>
          </div>
        )}

        {/* Pack Info */}
        <p className="text-[11px] text-[#7A8E7E] truncate mb-2">
          Pack: {packInfo}
        </p>
      </div>

      {/* Pricing & Stock Details */}
      <div className="pt-2 border-t border-[#E3EDE5]/60 mt-auto flex flex-col justify-between min-h-[96px]">
        <div>
          {isAlternative ? (
            <div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-extrabold text-[#14304A]">
                  ₹{sellingPrice.toFixed(2)}
                </span>
                {mrp > sellingPrice && (
                  <span className="text-[11px] sm:text-xs text-[#8C9C8F] line-through">
                    ₹{mrp.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Unit Price */}
              {unitPrice && (
                <p className="text-[10px] sm:text-[11px] text-[#559620] font-semibold mt-0.5">
                  {unitPrice}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-[#14304A]">
                  MRP ₹{mrp.toFixed(2)}
                </span>
              </div>

              {/* Reference Unit Price */}
              {unitPrice && (
                <p className="text-[10px] sm:text-[11px] text-[#6A7E6E] font-medium mt-0.5">
                  {unitPrice}
                </p>
              )}
            </div>
          )}

          {/* Stock Availability Indicator */}
          {isOutOfStock && (
            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-red-600">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span>Out of Stock</span>
            </div>
          )}
        </div>

        {/* Add to Cart CTA for Alternative Product */}
        {isAlternative && onAddToCart && (
          <div className="mt-2.5">
            <button
              onClick={onAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-150 shadow-xs cursor-pointer ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                  : isAdded
                  ? "bg-[#2E7D32] text-white"
                  : "bg-[#347A14] hover:bg-[#1853A8] text-white active:scale-[0.98]"
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Added to Cart</span>
                </>
              ) : isOutOfStock ? (
                <span className="truncate">Out of Stock</span>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Add to Cart</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
