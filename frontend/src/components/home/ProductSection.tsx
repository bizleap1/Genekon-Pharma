"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { useProductsQuery } from "@/hooks/api/useProductsQuery";
import { REFERENCE_PRODUCTS } from "@/data/products";

export const ProductSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: liveProducts } = useProductsQuery({ limit: 6 });
  const displayProducts = liveProducts && liveProducts.length > 0 ? liveProducts.slice(0, 6) : REFERENCE_PRODUCTS;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-6 sm:py-8 bg-white">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#14304A] tracking-tight">
              Bestselling Products
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6D5E] mt-1">
              Trusted brands. Real care.
            </p>
          </div>

          {/* Right Action & Arrows */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#1853A8] hover:text-[#123e7f] transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={() => scroll("left")}
                aria-label="Previous products"
                className="w-7 h-7 rounded-full border border-[#D5DFD7] hover:border-[#1853A8] text-[#556958] hover:text-[#1853A8] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Next products"
                className="w-7 h-7 rounded-full border border-[#D5DFD7] hover:border-[#1853A8] text-[#556958] hover:text-[#1853A8] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 6 Products Grid */}
        <div
          ref={scrollRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
        >
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
};
