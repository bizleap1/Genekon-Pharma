"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { MOCK_ORDERS } from "@/data/customer";
import { useAuthStore } from "@/stores/authStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useCart } from "@/context/CartContext";

export default function MyOrdersPage() {
  const { isLoggedIn, openLoginModal } = useAuthStore();
  const { requireAuth } = useAuthGuard();
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState<"all" | "in-transit" | "delivered">("all");
  const [reorderedId, setReorderedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      openLoginModal(
        {
          type: "TRACK_ORDER",
          title: "My Orders",
          redirectUrl: "/account/orders",
        },
        "Login required to view your orders"
      );
    }
  }, [isLoggedIn, openLoginModal]);

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    if (activeFilter === "in-transit") return order.deliveryStatus === "Shipped" || order.deliveryStatus === "Confirmed";
    if (activeFilter === "delivered") return order.deliveryStatus === "Delivered";
    return true;
  });

  const handleReorder = (order: any) => {
    requireAuth(
      () => {
        order.items?.forEach((item: any) => {
          addToCart(
            {
              id: item.id,
              name: item.name,
              brand: item.brand || "Genekon",
              price: item.price,
              images: [item.image],
              image: item.image,
              stockQuantity: 50,
              inStock: true,
            } as any,
            item.quantity || 1,
            item.variant
          );
        });
        setReorderedId(order.id);
        setTimeout(() => setReorderedId(null), 2500);
      },
      {
        type: "REORDER",
        payload: { orderId: order.id, items: order.items },
        redirectUrl: "/cart",
      },
      "Login required to reorder medicines"
    );
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
            <Link href="/account" className="hover:text-[#14304A] transition-colors">
              My Account
            </Link>
            <span>&gt;</span>
            <span className="text-[#14304A] font-semibold">My Orders</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar */}
            <AccountSidebar />

            {/* Main Content */}
            <div className="flex-1 w-full space-y-6">
              
              {/* Header & Filter Tabs */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E3EDE1] gap-3">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] font-bold">
                      Order History
                    </h1>
                    <p className="text-xs sm:text-sm text-[#617564] mt-0.5">
                      View past prescription fulfillments, track dispatches, and reorder regular medications.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-[#F2F7F1] p-1 rounded-xl">
                    {[
                      { id: "all", label: `All (${MOCK_ORDERS.length})` },
                      { id: "in-transit", label: "In Transit" },
                      { id: "delivered", label: "Delivered" },
                    ].map((tab) => {
                      const isActive = activeFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveFilter(tab.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#559620] text-white shadow-2xs"
                              : "text-[#14304A] hover:text-[#559620]"
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Orders List */}
                <div className="mt-6 space-y-5">
                  {filteredOrders.map((order) => {
                    const isDelivered = order.deliveryStatus === "Delivered";
                    const isReordered = reorderedId === order.id;

                    return (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-[#E3EDE1] bg-white p-5 sm:p-6 shadow-2xs hover:border-[#559620]/40 transition-all"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAF2E8]">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-sm font-extrabold text-[#14304A]">
                                {order.id}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                  isDelivered
                                    ? "bg-[#EDF7E9] text-[#447719]"
                                    : "bg-[#EBF3FC] text-[#1853A8]"
                                }`}
                              >
                                {isDelivered ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#559620]" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#1853A8] animate-pulse" />
                                )}
                                {order.deliveryStatus}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B806E] mt-1">
                              Placed on <span className="font-semibold text-[#14304A]">{order.date}</span> &bull; Payment: {order.paymentMethod}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-xs text-[#718573] block">Order Total</span>
                            <span className="font-extrabold text-base sm:text-lg text-[#14304A]">
                              ₹{order.totalAmount}
                            </span>
                          </div>
                        </div>

                        {/* Items in Order */}
                        <div className="py-4 space-y-3 border-b border-[#EAF2E8]">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-4 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-xl bg-[#FAFCFB] border border-[#DDE7DC] p-1.5 shrink-0 overflow-hidden">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="48px"
                                    className="object-contain"
                                  />
                                </div>
                                <div>
                                  <Link
                                    href={`/product/${item.id}`}
                                    className="font-bold text-[#14304A] hover:text-[#1853A8] transition-colors line-clamp-1"
                                  >
                                    {item.name}
                                  </Link>
                                  <p className="text-[11px] text-[#718573]">
                                    {item.variant} &bull; Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>

                              <span className="font-bold text-[#14304A] shrink-0">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Actions */}
                        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-xs text-[#596E5B]">
                            {isDelivered ? (
                              <span>Delivered on {order.deliveredDate}</span>
                            ) : (
                              <span className="font-semibold text-[#1853A8]">
                                Expected: {order.estimatedDelivery}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/account/orders/${order.id}`}
                              className="px-3.5 py-1.5 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-colors"
                            >
                              View Order Details
                            </Link>

                            <Link
                              href="/track-order"
                              className="px-3.5 py-1.5 rounded-xl bg-[#14304A] hover:bg-[#10273F] text-white text-xs font-bold transition-colors"
                            >
                              Track Order
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleReorder(order)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isReordered
                                  ? "bg-[#559620] text-white"
                                  : "bg-[#EDF7E9] text-[#447719] hover:bg-[#DCF0D6]"
                              }`}
                            >
                              {isReordered ? "Added to Cart!" : "Reorder"}
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
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
