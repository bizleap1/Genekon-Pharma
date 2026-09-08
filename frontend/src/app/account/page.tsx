"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  FileText,
  MapPin,
  Heart,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Truck,
  Sparkles,
  ExternalLink,
  Plus
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { ProductCard } from "@/components/ui/ProductCard";
import {
  MOCK_CUSTOMER,
  MOCK_ORDERS,
  MOCK_PRESCRIPTIONS,
  MOCK_ADDRESSES
} from "@/data/customer";
import { ALL_PRODUCTS } from "@/data/products";
import { useAuthStore } from "@/stores/authStore";

export default function AccountDashboardPage() {
  const { isLoggedIn, openLoginModal } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      openLoginModal(
        {
          type: "REDIRECT",
          title: "My Account",
          redirectUrl: "/account",
        },
        "Login required to access your account dashboard"
      );
    }
  }, [isLoggedIn, openLoginModal]);

  const latestOrder = MOCK_ORDERS[0];
  const activePrescription = MOCK_PRESCRIPTIONS[0];
  const defaultAddress = MOCK_ADDRESSES.find((a) => a.isDefault) || MOCK_ADDRESSES[0];
  const reorderProducts = ALL_PRODUCTS.slice(0, 4);

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
            <span className="text-[#14304A] font-semibold">My Account</span>
          </nav>

          {/* Account Two-Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Reusable Sidebar */}
            <AccountSidebar />

            {/* Right Main Content */}
            <div className="flex-1 w-full space-y-8">
              
              {/* Welcome Card */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-linear-to-r from-[#EDF7E9] via-white to-[#F6FAF4] p-6 sm:p-8 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#447719] bg-[#EDF7E9] px-2.5 py-1 rounded-full">
                      PATIENT ACCOUNT DASHBOARD
                    </span>
                    <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] font-bold mt-2">
                      Hello, {MOCK_CUSTOMER.name} 👋
                    </h1>
                    <p className="text-xs sm:text-sm text-[#5C715E] mt-1">
                      Manage your active prescriptions, track current dispatches, and reorder regular healthcare essentials.
                    </p>
                  </div>

                  <Link
                    href="/prescription/upload"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload New Prescription</span>
                  </Link>
                </div>

                {/* Quick Metric Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-[#E3EDE1]">
                  <div className="rounded-2xl bg-white border border-[#E3EDE1] p-3.5 text-center shadow-2xs">
                    <p className="font-serif text-2xl font-bold text-[#14304A]">
                      {MOCK_ORDERS.length}
                    </p>
                    <p className="text-[11px] text-[#697D6B] font-semibold mt-0.5">
                      Total Orders
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-[#E3EDE1] p-3.5 text-center shadow-2xs">
                    <p className="font-serif text-2xl font-bold text-[#559620]">
                      {MOCK_PRESCRIPTIONS.length}
                    </p>
                    <p className="text-[11px] text-[#697D6B] font-semibold mt-0.5">
                      Active Prescriptions
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-[#E3EDE1] p-3.5 text-center shadow-2xs">
                    <p className="font-serif text-2xl font-bold text-[#1853A8]">
                      {MOCK_ADDRESSES.length}
                    </p>
                    <p className="text-[11px] text-[#697D6B] font-semibold mt-0.5">
                      Saved Addresses
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-[#E3EDE1] p-3.5 text-center shadow-2xs">
                    <p className="font-serif text-2xl font-bold text-[#D97706]">
                      ₹422
                    </p>
                    <p className="text-[11px] text-[#697D6B] font-semibold mt-0.5">
                      Lifetime Savings
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Orders Section */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-2xs">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E3EDE1]">
                  <div className="flex items-center gap-2.5">
                    <Package className="w-5 h-5 text-[#559620]" />
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#14304A]">
                      Recent Order
                    </h2>
                  </div>
                  <Link
                    href="/account/orders"
                    className="text-xs font-bold text-[#559620] hover:underline flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {latestOrder && (
                  <div className="rounded-2xl border border-[#E3EDE1] bg-[#FAFCFA] p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8F0E6]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-[#14304A]">
                            {latestOrder.id}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#EDF7E9] text-[#447719]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#559620] animate-pulse" />
                            {latestOrder.deliveryStatus}
                          </span>
                        </div>
                        <p className="text-xs text-[#637766] mt-0.5">
                          Ordered on {latestOrder.date} | {latestOrder.items.length} items
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/account/orders/${latestOrder.id}`}
                          className="px-3.5 py-1.5 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-colors"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/track-order`}
                          className="px-3.5 py-1.5 rounded-xl bg-[#14304A] hover:bg-[#10273F] text-white text-xs font-bold transition-colors"
                        >
                          Track Package &rarr;
                        </Link>
                      </div>
                    </div>

                    {/* Order Thumbnails */}
                    <div className="pt-4 flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3 overflow-x-auto">
                        {latestOrder.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="relative w-12 h-12 rounded-xl bg-white border border-[#DDE7DC] p-1 shrink-0 overflow-hidden"
                            title={item.name}
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className="object-contain"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-[#697D6B] block">Total Amount</span>
                        <span className="font-extrabold text-sm sm:text-base text-[#14304A]">
                          ₹{latestOrder.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dual Grid: Prescriptions & Saved Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active Prescription Summary */}
                <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3EDE1]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#559620]" />
                        <h3 className="font-serif text-base font-bold text-[#14304A]">
                          Prescription History
                        </h3>
                      </div>
                      <Link
                        href="/account/prescriptions"
                        className="text-xs font-bold text-[#559620] hover:underline"
                      >
                        All Prescriptions
                      </Link>
                    </div>

                    {activePrescription && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#14304A]">
                            {activePrescription.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activePrescription.statusColor}`}>
                            {activePrescription.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#14304A]">
                          {activePrescription.doctorName}
                        </p>
                        <p className="text-[11px] text-[#637766]">
                          {activePrescription.clinicName}
                        </p>
                        <p className="text-[11px] text-[#637766]">
                          Uploaded on {activePrescription.uploadDate} &bull; Valid till {activePrescription.validUntil}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#EAF2E8]">
                    <Link
                      href="/prescription/upload"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#559620] hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Doctor Note / Rx</span>
                    </Link>
                  </div>
                </div>

                {/* Default Address Summary */}
                <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E3EDE1]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#559620]" />
                        <h3 className="font-serif text-base font-bold text-[#14304A]">
                          Default Delivery Address
                        </h3>
                      </div>
                      <Link
                        href="/account/addresses"
                        className="text-xs font-bold text-[#559620] hover:underline"
                      >
                        Manage
                      </Link>
                    </div>

                    {defaultAddress && (
                      <div className="space-y-1.5 text-xs text-[#4B5E4E]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#14304A]">{defaultAddress.name}</span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#F0F5F2] text-[#14304A]">
                            {defaultAddress.type}
                          </span>
                        </div>
                        <p className="leading-relaxed">
                          {defaultAddress.addressLine}, {defaultAddress.locality}
                        </p>
                        <p>
                          {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                        </p>
                        <p className="text-[#6C806E]">
                          Phone: +91 {defaultAddress.phone}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#EAF2E8]">
                    <Link
                      href="/account/addresses"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#559620] hover:underline"
                    >
                      <span>Edit or Add New Address &rarr;</span>
                    </Link>
                  </div>
                </div>

              </div>

              {/* Wishlist Items Section */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-2xs">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E3EDE1]">
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-5 h-5 text-[#559620] fill-[#559620]" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#14304A]">
                        Wishlist Items
                      </h3>
                      <p className="text-xs text-[#637766]">
                        Saved healthcare products &amp; everyday remedies ready for 1-click reordering
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/wishlist"
                    className="text-xs font-bold text-[#559620] hover:underline hidden sm:block"
                  >
                    View All Wishlist ({reorderProducts.length}) &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
                  {reorderProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>

            </div>

          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
