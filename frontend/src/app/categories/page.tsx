"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

const ALL_CATEGORY_TILES = [
  {
    name: "Prescription Medicines",
    slug: "/category/medicines",
    description: "Tablets, capsules, syrups, analgesics, antibiotics, chronic disease care",
    image: "/images/categories/cat-prescription-medicines-v2.jpg",
    itemCount: "4,200+ Products",
  },
  {
    name: "Vitamins & Supplements",
    slug: "/category/vitamins-nutrition",
    description: "Multivitamins, Vitamin D3, calcium, proteins, antioxidants, sports nutrition",
    image: "/images/categories/cat-vitamins-supplements-v2.jpg",
    itemCount: "1,200+ Products",
  },
  {
    name: "Personal & Skin Care",
    slug: "/category/personal-care",
    description: "Dermatological cleansers, moisturizers, barrier creams, sunscreens SPF 50",
    image: "/images/categories/cat-skin-care-v2.jpg",
    itemCount: "950+ Products",
  },
  {
    name: "Ayurveda & Herbal",
    slug: "/category/ayurveda",
    description: "Authentic Chyawanprash, liver care, botanical immunity boosters, pure extracts",
    image: "/images/categories/cat-ayurveda-v2.jpg",
    itemCount: "820+ Products",
  },
  {
    name: "Diagnostic & Medical Devices",
    slug: "/category/medical-devices",
    description: "Digital BP monitors, Accu-Chek test strips, digital thermometers, nebulizers",
    image: "/images/categories/cat-medical-devices-v2.jpg",
    itemCount: "430+ Products",
  },
  {
    name: "Baby Care Essentials",
    slug: "/category/baby-care",
    description: "Tear-free shampoos, diaper rash creams, baby powders, pediatric hygiene",
    image: "/images/categories/cat-baby-care-v2.jpg",
    itemCount: "640+ Products",
  },
  {
    name: "Everyday Healthcare",
    slug: "/category/healthcare",
    description: "First aid kits, pain relief sprays, band-aids, antiseptics, oral rehydration",
    image: "/images/categories/cat-wellness-essentials-v2.jpg",
    itemCount: "1,850+ Products",
  },
  {
    name: "Wellness & Lifestyle",
    slug: "/category/wellness",
    description: "Herbal teas, nutritional drinks, daily vitality, organic wellness supplements",
    image: "/images/categories/cat-wellness-essentials-v2.jpg",
    itemCount: "1,100+ Products",
  },
];

export default function AllCategoriesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFA]">
      <UtilityBar />
      <Header />
      <CategoryNav />

      <main className="flex-1 py-8 sm:py-12">
        <Container>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#6F8271] mb-6">
            <Link href="/" className="hover:text-[#14304A] transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-[#14304A] font-semibold">All Healthcare Categories</span>
          </nav>

          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-xs font-bold uppercase tracking-wider mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Genuine Healthcare</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#14304A] tracking-tight">
              Explore All Categories
            </h1>
            <p className="text-xs sm:text-sm text-[#5D7160] mt-2">
              Browse through our comprehensive range of authentic pharmaceutical medicines, personal care essentials, and diagnostic equipment.
            </p>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ALL_CATEGORY_TILES.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.slug}
                className="group relative rounded-3xl border border-[#DCE8D8] bg-white p-6 shadow-2xs hover:shadow-md hover:border-[#559620]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-20 h-20 rounded-2xl bg-[#F4F9F2] p-2 mb-4 mx-auto overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>

                  <h3 className="font-serif text-lg text-[#14304A] font-bold group-hover:text-[#1853A8] transition-colors text-center">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#559620] font-bold text-center mt-0.5">
                    {cat.itemCount}
                  </p>
                  <p className="text-xs text-[#637766] mt-2 leading-relaxed text-center">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#EAF2E8] flex items-center justify-center gap-1 text-xs font-bold text-[#14304A] group-hover:text-[#559620] transition-colors">
                  <span>Explore Category</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
