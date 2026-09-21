"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Truck, Tag, HeartHandshake } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { useProductsQuery } from "@/hooks/api/useProductsQuery";
import { REFERENCE_PRODUCTS } from "@/data/products";

export const ProductSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: liveProducts } = useProductsQuery({ limit: 16 });
  const displayProducts = liveProducts && liveProducts.length > 0 ? liveProducts.slice(0, 16) : REFERENCE_PRODUCTS;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-10 sm:py-12 bg-gradient-to-b from-white to-[#F0F7F4] relative overflow-hidden">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10 relative z-10">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-brand-primary uppercase mb-1.5 block">
              TRUSTED BRANDS. REAL CARE.
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14304A] tracking-tight">
              Bestselling <span className="text-[#00994B]">Products</span>
            </h2>
            <p className="text-sm sm:text-base text-[#5B6D5E] mt-1.5 max-w-xl mx-auto">
              Most loved by our customers. Quality you can trust.
            </p>
          </div>
        </div>

        {/* Products Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 relative z-10"
        >
          {displayProducts.map((product, index) => (
            <div key={product.id} className="min-w-[220px] sm:min-w-[260px] snap-start animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
              <ProductCard product={product} className="h-full" />
            </div>
          ))}
        </div>

        {/* Bottom Navigation & Arrows */}
        <div className="flex items-center justify-center gap-4 mt-6 relative z-10">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous products"
            className="hidden lg:flex w-9 h-9 rounded-full border border-[#D5DFD7] hover:border-brand-primary hover:bg-[#F4F9F2] text-[#556958] hover:text-brand-primary items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-brand-primary hover:bg-brand-secondary px-6 py-2.5 rounded-full transition-colors shadow-xs"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => scroll("right")}
            aria-label="Next products"
            className="hidden lg:flex w-9 h-9 rounded-full border border-[#D5DFD7] hover:border-brand-primary hover:bg-[#F4F9F2] text-[#556958] hover:text-brand-primary items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Trust Strip */}
        <div className="mt-4 sm:mt-8 bg-white rounded-[20px] border border-[#E8F0EA] p-6 lg:p-8 shadow-[0_8px_30px_rgba(24,83,168,0.04)] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-[#E8F0EA]">
            
            <div className="flex items-center gap-4 lg:px-6 first:pl-0 last:pr-0">
              <div className="w-12 h-12 rounded-full bg-[#F0F7F4] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-[22px] h-[22px] text-brand-primary" />
              </div>
              <div>
                <h4 className="text-[13px] sm:text-sm font-bold text-[#14304A]">100% Genuine Products</h4>
                <p className="text-[11px] sm:text-xs text-[#5B6D5E] mt-0.5">Sourced from trusted suppliers</p>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:px-6 first:pl-0 last:pr-0">
              <div className="w-12 h-12 rounded-full bg-[#F0F7F4] flex items-center justify-center shrink-0">
                <Truck className="w-[22px] h-[22px] text-brand-primary" />
              </div>
              <div>
                <h4 className="text-[13px] sm:text-sm font-bold text-[#14304A]">Fast & Reliable Delivery</h4>
                <p className="text-[11px] sm:text-xs text-[#5B6D5E] mt-0.5">At your doorstep</p>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:px-6 first:pl-0 last:pr-0">
              <div className="w-12 h-12 rounded-full bg-[#F0F7F4] flex items-center justify-center shrink-0">
                <Tag className="w-[22px] h-[22px] text-brand-primary" />
              </div>
              <div>
                <h4 className="text-[13px] sm:text-sm font-bold text-[#14304A]">Best Prices Everyday</h4>
                <p className="text-[11px] sm:text-xs text-[#5B6D5E] mt-0.5">More savings, better health</p>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:px-6 first:pl-0 last:pr-0">
              <div className="w-12 h-12 rounded-full bg-[#F0F7F4] flex items-center justify-center shrink-0">
                <HeartHandshake className="w-[22px] h-[22px] text-brand-primary" />
              </div>
              <div>
                <h4 className="text-[13px] sm:text-sm font-bold text-[#14304A]">Care You Can Trust</h4>
                <p className="text-[11px] sm:text-xs text-[#5B6D5E] mt-0.5">For a healthier tomorrow</p>
              </div>
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
};
