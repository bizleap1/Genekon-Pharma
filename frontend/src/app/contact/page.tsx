"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Headphones
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Order Status",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
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
            <span className="text-[#14304A] font-semibold">Contact Us</span>
          </nav>

          {/* Page Heading */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-xs font-bold uppercase tracking-wider mb-2.5">
              <Headphones className="w-3.5 h-3.5" />
              <span>DEDICATED PHARMACY ASSISTANCE</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#14304A] tracking-tight">
              Get in Touch with Our Team
            </h1>
            <p className="text-xs sm:text-sm text-[#5C705F] mt-2">
              Have questions about prescription verification, medicine availability, or wholesale bulk supply? We are here to help.
            </p>
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            
            {/* Phone */}
            <div className="rounded-2xl border border-[#DCE8D8] bg-white p-5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A]">
                Call Pharmacy Desk
              </h4>
              <a href="tel:7666168147" className="text-sm font-extrabold text-[#14304A] hover:text-[#559620] mt-1 block">
                +91 7666168147
              </a>
              <p className="text-[11px] text-[#697C6A] mt-1">
                Toll-free medicine support
              </p>
            </div>

            {/* WhatsApp */}
            <div className="rounded-2xl border border-[#DCE8D8] bg-white p-5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mb-3">
                <WhatsAppIcon size={24} variant="monochrome" className="text-[#25D366]" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A]">
                Instant WhatsApp
              </h4>
              <a
                href="https://wa.me/917666168147?text=Hello%20Genekon,%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-extrabold text-[#25D366] hover:underline mt-1 block"
              >
                Chat on WhatsApp (+91 7666168147) &rarr;
              </a>
              <p className="text-[11px] text-[#697C6A] mt-1">
                Fastest response for Rx queries
              </p>
            </div>

            {/* Email */}
            <div className="rounded-2xl border border-[#DCE8D8] bg-white p-5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#EBF3FC] text-[#1853A8] flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A]">
                Email Us
              </h4>
              <p className="text-sm font-extrabold text-[#14304A] mt-1 truncate">
                support@genekon.com
              </p>
              <p className="text-[11px] text-[#697C6A] mt-1">
                We respond within 2-4 hours
              </p>
            </div>

            {/* Hours */}
            <div className="rounded-2xl border border-[#DCE8D8] bg-white p-5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFF6E5] text-[#D97706] flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#14304A]">
                Operating Hours
              </h4>
              <p className="text-xs font-bold text-[#14304A] mt-1">
                Mon - Sat: 9 AM - 9 PM
              </p>
              <p className="text-[11px] text-[#697C6A] mt-1">
                Sunday: 10 AM - 6 PM
              </p>
            </div>

          </div>

          {/* Form + Location Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
            
            {/* Contact Form (Span 7) */}
            <div className="lg:col-span-7 rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-2xs">
              <h3 className="font-serif text-xl sm:text-2xl text-[#14304A] font-bold mb-1">
                Send Us a Message
              </h3>
              <p className="text-xs text-[#5D7360] mb-6">
                Fill out the details below and our clinical team will get back to you promptly.
              </p>

              {formSubmitted ? (
                <div className="rounded-2xl border border-[#CDE5C8] bg-[#F2F8F0] p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#559620] text-white mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#14304A]">
                    Message Received Successfully!
                  </h4>
                  <p className="text-xs text-[#526654] max-w-md mx-auto">
                    Thank you, {formData.name}. Our pharmacist or wholesale coordinator will call or email you at {formData.phone || formData.email} shortly.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="text-xs font-bold text-[#559620] hover:underline pt-2 cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Dr. Rajesh Kumar"
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
                        placeholder="10-digit mobile number"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@gmail.com"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14304A] mb-1">
                        Inquiry Category *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all font-semibold"
                      >
                        <option value="Prescription Inquiry">Prescription Verification</option>
                        <option value="Order Status">Order Tracking &amp; Delivery</option>
                        <option value="Wholesale Supply">Wholesale / B2B Supply</option>
                        <option value="Medicine Availability">Medicine Availability Request</option>
                        <option value="General Support">Other Assistance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14304A] mb-1">
                      Message / Medicine Requirements *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please specify medicine names, dosages, or any specific questions..."
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] focus:border-[#559620] focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>

            {/* Location & Map Card (Span 5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-2xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#14304A]">
                      Central Pharmacy Hub
                    </h4>
                    <p className="text-xs text-[#637766]">
                      Distribution &amp; Retail Dispensary
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-[#435746] leading-relaxed">
                  <p className="font-bold text-[#14304A]">
                    GENEKON PHARMACEUTICALS PVT. LTD.
                  </p>
                  <p>
                    Gittikhadan, Katol Road, Nagpur, Maharashtra, 440013, India
                  </p>
                  <p className="text-[11px] text-[#6A7F6D] pt-1 border-t border-[#EAF2E8]">
                    Registered Drug License: <span className="font-bold text-[#14304A]">MH-NGP-20B-XXXX</span> | GSTIN: <span className="font-bold text-[#14304A]">27AABCG1234F1Z8</span>
                  </p>
                </div>

                {/* Stylized Visual Map Representation */}
                <div className="mt-6 rounded-2xl overflow-hidden border border-[#D5E4D2] bg-[#F2F7F0] p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center text-[#559620] mb-2">
                    <MapPin className="w-5 h-5 fill-[#559620] text-white" />
                  </div>
                  <p className="text-xs font-bold text-[#14304A]">
                    Nagpur Metro Delivery Hub
                  </p>
                  <p className="text-[11px] text-[#647966] mt-0.5">
                    Fast same-day delivery across Nagpur &amp; Vidarbha districts
                  </p>
                </div>
              </div>

              {/* Instant WhatsApp Support Widget */}
              <div className="rounded-3xl border border-[#CBE5C7] bg-linear-to-br from-[#F0F9EE] to-white p-6 shadow-2xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                    <WhatsAppIcon size={20} variant="monochrome" className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#14304A]">
                      Prefer WhatsApp?
                    </h4>
                    <p className="text-[11px] text-[#59705B]">
                      Send prescription photos or medicine queries directly
                    </p>
                  </div>
                </div>
                <a
                  href="https://wa.me/917666168147?text=Hello%20Genekon,%20I%20have%20a%20prescription%20question"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <WhatsAppIcon size={16} variant="monochrome" className="text-white" />
                  <span>Chat on WhatsApp (+91 7666168147)</span>
                </a>
              </div>
            </div>

          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
