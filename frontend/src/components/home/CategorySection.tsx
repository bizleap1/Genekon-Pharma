"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  ringColor: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Prescription Medicines",
    slug: "/category/medicines",
    image: "/images/categories/cat-prescription-medicines-v2.jpg",
    ringColor: "ring-[#EBF3FC] group-hover:ring-[#C3DDF7]", // Soft Blue
  },
  {
    id: "cat-2",
    name: "Vitamins & Supplements",
    slug: "/category/vitamins-supplements",
    image: "/images/categories/cat-vitamins-supplements-v2.jpg",
    ringColor: "ring-[#E8F5E9] group-hover:ring-[#A5D6A7]", // Genekon Green Tint
  },
  {
    id: "cat-3",
    name: "Personal Care",
    slug: "/category/personal-care",
    image: "/images/categories/cat-personal-care-v2.jpg",
    ringColor: "ring-[#E0F2F1] group-hover:ring-[#80CBC4]", // Soft Mint
  },
  {
    id: "cat-4",
    name: "Skin Care",
    slug: "/category/skin-care",
    image: "/images/categories/cat-skin-care-v2.jpg",
    ringColor: "ring-[#E1F5FE] group-hover:ring-[#81D4FA]", // Sky Blue
  },
  {
    id: "cat-5",
    name: "Baby Care",
    slug: "/category/baby-care",
    image: "/images/categories/cat-baby-care-v2.jpg",
    ringColor: "ring-[#EBF3FC] group-hover:ring-[#C3DDF7]",
  },
  {
    id: "cat-6",
    name: "Ayurveda",
    slug: "/category/ayurveda",
    image: "/images/categories/cat-ayurveda-v2.jpg",
    ringColor: "ring-[#E8F5E9] group-hover:ring-[#A5D6A7]",
  },
  {
    id: "cat-7",
    name: "Medical Devices",
    slug: "/category/medical-devices",
    image: "/images/categories/cat-medical-devices-v2.jpg",
    ringColor: "ring-[#E0F2F1] group-hover:ring-[#80CBC4]",
  },
  {
    id: "cat-8",
    name: "Wellness Essentials",
    slug: "/category/wellness",
    image: "/images/categories/cat-wellness-essentials-v2.jpg",
    ringColor: "ring-[#E1F5FE] group-hover:ring-[#81D4FA]",
  },
];

export const CategorySection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-6 sm:py-8 bg-white">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#1853A8] uppercase mb-1.5 block">
              EXPLORE HEALTH. LIVE BETTER.
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14304A] tracking-tight">
              Shop By Category
            </h2>
            <p className="text-sm sm:text-base text-[#5B6D5E] mt-1.5 max-w-xl mx-auto">
              Everything you need for everyday health and wellness.
            </p>
          </div>
        </div>

        {/* Categories Row (Responsive Grid / Horizontal Scroll) */}
        <div
          ref={scrollRef}
          className="flex lg:grid lg:grid-cols-8 gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-4 -mx-4 px-4 lg:mx-0 lg:px-0"
        >
          {CATEGORIES.map((cat, index) => (
            <Link
              key={cat.id}
              href={cat.slug}
              className="group flex flex-col items-center text-center p-2 rounded-2xl transition-all duration-300 hover:-translate-y-[3px] min-w-[110px] sm:min-w-[130px] lg:min-w-0 snap-start animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Circular Avatar */}
              <div
                className={`relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[110px] lg:h-[110px] rounded-full bg-white ring-2 ring-offset-2 ${cat.ringColor} p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] group-hover:shadow-[0_8px_20px_rgba(24,83,168,0.08)] transition-all duration-300 overflow-hidden flex-shrink-0`}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-[#fafafa]">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100px, 120px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Label */}
              <span className="mt-4 text-[13px] sm:text-sm font-bold text-[#14304A] group-hover:text-[#1853A8] transition-colors leading-snug line-clamp-2 max-w-[100px] sm:max-w-[110px]">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom Navigation & Arrows */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous categories"
            className="hidden lg:flex w-9 h-9 rounded-full border border-[#D5DFD7] hover:border-[#1853A8] hover:bg-[#F4F9F2] text-[#556958] hover:text-[#1853A8] items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <Link
            href="/categories"
            className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-[#347A14] hover:bg-[#1853A8] px-6 py-2.5 rounded-full transition-colors shadow-xs"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => scroll("right")}
            aria-label="Next categories"
            className="hidden lg:flex w-9 h-9 rounded-full border border-[#D5DFD7] hover:border-[#1853A8] hover:bg-[#F4F9F2] text-[#556958] hover:text-[#1853A8] items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </Container>
    </section>
  );
};
