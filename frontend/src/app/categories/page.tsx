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

import { FEATURED_CATEGORIES } from "@/data/categories";

function getCategoryImage(slug: string) {
  const s = slug.toLowerCase();
  if (s.includes("eye") || s.includes("ear")) return "/images/products/genekon-eye-drops.jpg";
  if (s.includes("diagnostic") || s.includes("device")) return "/images/products/genekon-diagnostic-device.jpg";
  if (s.includes("respiratory") || s.includes("asthma")) return "/images/products/genekon-inhaler-device.jpg";
  if (s.includes("skin") || s.includes("antiseptic") || s.includes("muscle") || s.includes("piles")) return "/images/products/genekon-ointment-tube.jpg";
  if (s.includes("cold") || s.includes("cough") || s.includes("gastro") || s.includes("baby")) return "/images/products/genekon-syrup-bottle.jpg";
  if (s.includes("vitamin") || s.includes("nutrition") || s.includes("ayurvedic")) return "/images/products/genekon-health-powder.jpg";
  if (s.includes("supplement") || s.includes("anemia") || s.includes("thyroid")) return "/images/products/genekon-capsules-bottle.jpg";
  return "/images/products/genekon-tablets-pack.jpg";
}

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
              Explore All 27 Therapeutic Categories
            </h1>
            <p className="text-xs sm:text-sm text-[#5D7160] mt-2">
              Browse through our comprehensive range of 360+ authentic pharmaceutical medicines, personal care essentials, and diagnostic equipment.
            </p>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FEATURED_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.slug}
                className="group relative rounded-3xl border border-[#DCE8D8] bg-white p-6 shadow-2xs hover:shadow-md hover:border-[#559620]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-24 h-24 rounded-2xl bg-[#F4F9F2] p-2 mb-4 mx-auto overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={getCategoryImage(cat.slug)}
                      alt={cat.name}
                      fill
                      sizes="96px"
                      className="object-contain"
                    />
                  </div>

                  <h3 className="font-serif text-lg text-[#14304A] font-bold group-hover:text-[#1853A8] transition-colors text-center">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#559620] font-bold text-center mt-0.5">
                    {cat.itemCount} Medicines & Products
                  </p>
                  <p className="text-xs text-[#637766] mt-2 leading-relaxed text-center line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#EAF2E8] flex items-center justify-center gap-1 text-xs font-bold text-[#14304A] group-hover:text-[#559620] transition-colors">
                  <span>View Products</span>
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
