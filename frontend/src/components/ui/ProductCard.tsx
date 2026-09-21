"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, AlertTriangle, ShoppingCart, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { requireAuth } = useAuthGuard();
  const [added, setAdded] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock =
    product.stockStatus === "Out of Stock" ||
    product.stockQuantity === 0 ||
    product.inStock === false;
  const isLowStock =
    !isOutOfStock &&
    (product.stockStatus === "Low Stock" ||
      (product.stockQuantity > 0 && product.stockQuantity <= 10));

  const formatReviewCount = (cnt?: number) => {
    if (!cnt) return "";
    if (cnt >= 1000) return `${(cnt / 1000).toFixed(1)}k`;
    return cnt.toString();
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    requireAuth(
      () => {
        const res = addToCart(product, 1);
        if (res.success) {
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }
      },
      {
        type: "ADD_TO_CART",
        title: `Add ${product.name} to Cart`,
        payload: { product, quantity: 1 },
        redirectUrl: typeof window !== "undefined" ? window.location.pathname : "/cart",
      }
    );
  };

  const handleToggleWishlist = () => {
    requireAuth(
      () => {
        toggleWishlist(product);
      },
      {
        type: "WISHLIST",
        title: `Save ${product.name} to Wishlist`,
        payload: { product },
        redirectUrl: typeof window !== "undefined" ? window.location.pathname : "/wishlist",
      }
    );
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-[20px] border border-[#E8F0EA] bg-brand-soft-blue/50 p-3.5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(24,83,168,0.06)] hover:border-[#C3DDF7] hover:-translate-y-1 ${
        className || ""
      }`}
    >
      <div>
        {/* Top Bar: Discount Badge / Stock Badge & Wishlist Heart */}
        <div className="flex items-center justify-between mb-2 gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.productType === "GENERIC" && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF7E9] text-[#559620] border border-[#CDE5C8]">
                GENERIC
              </span>
            )}
            {product.productType === "BRANDED" && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F5F9] text-[#14304A] border border-[#D5E4F0]">
                BRANDED
              </span>
            )}
            
            {product.discountPercent || product.discount ? (
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm">
                {product.discount || product.discountPercent}% OFF
              </span>
            ) : null}

            {isOutOfStock ? (
              <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-2.5 h-2.5" />
                Only {product.stockQuantity} left
              </span>
            ) : null}
          </div>

          <button
            onClick={handleToggleWishlist}
            className="w-7 h-7 flex items-center justify-center text-[#8C9C8F] hover:text-red-500 transition-colors cursor-pointer shrink-0"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
        </div>

        {/* Product Image */}
        <Link
          href={`/product/${product.id}`}
          className="block w-full aspect-[4/3] sm:aspect-square relative mb-3 rounded-[14px] overflow-hidden bg-white flex items-center justify-center p-4 sm:p-6"
        >
          {product.images?.[0] || product.image ? (
            <div className="relative w-full h-full">
              <Image
                src={product.images?.[0] || product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                className={`object-contain group-hover:scale-[1.03] transition-transform duration-300 ${
                  isOutOfStock ? "opacity-50 grayscale" : ""
                }`}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[#8C9C8F]">
              {product.name}
            </div>
          )}
        </Link>

        {/* Brand */}
        <p className="text-xs font-bold text-[#14304A]">
          {product.brand}
        </p>

        {/* Product Name */}
        <Link href={`/product/${product.id}`} className="block group-hover:text-brand-primary transition-colors">
          <h3 className="text-xs sm:text-[13px] font-bold text-[#14304A] line-clamp-1 mt-0.5">
            {product.name}
          </h3>
        </Link>

        {/* Composition & Strength (For Medicines) */}
        {(product.composition || product.strength) && (
          <p className="text-[10px] text-[#5D735F] mt-1 font-medium leading-snug line-clamp-2">
            <span className="font-bold text-[#14304A]">{product.composition}</span>
            {product.strength && <span className="ml-1 text-[#559620]">{product.strength}</span>}
          </p>
        )}

        {/* Subtitle / Packaging */}
        {(product.dosageForm || product.packSize) && (
          <p className="text-[11px] text-[#7B8B7E] mt-1">
            {product.dosageForm || product.packSize}
          </p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px]">
            <span className="inline-flex items-center gap-0.5 font-bold text-[#EAA21D]">
              <Star className="w-3 h-3 fill-[#EAA21D]" />
              {product.rating}
            </span>
            {product.reviewCount && (
              <span className="text-[#7B8B7E]">
                ({formatReviewCount(product.reviewCount)})
              </span>
            )}
          </div>
        )}

        {/* Price Row */}
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-sm sm:text-base font-extrabold text-[#14304A]">
            ₹{product.price}
          </span>
          {(product.mrp || product.originalPrice) && (
            <span className="text-xs text-[#8C9C8F] line-through">
              ₹{product.mrp || product.originalPrice}
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart Button with Stock State Handling and Auth Guard */}
      <div className="mt-3">
        {isOutOfStock ? (
          <button
            disabled
            className="w-full py-2 px-3 rounded-xl border border-[#D5DFE6] bg-[#F1F4F6] text-[#8C9BA5] text-[13px] font-bold cursor-not-allowed select-none flex items-center justify-center gap-2"
          >
            Out of Stock
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className={`w-full py-2 px-3 rounded-xl text-[13px] font-bold transition-all duration-300 cursor-pointer select-none flex items-center justify-center gap-2 group/btn ${
              added
                ? "bg-[#00994B] text-white shadow-sm"
                : "bg-brand-primary text-white hover:bg-[#347A14] shadow-sm hover:shadow-md"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 transition-transform group-hover/btn:scale-110" /> Add to Cart
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
