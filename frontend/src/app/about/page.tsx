"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Award,
  HeartPulse,
  Users,
  Building2,
  Truck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calendar
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

const STATS = [
  { value: "100%", label: "Genuine Medicines", sub: "Direct from verified manufacturers" },
  { value: "10,000+", label: "Patients Served", sub: "Across Maharashtra and central India" },
  { value: "50+", label: "Wholesale Partners", sub: "Clinics, hospitals & retail pharmacies" },
  { value: "15 min", label: "Rx Verification", sub: "By certified registered pharmacists" },
];

const QUALITY_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Zero-Counterfeit Guarantee",
    desc: "Every medicine box, blister pack, and syrup is procured exclusively through authorized pharmaceutical channels with verifiable batch certifications.",
  },
  {
    icon: Truck,
    title: "Cold-Chain Integrity",
    desc: "Biologics, vaccines, and insulin are stored in certified climate-regulated refrigerators and delivered in insulated temperature-safe packaging.",
  },
  {
    icon: Users,
    title: "Licensed Pharmacist Review",
    desc: "Every prescription undergoes dual-stage verification by registered clinical pharmacists to prevent dosage contradictions and duplicate therapies.",
  },
  {
    icon: Award,
    title: "Regulatory Compliance",
    desc: "Fully licensed and accredited under the Drugs and Cosmetics Act with valid Form 20B/21B wholesale and retail pharmacy permits.",
  },
];

const TIMELINE = [
  {
    year: "2021",
    title: "Foundation in Nagpur",
    desc: "Genekon Pharmaceuticals was founded with a clear vision: eliminating counterfeit medicines and making authentic healthcare available to all.",
  },
  {
    year: "2023",
    title: "Wholesale Distribution Network",
    desc: "Expanded supply chain operations to serve regional hospitals, polyclinics, and neighborhood medical stores with bulk pharmaceutical inventory.",
  },
  {
    year: "2024",
    title: "Digital Prescription Platform",
    desc: "Launched our streamlined digital platform for seamless WhatsApp-based prescription reviews, doorstep delivery, and chronic reorder assistance.",
  },
  {
    year: "Today & Beyond",
    title: "Unified Healthcare Ecosystem",
    desc: "Serving thousands of retail customers and institutional partners daily with certified authenticity, fair pricing, and compassionate patient care.",
  },
];

export default function AboutPage() {
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
            <span className="text-[#14304A] font-semibold">About Genekon</span>
          </nav>

          {/* Corporate Hero */}
          <div className="relative rounded-3xl border border-[#DCE8D8] bg-linear-to-r from-[#F0F8EC] via-white to-[#F7FAF6] p-8 sm:p-14 mb-12 shadow-2xs">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#559620]/15 text-[#3E7016] text-xs font-bold uppercase tracking-wider mb-4">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>ABOUT GENEKON PHARMACEUTICALS</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl text-[#14304A] tracking-tight leading-tight">
                Making Trusted Healthcare <br />
                Accessible, Transparent &amp; Real.
              </h1>
              <p className="text-xs sm:text-base text-[#576B5A] mt-4 leading-relaxed">
                Genekon Pharmaceuticals is a premier healthcare organization dedicated to bridging the gap between authentic pharmaceutical manufacturing and everyday patients. Operating as both a community-first retail pharmacy and a trusted wholesale medical distributor, we ensure no patient or healthcare provider ever has to second-guess the quality of their medicines.
              </p>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#DDE7DC] bg-white p-6 shadow-2xs text-center"
              >
                <p className="font-serif text-3xl sm:text-4xl font-extrabold text-[#559620]">
                  {stat.value}
                </p>
                <h4 className="text-xs sm:text-sm font-bold text-[#14304A] mt-1">
                  {stat.label}
                </h4>
                <p className="text-[11px] text-[#718573] mt-0.5">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Healthcare Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="rounded-3xl border border-[#DCE8D8] bg-white p-8 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center mb-5">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-[#14304A] font-bold">
                Our Healthcare Mission
              </h3>
              <p className="text-xs sm:text-sm text-[#5C705F] mt-3 leading-relaxed">
                To empower communities with absolute confidence in their healthcare choices by providing guaranteed authentic medicines, clinically validated wellness products, and transparent wholesale pricing delivered with genuine empathy.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#14304A] font-semibold">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#559620]" />
                  100% Genuine, batch-tested medicine guarantee
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#559620]" />
                  Direct manufacturer relationships without middlemen markups
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#559620]" />
                  Dedicated support from registered pharmacists
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-[#DCE8D8] bg-white p-8 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF3FC] text-[#1853A8] flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-[#14304A] font-bold">
                Our Institutional Vision
              </h3>
              <p className="text-xs sm:text-sm text-[#5C705F] mt-3 leading-relaxed">
                To build central India’s most dependable healthcare supply backbone—serving individual households with compassionate doorstep pharmacy service, while equipping clinics and hospitals with uninterrupted, cold-chain-certified medical inventory.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#14304A] font-semibold">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1853A8]" />
                  Reliable inventory for medical stores and clinics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1853A8]" />
                  Compliant cold-chain storage infrastructure
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1853A8]" />
                  Zero compromise on ethical pharmaceutical dispensing
                </li>
              </ul>
            </div>
          </div>

          {/* Quality Commitment Pillars */}
          <div className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-xs font-bold uppercase tracking-wider mb-2.5">
                <Award className="w-3.5 h-3.5" />
                <span>PHARMACEUTICAL STANDARDS</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#14304A] tracking-tight">
                Our Quality Commitment
              </h2>
              <p className="text-xs sm:text-sm text-[#5D7160] mt-1.5">
                We believe that compromise has no place in healthcare. Every product on our shelves meets stringent clinical safety guidelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {QUALITY_PILLARS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div
                    key={i}
                    className="rounded-3xl border border-[#DDE7DC] bg-white p-6 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-base font-bold text-[#14304A]">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[#637766] mt-2 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Healthcare Journey (Timeline) */}
          <div className="mb-16 rounded-3xl border border-[#DCE8D8] bg-[#F9FCF8] p-8 sm:p-12">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#14304A] tracking-tight">
                Our Healthcare Journey
              </h2>
              <p className="text-xs sm:text-sm text-[#617664] mt-1.5">
                Milestones in our ongoing mission to build trust in Indian healthcare
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {TIMELINE.map((item, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl border border-[#DCE8D8] bg-white p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-[#14304A] text-white font-mono text-xs font-bold mb-3">
                      {item.year}
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#14304A]">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#627664] mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="rounded-3xl border border-[#DCE8D8] bg-[#14304A] text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-sm">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight max-w-xl mx-auto">
              Experience Healthcare That Puts Your Wellbeing First
            </h2>
            <p className="text-xs sm:text-sm text-[#C8D7CB] max-w-lg mx-auto mt-2 mb-6">
              Browse our verified pharmaceutical catalog or upload your doctor&apos;s prescription for fast, pharmacist-reviewed fulfillment.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/prescription/upload"
                className="px-5 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs"
              >
                Upload Prescription &rarr;
              </Link>
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
              >
                Contact Support
              </Link>
            </div>
          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
