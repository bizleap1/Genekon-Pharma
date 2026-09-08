"use client";

import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  MapPin,
  CreditCard,
  Download,
  RotateCcw,
  ShieldCheck,
  FileText
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { MOCK_ORDERS } from "@/data/customer";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const order =
    MOCK_ORDERS.find((o) => o.id.toLowerCase() === orderId.toLowerCase()) ||
    MOCK_ORDERS[0];

  const timelineSteps = [
    { step: 1, label: "Order Placed", desc: "Logged & Payment Received", date: `${order.date}, 10:15 AM` },
    { step: 2, label: "Confirmed", desc: "Pharmacist verified batch & dosage", date: `${order.date}, 10:45 AM` },
    { step: 3, label: "Packed", desc: "Sealed in insulated box", date: `${order.date}, 04:20 PM` },
    { step: 4, label: "Shipped", desc: `Handed to ${order.courier || "Genekon Express"}`, date: order.deliveryStatus === "Shipped" || order.deliveryStatus === "Delivered" ? "Dispatched" : "Pending" },
    { step: 5, label: "Delivered", desc: "Doorstep delivery complete", date: order.deliveredDate || order.estimatedDelivery || "In Transit" },
  ];

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
            <Link href="/account" className="hover:text-[#14304A] transition-colors">
              My Account
            </Link>
            <span>&gt;</span>
            <Link href="/account/orders" className="hover:text-[#14304A] transition-colors">
              My Orders
            </Link>
            <span>&gt;</span>
            <span className="text-[#14304A] font-semibold">{order.id}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar */}
            <AccountSidebar />

            {/* Main Content */}
            <div className="flex-1 w-full space-y-6">
              
              {/* Top Banner Card */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E3EDE1] gap-4">
                  <div>
                    <Link
                      href="/account/orders"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#559620] hover:underline mb-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Orders</span>
                    </Link>
                    <div className="flex items-center gap-2.5">
                      <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] font-bold">
                        Order #{order.id}
                      </h1>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#EDF7E9] text-[#447719]">
                        {order.deliveryStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B806E] mt-1">
                      Placed on {order.date} &bull; Total: ₹{order.totalAmount}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert("Invoice downloaded successfully.")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] hover:bg-[#F0F5F1] text-xs font-bold text-[#14304A] transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#559620]" />
                      <span>Invoice (PDF)</span>
                    </button>
                    <Link
                      href="/track-order"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Live Tracking</span>
                    </Link>
                  </div>
                </div>

                {/* 5-Step Timeline Bar */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#14304A] mb-6">
                    Order Delivery Timeline
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                    {timelineSteps.map((s) => {
                      const isComplete = s.step <= order.currentStep;
                      const isCurrent = s.step === order.currentStep;

                      return (
                        <div
                          key={s.step}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isCurrent
                              ? "border-[#559620] bg-[#F2F8F0]"
                              : isComplete
                              ? "border-[#DCE8D8] bg-white"
                              : "border-[#EAF0EB] bg-[#FAFCFA] opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                isComplete
                                  ? "bg-[#559620] text-white"
                                  : "bg-[#CCDCCD] text-[#14304A]"
                              }`}
                            >
                              {isComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.step}
                            </span>
                            <span className="text-xs font-bold text-[#14304A]">
                              {s.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#697D6B] leading-tight">
                            {s.desc}
                          </p>
                          <p className="text-[10px] text-[#869988] mt-1 font-semibold">
                            {s.date}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Items in Order */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-2xs">
                <h3 className="font-serif text-lg font-bold text-[#14304A] pb-4 mb-4 border-b border-[#E3EDE1]">
                  Items Ordered ({order.items.length})
                </h3>

                <div className="divide-y divide-[#EAF2E8]">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-14 h-14 rounded-xl bg-[#FAFCFB] border border-[#DDE7DC] p-1.5 shrink-0 overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-[#14304A] text-sm sm:text-base">
                            {item.name}
                          </p>
                          <p className="text-[#697D6B] mt-0.5">
                            Brand: {item.brand} &bull; Pack: {item.variant}
                          </p>
                          <p className="text-[#697D6B]">
                            Qty: <span className="font-bold text-[#14304A]">{item.quantity}</span> &times; ₹{item.price}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm sm:text-base font-extrabold text-[#14304A]">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery, Payment & Receipt Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Shipping & Payment Details */}
                <div className="space-y-6">
                  {/* Delivery Address */}
                  <div className="rounded-2xl border border-[#DCE8D8] bg-white p-6 shadow-2xs">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-[#559620]" />
                      <h4 className="font-serif text-base font-bold text-[#14304A]">
                        Delivery Address
                      </h4>
                    </div>
                    <p className="text-xs font-bold text-[#14304A]">
                      Prerna Sharma (+91 9370102691)
                    </p>
                    <p className="text-xs text-[#637766] mt-1 leading-relaxed">
                      {order.deliveryAddress}
                    </p>
                  </div>

                  {/* Payment Mode */}
                  <div className="rounded-2xl border border-[#DCE8D8] bg-white p-6 shadow-2xs">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4 text-[#559620]" />
                      <h4 className="font-serif text-base font-bold text-[#14304A]">
                        Payment Details
                      </h4>
                    </div>
                    <div className="text-xs space-y-1 text-[#5E7361]">
                      <p>
                        Method: <span className="font-bold text-[#14304A]">{order.paymentMethod}</span>
                      </p>
                      <p>
                        Status: <span className="font-bold text-[#559620]">{order.paymentStatus}</span>
                      </p>
                      <p className="font-mono text-[11px] text-[#718573] pt-1">
                        Ref: GNK-TXN-2026-99214A
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Receipt Breakdown */}
                <div className="rounded-2xl border border-[#DCE8D8] bg-white p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#14304A] pb-3 mb-3 border-b border-[#EAF2E8]">
                      Order Price Summary
                    </h4>

                    <div className="space-y-2.5 text-xs text-[#526654]">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="font-semibold text-[#14304A]">
                          ₹{order.priceBreakdown.subtotal}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#559620]">
                        <span>Discounts &amp; Offers</span>
                        <span className="font-semibold">
                          - ₹{order.priceBreakdown.discount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charges</span>
                        <span className="font-semibold text-[#14304A]">
                          {order.priceBreakdown.deliveryFee === 0 ? "FREE" : `₹${order.priceBreakdown.deliveryFee}`}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-[#EAF2E8] flex justify-between text-sm sm:text-base font-extrabold text-[#14304A]">
                        <span>Total Paid</span>
                        <span>₹{order.priceBreakdown.total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#EAF2E8] flex items-center justify-between">
                    <span className="text-[11px] text-[#697D6B] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#559620]" />
                      Inclusive of all GST taxes
                    </span>
                    <Link
                      href="/cart"
                      className="px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Reorder Items
                    </Link>
                  </div>
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
