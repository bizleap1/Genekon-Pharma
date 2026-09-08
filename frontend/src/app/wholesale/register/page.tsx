"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Lock,
  BadgeCheck
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export default function WholesaleRegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    businessType: "Retail Pharmacy / Chemist",
    gstNumber: "",
    drugLicense: "",
    phone: "",
    email: "",
    address: "",
    city: "Nagpur",
    pincode: "",
    monthlyVolume: "₹50,000 - ₹2,00,000",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            <Link href="/wholesale" className="hover:text-[#14304A] transition-colors">
              Wholesale
            </Link>
            <span>&gt;</span>
            <span className="text-[#14304A] font-semibold">Partner Registration</span>
          </nav>

          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-xs font-bold uppercase tracking-wider mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>B2B PARTNER ONBOARDING</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#14304A] tracking-tight">
              Register as a Wholesale Partner
            </h1>
            <p className="text-xs sm:text-sm text-[#5D7160] mt-2 leading-relaxed">
              Join hundreds of medical stores, clinics, and hospitals that rely on Genekon for authentic pharmaceutical supply, transparent wholesale margins, and reliable delivery.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {submitted ? (
              <div className="rounded-3xl border border-[#CDE5C8] bg-white p-8 sm:p-12 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EDF7E9] text-[#559620] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14304A]">
                  Registration Submitted Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-[#576D59] max-w-lg mx-auto leading-relaxed">
                  Thank you for applying, <span className="font-bold text-[#14304A]">{formData.ownerName}</span> ({formData.businessName}). Our institutional compliance officer will verify your GST and Drug License details and activate your wholesale account within 24 hours.
                </p>

                <div className="p-4 rounded-2xl bg-[#FAFCFA] border border-[#E3EDE1] max-w-md mx-auto text-left text-xs space-y-1.5 mt-4">
                  <p className="text-[#657967]">
                    Registered Phone: <span className="font-bold text-[#14304A]">{formData.phone}</span>
                  </p>
                  <p className="text-[#657967]">
                    Business Type: <span className="font-bold text-[#14304A]">{formData.businessType}</span>
                  </p>
                  <p className="text-[#657967]">
                    Verification Reference: <span className="font-mono font-bold text-[#559620]">GNK-B2B-APP-7729</span>
                  </p>
                </div>

                <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/wholesale"
                    className="px-5 py-2.5 rounded-xl bg-[#14304A] hover:bg-[#10273F] text-white text-xs font-bold transition-all"
                  >
                    &larr; Back to Wholesale Info
                  </Link>
                  <a
                    href="https://wa.me/919370102691?text=Hello%20Genekon,%20I%20just%20submitted%20my%20B2B%20registration%20application"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all"
                  >
                    Speed up via WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-10 shadow-2xs space-y-8"
              >
                
                {/* Section 1: Business Identity */}
                <div>
                  <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#E3EDE1]">
                    <Building2 className="w-4 h-4 text-[#559620]" />
                    <h3 className="font-serif text-lg font-bold text-[#14304A]">
                      1. Business Identification
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        Business / Entity Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="e.g. LifeCare Medicos"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        Business Type *
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all font-semibold"
                      >
                        <option value="Retail Pharmacy / Chemist">Retail Pharmacy / Chemist</option>
                        <option value="Clinic / Polyclinic">Clinic / Polyclinic</option>
                        <option value="Hospital / Nursing Home">Hospital / Nursing Home</option>
                        <option value="Corporate Health Centre">Corporate Health Centre</option>
                        <option value="Regional Distributor">Regional Distributor</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact Person */}
                <div>
                  <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#E3EDE1]">
                    <BadgeCheck className="w-4 h-4 text-[#559620]" />
                    <h3 className="font-serif text-lg font-bold text-[#14304A]">
                      2. Authorized Contact Person
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        Owner / Manager Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="10-digit mobile"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@business.com"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Regulatory Credentials */}
                <div>
                  <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#E3EDE1]">
                    <FileCheck className="w-4 h-4 text-[#559620]" />
                    <h3 className="font-serif text-lg font-bold text-[#14304A]">
                      3. Regulatory &amp; Tax Credentials
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        GST Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                        placeholder="15-character GSTIN (e.g. 27AAAAA0000A1Z5)"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] uppercase font-mono font-bold focus:border-[#559620] focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        Drug License Number (Form 20B/21B) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.drugLicense}
                        onChange={(e) => setFormData({ ...formData, drugLicense: e.target.value.toUpperCase() })}
                        placeholder="e.g. MH-NGP-20B-123456"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] uppercase font-mono font-bold focus:border-[#559620] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Address & Volume */}
                <div>
                  <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#E3EDE1]">
                    <MapPin className="w-4 h-4 text-[#559620]" />
                    <h3 className="font-serif text-lg font-bold text-[#14304A]">
                      4. Operating Address &amp; Volume
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Shop No., Complex, Street name"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#14304A] mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#14304A] mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          placeholder="6-digit code"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#14304A] mb-1">
                          Expected Monthly Volume
                        </label>
                        <select
                          value={formData.monthlyVolume}
                          onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all font-semibold"
                        >
                          <option value="Under ₹50,000">Under ₹50,000</option>
                          <option value="₹50,000 - ₹2,00,000">₹50,000 - ₹2,00,000</option>
                          <option value="₹2,00,000 - ₹10,00,000">₹2,00,000 - ₹10,00,000</option>
                          <option value="Above ₹10,00,000">Above ₹10,00,000</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Bar */}
                <div className="pt-4 border-t border-[#E3EDE1] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#6B806E]">
                    <Lock className="w-3.5 h-3.5 text-[#559620]" />
                    <span>Your regulatory documents are encrypted and protected</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Register as Partner &rarr;
                  </button>
                </div>

              </form>
            )}
          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
