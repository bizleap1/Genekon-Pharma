"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Percent, ChevronDown } from "lucide-react";

interface SubcategoryItem {
  name: string;
  slug: string;
  count: number;
}

interface PrimaryCategory {
  id: string;
  name: string;
  slug: string;
  totalCount: number;
  subcategories: SubcategoryItem[];
}

export const CategoryNav: React.FC = () => {
  const pathname = usePathname();
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  const primaryCategories: PrimaryCategory[] = [
    {
      id: "medicines",
      name: "Medicines",
      slug: "/category/medicines",
      totalCount: 215,
      subcategories: [
        { name: "Pain Relief & Fever", slug: "/category/pain-relief-fever", count: 36 },
        { name: "Cold, Cough & Flu", slug: "/category/cold-cough-flu", count: 23 },
        { name: "Antibiotics", slug: "/category/antibiotics", count: 34 },
        { name: "Diabetes Care", slug: "/category/diabetes-care", count: 28 },
        { name: "Cardiac & Blood Pressure", slug: "/category/cardiac-blood-pressure", count: 18 },
        { name: "Gastro & Digestive", slug: "/category/gastro-digestive", count: 29 },
        { name: "Allergy & Antihistamines", slug: "/category/allergy-antihistamines", count: 11 },
        { name: "Respiratory & Asthma", slug: "/category/respiratory-asthma", count: 10 },
        { name: "Eye & Ear Care", slug: "/category/eye-ear-care", count: 7 },
        { name: "Steroids & Anti-inflammatory", slug: "/category/steroids-anti-inflammatory", count: 5 },
        { name: "Thyroid & Hormonal", slug: "/category/thyroid-hormonal", count: 6 },
        { name: "Deworming", slug: "/category/deworming", count: 4 },
        { name: "Piles & Hemorrhoid Care", slug: "/category/piles-hemorrhoid-care", count: 4 },
      ],
    },
    {
      id: "healthcare",
      name: "Healthcare",
      slug: "/category/healthcare",
      totalCount: 38,
      subcategories: [
        { name: "Antiseptics & First Aid", slug: "/category/antiseptics-first-aid", count: 12 },
        { name: "Muscle & Joint Pain", slug: "/category/muscle-joint-pain", count: 9 },
        { name: "Bone & Joint Health", slug: "/category/bone-joint-health", count: 6 },
        { name: "Women's Health", slug: "/category/womens-health", count: 11 },
      ],
    },
    {
      id: "personal-care",
      name: "Personal Care",
      slug: "/category/personal-care",
      totalCount: 38,
      subcategories: [
        { name: "Skin Care & Dermatology", slug: "/category/skin-care-dermatology", count: 23 },
        { name: "Personal Care & Hygiene", slug: "/category/personal-care-hygiene", count: 8 },
        { name: "Oral Care", slug: "/category/oral-care", count: 7 },
      ],
    },
    {
      id: "vitamins",
      name: "Vitamins & Nutrition",
      slug: "/category/vitamins-nutrition",
      totalCount: 33,
      subcategories: [
        { name: "Vitamins & Supplements", slug: "/category/vitamins-supplements", count: 20 },
        { name: "Nutrition & Health Drinks", slug: "/category/nutrition-health-drinks", count: 6 },
        { name: "Anemia & Iron Supplements", slug: "/category/anemia-iron-supplements", count: 7 },
      ],
    },
    {
      id: "baby-care",
      name: "Baby Care",
      slug: "/category/baby-care",
      totalCount: 6,
      subcategories: [
        { name: "Baby Talc & Body Oils", slug: "/category/baby-care", count: 2 },
        { name: "Infant Colic Relief Drops", slug: "/category/baby-care", count: 2 },
        { name: "Pediatric Diaper Rash Creams", slug: "/category/baby-care", count: 2 },
      ],
    },
    {
      id: "ayurveda",
      name: "Ayurveda",
      slug: "/category/ayurveda",
      totalCount: 12,
      subcategories: [
        { name: "Chyawanprash & Immunity", slug: "/category/ayurvedic-herbal", count: 4 },
        { name: "Liv 52 & Organ Support", slug: "/category/ayurvedic-herbal", count: 4 },
        { name: "Classical Churnas & Ashwagandha", slug: "/category/ayurvedic-herbal", count: 4 },
      ],
    },
    {
      id: "medical-devices",
      name: "Medical Devices",
      slug: "/category/medical-devices",
      totalCount: 16,
      subcategories: [
        { name: "Blood Glucose Monitors & Strips", slug: "/category/diagnostic-devices-health-monitors", count: 4 },
        { name: "Digital Blood Pressure Monitors", slug: "/category/diagnostic-devices-health-monitors", count: 2 },
        { name: "Thermometers & Pulse Oximeters", slug: "/category/diagnostic-devices-health-monitors", count: 3 },
        { name: "Compressor Nebulizer Machines", slug: "/category/diagnostic-devices-health-monitors", count: 1 },
        { name: "Masks, Syringes & Rapid Test Kits", slug: "/category/diagnostic-devices-health-monitors", count: 6 },
      ],
    },
    {
      id: "wellness",
      name: "Wellness",
      slug: "/category/wellness",
      totalCount: 5,
      subcategories: [
        { name: "Sexual Wellness & Protection", slug: "/category/sexual-wellness", count: 5 },
      ],
    },
  ];

  return (
    <nav aria-label="Product categories" className="relative z-40 border-b border-[#E7ECEF] bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 text-xs sm:text-sm font-semibold text-[#14304A]">
          
          {/* All Categories Trigger */}
          <Link
            href="/categories"
            className="flex items-center gap-2 pr-4 border-r border-[#E7ECEF] font-bold text-[#14304A] hover:text-[#1A52A3] transition-colors shrink-0"
          >
            <Menu className="w-4 h-4 text-[#14304A]" />
            <span>All Categories</span>
          </Link>

          {/* Category Links with Hover Dropdown */}
          <ul className="flex items-center gap-2 sm:gap-4 lg:gap-6 px-3 overflow-x-visible">
            {primaryCategories.map((cat) => {
              const isActive = pathname === cat.slug;
              const isHovered = hoveredCat === cat.id;

              return (
                <li
                  key={cat.id}
                  className="relative group py-1"
                  onMouseEnter={() => setHoveredCat(cat.id)}
                  onMouseLeave={() => setHoveredCat(null)}
                >
                  <Link
                    href={cat.slug}
                    className={`inline-flex items-center gap-1 py-1 transition-colors hover:text-[#1A52A3] ${
                      isActive ? "text-[#1A52A3] font-bold" : "text-[#14304A]/90"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronDown className="w-3 h-3 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                  </Link>

                  {/* Mega Dropdown Menu */}
                  {isHovered && cat.subcategories.length > 0 && (
                    <div className="absolute left-0 top-full pt-1.5 w-64 sm:w-72 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="rounded-2xl border border-[#DDE7DC] bg-white p-3 shadow-xl backdrop-blur-md">
                        <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-[#EEF4ED] text-[11px] font-bold text-[#657967] uppercase tracking-wider">
                          <span>{cat.name} Subcategories</span>
                          <span className="bg-[#EBF3FC] text-[#1853A8] px-1.5 py-0.5 rounded-full text-[10px] font-extrabold">
                            {cat.totalCount} items
                          </span>
                        </div>

                        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                          {cat.subcategories.map((sub, idx) => (
                            <Link
                              key={idx}
                              href={sub.slug}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-[#14304A] hover:bg-[#F2F7F0] hover:text-[#1853A8] transition-colors group/item"
                            >
                              <span className="font-medium truncate">{sub.name}</span>
                              <span className="text-[10px] text-[#718573] group-hover/item:text-[#1853A8] font-mono shrink-0 ml-2">
                                {sub.count}
                              </span>
                            </Link>
                          ))}
                        </div>

                        <div className="pt-2 mt-2 border-t border-[#EEF4ED]">
                          <Link
                            href={cat.slug}
                            className="block text-center text-xs font-bold text-[#1853A8] hover:underline py-1"
                          >
                            View All {cat.name} ({cat.totalCount}) →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
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
