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
  bgColor: string;
  borderColor: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Prescription Medicines",
    slug: "/category/medicines",
    image: "/images/categories/cat-prescription-medicines-v2.jpg",
    bgColor: "bg-[#EBF3FC]",
    borderColor: "border-[#D7E6F8]",
  },
  {
    id: "cat-2",
    name: "Vitamins & Supplements",
    slug: "/category/vitamins-supplements",
    image: "/images/categories/cat-vitamins-supplements-v2.jpg",
    bgColor: "bg-[#FAF2E8]",
    borderColor: "border-[#F4E3CD]",
  },
  {
    id: "cat-3",
    name: "Personal Care",
    slug: "/category/personal-care",
    image: "/images/categories/cat-personal-care-v2.jpg",
    bgColor: "bg-[#F1F6FA]",
    borderColor: "border-[#DEEAF4]",
  },
  {
    id: "cat-4",
    name: "Skin Care",
    slug: "/category/skin-care",
    image: "/images/categories/cat-skin-care-v2.jpg",
    bgColor: "bg-[#EAF6F0]",
    borderColor: "border-[#D1ECDF]",
  },
  {
    id: "cat-5",
    name: "Baby Care",
    slug: "/category/baby-care",
    image: "/images/categories/cat-baby-care-v2.jpg",
    bgColor: "bg-[#FAF1EC]",
    borderColor: "border-[#F5E2D7]",
  },
  {
    id: "cat-6",
    name: "Ayurveda",
    slug: "/category/ayurveda",
    image: "/images/categories/cat-ayurveda-v2.jpg",
    bgColor: "bg-[#ECF5EE]",
    borderColor: "border-[#D5EAD8]",
  },
  {
    id: "cat-7",
    name: "Medical Devices",
    slug: "/category/medical-devices",
    image: "/images/categories/cat-medical-devices-v2.jpg",
    bgColor: "bg-[#EAF3FA]",
    borderColor: "border-[#D5E6F5]",
  },
  {
    id: "cat-8",
    name: "Wellness Essentials",
    slug: "/category/wellness",
    image: "/images/categories/cat-wellness-essentials-v2.jpg",
    bgColor: "bg-[#F6F4EB]",
    borderColor: "border-[#EBE6D5]",
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-[#14304A] tracking-tight">
              Shop By Category
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6D5E] mt-1">
              Everything you need for everyday health and wellness.
            </p>
          </div>

          {/* Right Navigation & Arrows */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#1853A8] hover:text-[#123e7f] transition-colors"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={() => scroll("left")}
                aria-label="Previous categories"
                className="w-7 h-7 rounded-full border border-[#D5DFD7] hover:border-[#1853A8] text-[#556958] hover:text-[#1853A8] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Next categories"
                className="w-7 h-7 rounded-full border border-[#D5DFD7] hover:border-[#1853A8] text-[#556958] hover:text-[#1853A8] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Row (Responsive Grid / Horizontal Scroll) */}
        <div
          ref={scrollRef}
          className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2"
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.slug}
              className="group flex flex-col items-center text-center p-2 rounded-2xl transition-all duration-200 hover:-translate-y-1"
            >
              {/* Circular / Rounded Avatar with High-Res Image */}
              <div
                className={`relative w-18 h-18 sm:w-20 sm:h-20 lg:w-[86px] lg:h-[86px] rounded-full ${cat.bgColor} border ${cat.borderColor} p-1 shadow-2xs group-hover:shadow-md transition-all duration-200 overflow-hidden`}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="90px"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Label */}
              <span className="mt-2.5 text-xs sm:text-[13px] font-bold text-[#14304A] group-hover:text-[#1853A8] transition-colors leading-snug line-clamp-2 max-w-[96px]">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};
