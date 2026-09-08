"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, Percent } from "lucide-react";
import { NAV_CATEGORIES } from "@/data/categories";

export const CategoryNav: React.FC = () => {
  const pathname = usePathname();

  const primaryCategories = [
    { id: "medicines", name: "Medicines", slug: "/category/medicines" },
    { id: "healthcare", name: "Healthcare", slug: "/category/healthcare" },
    { id: "personal-care", name: "Personal Care", slug: "/category/personal-care" },
    { id: "vitamins", name: "Vitamins & Nutrition", slug: "/category/vitamins-nutrition" },
    { id: "baby-care", name: "Baby Care", slug: "/category/baby-care" },
    { id: "ayurveda", name: "Ayurveda", slug: "/category/ayurveda" },
    { id: "medical-devices", name: "Medical Devices", slug: "/category/medical-devices" },
    { id: "wellness", name: "Wellness", slug: "/category/wellness" },
  ];

  return (
    <nav aria-label="Product categories" className="border-b border-[#E7ECEF] bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2 text-xs sm:text-sm font-semibold text-[#14304A]">
          
          {/* All Categories Trigger */}
          <Link
            href="/categories"
            className="flex items-center gap-2 pr-4 border-r border-[#E7ECEF] font-bold text-[#14304A] hover:text-[#1A52A3] transition-colors shrink-0"
          >
            <Menu className="w-4 h-4 text-[#14304A]" />
            <span>All Categories</span>
          </Link>

          {/* Category Links */}
          <ul className="flex items-center gap-4 lg:gap-7 px-4 min-w-max">
            {primaryCategories.map((cat) => {
              const isActive = pathname === cat.slug;
              return (
                <li key={cat.id}>
                  <Link
                    href={cat.slug}
                    className={`transition-colors hover:text-[#1A52A3] ${
                      isActive ? "text-[#1A52A3] font-bold" : "text-[#14304A]/90"
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right: Offers */}
          <div className="pl-4 shrink-0">
            <Link
              href="/offers"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F7EC] text-[#2E6B17] font-bold hover:bg-[#E2F0DA] transition-colors"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Offers</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};
