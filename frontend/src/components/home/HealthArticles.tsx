"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Container } from "@/components/ui/Container";

interface Article {
  id: string;
  tag: string;
  title: string;
  excerpt: string;
  slug: string;
  image: string;
  readTime: string;
}

const ARTICLES: Article[] = [
  {
    id: "art-1",
    tag: "IMMUNITY",
    title: "Daily Habits for Better Immunity",
    excerpt: "Evidence-based daily routines, balanced nutrition, and restorative rest patterns that strengthen immune resilience naturally.",
    slug: "/articles/daily-habits-better-immunity",
    image: "/images/articles/article-tea.jpg",
    readTime: "4 min read",
  },
  {
    id: "art-2",
    tag: "NUTRITION",
    title: "Understanding Vitamins & Supplements",
    excerpt: "A practical guide to essential micronutrients, clinical absorption factors, and how to choose the right daily supplements.",
    slug: "/articles/understanding-vitamins-supplements",
    image: "/images/articles/article-vitamins.jpg",
    readTime: "5 min read",
  },
  {
    id: "art-3",
    tag: "FIRST AID",
    title: "Building Your Home Medicine Kit",
    excerpt: "Essential over-the-counter supplies, wound care dressings, and emergency fever relievers every family household should stock.",
    slug: "/articles/building-home-medicine-kit",
    image: "/images/articles/article-cabinet.jpg",
    readTime: "3 min read",
  },
  {
    id: "art-4",
    tag: "PHARMACIST FAQ",
    title: "Common Health Questions Answered",
    excerpt: "Licensed pharmacists address real questions on generic alternatives, drug expiry dates, and safe temperature storage.",
    slug: "/articles/common-health-questions-answered",
    image: "/images/articles/article-faq.jpg",
    readTime: "6 min read",
  },
];

export const HealthArticles: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#559620] text-xs font-bold uppercase tracking-wider mb-2 w-fit">
              <BookOpen className="w-3.5 h-3.5" />
              <span>HEALTHCARE EDITORIAL</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#14304A] tracking-tight">
              Health &amp; Wellness Insights
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6D5E] mt-1.5">
              Curated medical advice, pharmacist guides, and daily preventative wellness habits.
            </p>
          </div>

          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#1853A8] hover:text-[#123e7f] transition-colors self-end sm:self-auto"
          >
            <span>View All Insights</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Editorial Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="group flex flex-col justify-between rounded-2xl border border-[#E5EFE3] bg-[#FAFCFA] overflow-hidden transition-all duration-200 hover:bg-white hover:border-[#559620]/40 hover:shadow-md"
            >
              <div>
                {/* Clean Image Banner */}
                <div className="relative w-full aspect-[16/10] bg-[#F4F8F3] overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider bg-white/95 backdrop-blur-xs text-[#559620] shadow-2xs uppercase">
                      {article.tag}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <span className="text-[11px] text-[#788C7A] font-medium block mb-1">
                    {article.readTime}
                  </span>

                  <Link href={article.slug} className="block group-hover:text-[#1853A8] transition-colors">
                    <h3 className="text-sm sm:text-base font-bold text-[#14304A] leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="mt-2 text-xs text-[#5D7060] leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              {/* Read More CTA */}
              <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-[#EBF3E8] flex items-center justify-between">
                <Link
                  href={article.slug}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1853A8] group-hover:text-[#123e7f] group-hover:translate-x-0.5 transition-all"
                >
                  <span>Read More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
};
