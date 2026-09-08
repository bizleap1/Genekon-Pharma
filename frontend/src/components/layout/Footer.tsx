"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, ShieldCheck, Lock, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E5EFE3] bg-[#FAFCFA] text-[#14304A] pt-12 pb-8">
      <Container>
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 pb-12 border-b border-[#E5EFE3]">
          
          {/* Col 1: Brand & Socials (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-12 w-[170px]">
                <Image
                  src="/images/genekon-brand-logo.png"
                  alt="GENEKON Pharmaceuticals"
                  fill
                  sizes="170px"
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <p className="text-xs text-[#627764] leading-relaxed max-w-xs">
              Making trusted healthcare products easier to discover, verify, and order. Licensed community pharmacy &amp; institutional wholesale distributor.
            </p>

            {/* Social Icons (SVGs) */}
            <div className="flex items-center gap-2.5 pt-1 text-[#14304A]">
              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="w-7 h-7 rounded-full bg-white border border-[#DDE7DC] flex items-center justify-center hover:text-[#1853A8] hover:border-[#1853A8] transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="w-7 h-7 rounded-full bg-white border border-[#DDE7DC] flex items-center justify-center hover:text-[#E1306C] hover:border-[#E1306C] transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-7 h-7 rounded-full bg-white border border-[#DDE7DC] flex items-center justify-center hover:text-[#0077B5] hover:border-[#0077B5] transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="#"
                aria-label="YouTube"
                className="w-7 h-7 rounded-full bg-white border border-[#DDE7DC] flex items-center justify-center hover:text-[#FF0000] hover:border-[#FF0000] transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Shop (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A]">
              Shop
            </h4>
            <ul className="space-y-1.5 text-xs text-[#596E5C]">
              <li>
                <Link href="/category/medicines" className="hover:text-[#1853A8] transition-colors">
                  Medicines
                </Link>
              </li>
              <li>
                <Link href="/category/healthcare" className="hover:text-[#1853A8] transition-colors">
                  Healthcare
                </Link>
              </li>
              <li>
                <Link href="/category/personal-care" className="hover:text-[#1853A8] transition-colors">
                  Personal Care
                </Link>
              </li>
              <li>
                <Link href="/category/vitamins-nutrition" className="hover:text-[#1853A8] transition-colors">
                  Vitamins &amp; Nutrition
                </Link>
              </li>
              <li>
                <Link href="/category/baby-care" className="hover:text-[#1853A8] transition-colors">
                  Baby Care
                </Link>
              </li>
              <li>
                <Link href="/category/ayurveda" className="hover:text-[#1853A8] transition-colors">
                  Ayurveda
                </Link>
              </li>
              <li>
                <Link href="/category/medical-devices" className="hover:text-[#1853A8] transition-colors">
                  Medical Devices
                </Link>
              </li>
              <li>
                <Link href="/category/wellness" className="hover:text-[#1853A8] transition-colors">
                  Wellness
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-[#559620] font-bold hover:underline transition-all">
                  Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Help (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A]">
              Help
            </h4>
            <ul className="space-y-1.5 text-xs text-[#596E5C]">
              <li>
                <Link href="/contact" className="hover:text-[#1853A8] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-[#1853A8] transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#1853A8] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#1853A8] transition-colors">
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#1853A8] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/prescription/guidelines" className="hover:text-[#1853A8] transition-colors">
                  Prescription Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A]">
              Company
            </h4>
            <ul className="space-y-1.5 text-xs text-[#596E5C]">
              <li>
                <Link href="/about" className="hover:text-[#1853A8] transition-colors">
                  About Genekon
                </Link>
              </li>
              <li>
                <Link href="/commitment" className="hover:text-[#1853A8] transition-colors">
                  Our Commitment
                </Link>
              </li>
              <li>
                <Link href="/b2b" className="hover:text-[#1853A8] transition-colors">
                  Wholesale &amp; B2B
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#1853A8] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#1853A8] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#1853A8] transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Details (Span 3) */}
          <div className="lg:col-span-3 space-y-3 text-xs text-[#596E5C]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A]">
              Contact Us
            </h4>
            
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#1853A8] shrink-0" />
              <a href="tel:9370102691" className="font-bold text-[#14304A] hover:text-[#1853A8] transition-colors">
                9370102691
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#1853A8] shrink-0" />
              <a href="mailto:support@genekon.com" className="hover:text-[#1853A8] transition-colors">
                support@genekon.com
              </a>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <MapPin className="w-4 h-4 text-[#1853A8] shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Gittikhadan, Katol Road, <br />
                Nagpur, Maharashtra
              </span>
            </div>
          </div>

        </div>

        {/* Middle Trust & Security Strip */}
        <div className="py-6 border-b border-[#E5EFE3] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#596E5C]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EDF7E9] text-[#559620] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span>100% Genuine Certified Medicines</span>
          </div>

          <div className="flex items-center gap-2.5 sm:justify-center">
            <div className="w-7 h-7 rounded-lg bg-[#EBF3FC] text-[#1853A8] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>

          <div className="flex items-center gap-2.5 sm:justify-end">
            <div className="w-7 h-7 rounded-lg bg-[#EDF7E9] text-[#559620] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span>Temperature-Monitored Dispatch</span>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Statutory Note */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6A7E6C]">
          <p>© 2026 Genekon Pharmaceuticals Pvt. Ltd. All rights reserved.</p>
          <p className="font-bold text-[#1853A8] tracking-wide">
            Trusted medicines. Stronger lives.
          </p>
        </div>
      </Container>
    </footer>
  );
};
