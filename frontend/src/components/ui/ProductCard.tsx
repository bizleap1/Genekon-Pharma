"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, AlertTriangle } from "lucide-react";
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
      className={`group relative flex flex-col justify-between rounded-2xl border border-[#E3EDE5] bg-white p-3.5 transition-all duration-200 hover:shadow-md hover:border-[#559620]/40 ${
        className || ""
      }`}
    >
      <div>
        {/* Top Bar: Discount Badge / Stock Badge & Wishlist Heart */}
        <div className="flex items-center justify-between mb-2 gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.discountPercent || product.discount ? (
              <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-[#559620] text-white">
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
          className="block w-full aspect-square relative mb-2.5 rounded-xl overflow-hidden bg-[#FAFCFB] flex items-center justify-center p-2"
        >
          {product.images?.[0] || product.image ? (
            <div className="relative w-full h-full">
              <Image
                src={product.images?.[0] || product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                className={`object-contain group-hover:scale-105 transition-transform duration-300 ${
                  isOutOfStock ? "opacity-60 grayscale-[40%]" : ""
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
        <Link href={`/product/${product.id}`} className="block group-hover:text-[#1853A8] transition-colors">
          <h3 className="text-xs sm:text-[13px] font-bold text-[#14304A] line-clamp-1 mt-0.5">
            {product.name}
          </h3>
        </Link>

        {/* Subtitle / Packaging */}
        {(product.dosageForm || product.packSize) && (
          <p className="text-[11px] text-[#7B8B7E] mt-0.5">
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
            className="w-full py-1.5 px-3 rounded-lg border border-[#D5DFE6] bg-[#F1F4F6] text-[#8C9BA5] text-xs sm:text-[13px] font-bold cursor-not-allowed select-none"
          >
            Out of Stock
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className={`w-full py-1.5 px-3 rounded-lg border text-xs sm:text-[13px] font-bold transition-all duration-150 cursor-pointer shadow-2xs select-none ${
              added
                ? "bg-[#559620] border-[#559620] text-white"
                : "border-[#687C6A] bg-white text-[#14304A] hover:border-[#559620] hover:text-[#559620] hover:bg-[#F4F9F2]"
            }`}
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
};
