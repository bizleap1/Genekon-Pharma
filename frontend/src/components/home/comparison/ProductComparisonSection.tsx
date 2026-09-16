"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ComparisonCard } from "./ComparisonCard";
import { ComparisonTrustStrip } from "./ComparisonTrustStrip";
import { getResolvedComparisons } from "@/data/comparisons";
import { useProductsQuery } from "@/hooks/api/useProductsQuery";
import { ALL_PRODUCTS } from "@/data/products";

export const ProductComparisonSection: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { data: liveProducts } = useProductsQuery({ limit: 100 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Resolve comparison pairs against catalog
  const catalog = liveProducts && liveProducts.length > 0 ? liveProducts : ALL_PRODUCTS;
  const comparisons = getResolvedComparisons(catalog);

  const updateScrollState = useCallback(() => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    // Calculate active card index based on scroll position
    const cardWidth = sliderRef.current.firstElementChild?.clientWidth || clientWidth;
    const index = Math.round(scrollLeft / (cardWidth + 16));
    setActiveIndex(Math.min(index, comparisons.length - 1));
  }, [comparisons.length]);

  useEffect(() => {
    updateScrollState();
    const current = sliderRef.current;
    if (!current) return;

    current.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      current.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const card = sliderRef.current.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : 340;
    const target = direction === "left" ? -step : step;

    sliderRef.current.scrollBy({ left: target, behavior: "smooth" });
  };

  const scrollToIndex = (index: number) => {
    if (!sliderRef.current) return;
    const card = sliderRef.current.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : 340;

    sliderRef.current.scrollTo({
      left: index * step,
      behavior: "smooth",
    });
  };

  if (!comparisons || comparisons.length === 0) {
    return null;
  }

  return (
    <section
      id="product-comparison-section"
      className="py-10 sm:py-14 bg-white relative overflow-hidden"
      aria-label="Compare Our Products & Prices"
    >
      <Container>
        {/* 1. Section Header (Center Aligned) */}
        <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
          <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#559620] mb-2">
            SMARTER CHOICES FOR A HEALTHIER YOU
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#14304A] font-normal tracking-tight">
            Compare Our Products &amp; Prices
          </h2>

          <p className="mt-2.5 text-xs sm:text-sm text-[#556958] leading-relaxed">
            Compare trusted alternatives, choose better value and save more.
          </p>
        </div>

        {/* 2. Carousel Wrapper with Navigation Arrows */}
        <div className="relative group">
          {/* Left Arrow Button */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous comparisons"
            className={`absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-[#DCE7F0] shadow-[0_4px_12px_rgba(20,48,74,0.12)] flex items-center justify-center text-[#14304A] transition-all duration-200 cursor-pointer ${
              canScrollLeft
                ? "hover:bg-[#F0F6FB] hover:border-[#1853A8] hover:scale-105 active:scale-95"
                : "opacity-30 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-[#14304A]" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Next comparisons"
            className={`absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-[#DCE7F0] shadow-[0_4px_12px_rgba(20,48,74,0.12)] flex items-center justify-center text-[#14304A] transition-all duration-200 cursor-pointer ${
              canScrollRight
                ? "hover:bg-[#F0F6FB] hover:border-[#1853A8] hover:scale-105 active:scale-95"
                : "opacity-30 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="w-5 h-5 text-[#14304A]" />
          </button>

          {/* Horizontally Scrollable Cards Container */}
          <div
            ref={sliderRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {comparisons.map((item) => (
              <div
                key={item.id}
                className="w-[88vw] sm:w-[380px] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start flex flex-col"
              >
                <ComparisonCard comparison={item} className="h-full" />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {comparisons.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to comparison slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === activeIndex
                  ? "w-7 bg-[#559620]"
                  : "w-2 bg-[#DCE7F0] hover:bg-[#A8C8E8]"
              }`}
            />
          ))}
        </div>

        {/* 4. Bottom Trust Strip */}
        <ComparisonTrustStrip />
      </Container>
    </section>
  );
};
