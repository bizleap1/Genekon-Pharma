"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Percent, ChevronDown, ChevronRight } from "lucide-react";

interface SubcategoryItem {
  name: string;
  slug: string;
  count: number;
}

interface PrimaryCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  totalCount: number;
  subcategories: SubcategoryItem[];
}

export const CategoryNav: React.FC = () => {
  const pathname = usePathname();

  const primaryCategories: PrimaryCategory[] = [
    {
      id: "medicines",
      name: "Medicines",
      slug: "/category/medicines",
      image: "/images/categories/prescription-medicines.jpg",
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
      image: "/images/categories/wellness-essentials.jpg",
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
      image: "/images/categories/personal-care.jpg",
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
      image: "/images/categories/vitamins-supplements.jpg",
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
      image: "/images/categories/baby-care.jpg",
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
      image: "/images/categories/ayurveda.jpg",
      totalCount: 12,
      subcategories: [
        { name: "Chyawanprash & Immunity", slug: "/category/ayurvedic-herbal", count: 4 },
        { name: "Liv 52 & Organ Support", slug: "/category/ayurvedic-herbal", count: 4 },
        { name: "Classical Churnas & Ashwagandha", slug: "/category/ayurvedic-herbal", count: 4 },
      ],
    },
    {
      id: "wellness",
      name: "Wellness",
      slug: "/category/wellness",
      image: "/images/categories/wellness-essentials.jpg",
      totalCount: 5,
      subcategories: [
        { name: "Sexual Wellness & Protection", slug: "/category/sexual-wellness", count: 5 },
      ],
    },
    {
      id: "medical-devices",
      name: "Medical Devices",
      slug: "/category/medical-devices",
      image: "/images/categories/medical-devices.jpg",
      totalCount: 16,
      subcategories: [
        { name: "Blood Glucose Monitors & Strips", slug: "/category/diagnostic-devices-health-monitors", count: 4 },
        { name: "Digital Blood Pressure Monitors", slug: "/category/diagnostic-devices-health-monitors", count: 2 },
        { name: "Thermometers & Pulse Oximeters", slug: "/category/diagnostic-devices-health-monitors", count: 3 },
        { name: "Compressor Nebulizer Machines", slug: "/category/diagnostic-devices-health-monitors", count: 1 },
        { name: "Masks, Syringes & Rapid Test Kits", slug: "/category/diagnostic-devices-health-monitors", count: 6 },
      ],
    },
  ];

  return (
    <nav aria-label="Product categories" className="relative z-40 border-b border-[#E7ECEF] bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 text-xs sm:text-sm font-semibold text-[#14304A]">
          
          {/* All Categories Trigger */}
          <div className="relative group/allcat pr-4 border-r border-[#E7ECEF] shrink-0 py-3 flex items-center">
            <Link
              href="/categories"
              className="flex items-center gap-2 font-bold text-[#14304A] group-hover/allcat:text-brand-primary transition-colors"
            >
              <Menu className="w-5 h-5 sm:w-4 sm:h-4 text-[#14304A] group-hover/allcat:text-brand-primary transition-colors" />
              <span className="hidden sm:inline">All Categories</span>
            </Link>

            {/* All Categories Dropdown (CSS Hover) */}
            <div className="absolute left-0 top-full mt-0 opacity-0 invisible group-hover/allcat:opacity-100 group-hover/allcat:visible translate-y-3 group-hover/allcat:translate-y-0 transition-all duration-300 ease-out w-[290px] z-[60]">
              <div className="rounded-2xl border border-[#E2EAE0] bg-white p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/5">
                <div className="flex flex-col gap-1">
                  {primaryCategories.map((cat) => (
                    <div key={cat.id} className="relative group/subcat">
                      <Link
                        href={cat.slug}
                        className="flex items-center gap-3 p-2 rounded-xl text-sm font-semibold text-[#14304A] hover:bg-[#F4F9F2] hover:text-brand-primary transition-all"
                      >
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[#F0F4EF] border border-[#E2EAE0]">
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            sizes="32px"
                            className="object-cover group-hover/subcat:scale-110 transition-transform duration-500 ease-out"
                          />
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <span>{cat.name}</span>
                          <ChevronRight className="w-4 h-4 opacity-40 group-hover/subcat:translate-x-1 transition-transform" />
                        </div>
                      </Link>

                      {/* Sub-menu Flyout (Opens to the right) */}
                      {cat.subcategories.length > 0 && (
                        <div className="absolute left-full top-0 ml-1 opacity-0 invisible group-hover/subcat:opacity-100 group-hover/subcat:visible translate-x-3 group-hover/subcat:translate-x-0 transition-all duration-300 ease-out w-[460px] z-[70]">
                          <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-[20px_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/5 before:content-[''] before:absolute before:-left-3 before:top-0 before:w-5 before:h-full">
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EEF4ED] text-[11px] font-bold text-[#657967] uppercase tracking-wider">
                              <span>{cat.name} Categories</span>
                              <span className="bg-[#F0F7EA] text-[#347A14] px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                                {cat.totalCount} items
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                              {cat.subcategories.map((sub, idx) => (
                                <Link
                                  key={idx}
                                  href={sub.slug}
                                  className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-[#14304A] hover:bg-[#F4F9F2] hover:text-brand-primary transition-all group/subitem"
                                >
                                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[#F0F4EF] border border-[#E2EAE0] shadow-sm">
                                    <Image
                                      src={cat.image}
                                      alt={sub.name}
                                      fill
                                      sizes="32px"
                                      className="object-cover group-hover/subitem:scale-110 transition-transform duration-500 ease-out"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-semibold block mb-0.5 line-clamp-2 leading-tight">{sub.name}</span>
                                    <span className="text-[9px] text-[#718573] group-hover/subitem:text-[#347A14] transition-colors">
                                      {sub.count} Products
                                    </span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            
                            <div className="pt-3 mt-3 border-t border-[#EEF4ED]">
                              <Link
                                href={cat.slug}
                                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#F8FAF7] hover:bg-[#EEF4ED] text-xs font-bold text-brand-primary transition-colors py-2.5 group/btn"
                              >
                                <span>Explore All {cat.name}</span>
                                <span className="transition-transform group-hover/btn:translate-x-1">→</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="pt-3 mt-3 border-t border-[#EEF4ED]">
                  <Link
                    href="/categories"
                    className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#F8FAF7] hover:bg-[#EEF4ED] text-xs font-bold text-brand-primary transition-colors py-2.5 group/btn"
                  >
                    <span>View All Categories</span>
                    <span className="transition-transform group-hover/btn:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Category Links with Hover Dropdown */}
          <ul className="flex flex-1 min-w-0 items-center gap-5 px-4 overflow-x-auto md:overflow-visible whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {primaryCategories.map((cat) => {
              const isActive = pathname === cat.slug;

              return (
                <li key={cat.id} className="relative group/navitem py-3">
                  <Link
                    href={cat.slug}
                    className={`inline-flex items-center gap-1 transition-colors group-hover/navitem:text-brand-primary ${
                      isActive ? "text-brand-primary font-bold" : "text-[#14304A]/90"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronDown className="w-3 h-3 opacity-60 group-hover/navitem:rotate-180 transition-transform duration-300" />
                  </Link>

                  {/* Premium Mega Dropdown Menu (CSS Hover) */}
                  {cat.subcategories.length > 0 && (
                    <div className="absolute left-0 top-full mt-0 opacity-0 invisible group-hover/navitem:opacity-100 group-hover/navitem:visible translate-y-3 group-hover/navitem:translate-y-0 transition-all duration-300 ease-out w-[320px] sm:w-[500px] z-[60]">
                      <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/5">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EEF4ED] text-[11px] font-bold text-[#657967] uppercase tracking-wider">
                          <span>{cat.name} Categories</span>
                          <span className="bg-[#F0F7EA] text-[#347A14] px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                            {cat.totalCount} items
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 max-h-[60vh] overflow-y-auto pr-2">
                          {cat.subcategories.map((sub, idx) => (
                            <Link
                              key={idx}
                              href={sub.slug}
                              className="flex items-center gap-3 p-2.5 rounded-xl text-xs text-[#14304A] hover:bg-[#F4F9F2] hover:text-brand-primary transition-all group/sub"
                            >
                              <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-[#F0F4EF] border border-[#E2EAE0] shadow-sm">
                                <Image
                                  src={cat.image}
                                  alt={sub.name}
                                  fill
                                  sizes="36px"
                                  className="object-cover group-hover/sub:scale-110 transition-transform duration-500 ease-out"
                                />
                              </div>
                              <div className="flex-1">
                                <span className="font-semibold block mb-0.5">{sub.name}</span>
                                <span className="text-[10px] text-[#718573] group-hover/sub:text-[#347A14] transition-colors">
                                  {sub.count} Products
                               </span>
                              </div>
                            </Link>
                          ))}
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#EEF4ED]">
                          <Link
                            href={cat.slug}
                            className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#F8FAF7] hover:bg-[#EEF4ED] text-xs font-bold text-brand-primary transition-colors py-2.5 group/btn"
                          >
                            <span>Explore All {cat.name}</span>
                            <span className="transition-transform group-hover/btn:translate-x-1">→</span>
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
          <div className="pl-3 sm:pl-4 shrink-0 border-l border-[#E7ECEF] ml-auto">
            <Link
              href="/offers"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold hover:opacity-90 transition-opacity"
            >
              <Percent className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offers</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};
