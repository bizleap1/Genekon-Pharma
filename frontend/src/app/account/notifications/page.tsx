"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Package,
  Gift,
  HeartPulse,
  CheckCheck,
  ArrowRight,
  Clock,
  Sparkles
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { MOCK_NOTIFICATIONS, CustomerNotification } from "@/data/customer";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<CustomerNotification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "order" | "offer" | "health">("all");

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "order") return n.category === "order";
    if (filter === "offer") return n.category === "offer";
    if (filter === "health") return n.category === "health";
    return true;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "order":
        return <Package className="w-4 h-4 text-[#1853A8]" />;
      case "offer":
        return <Gift className="w-4 h-4 text-[#D97706]" />;
      case "health":
        return <HeartPulse className="w-4 h-4 text-[#559620]" />;
      default:
        return <Bell className="w-4 h-4 text-[#559620]" />;
    }
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
            <span className="text-[#14304A] font-semibold">Notifications</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar */}
            <AccountSidebar />

            {/* Main Content */}
            <div className="flex-1 w-full space-y-6">
              
              {/* Header */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E3EDE1] gap-4">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] font-bold">
                      Notifications &amp; Health Updates
                    </h1>
                    <p className="text-xs sm:text-sm text-[#617564] mt-0.5">
                      Stay informed about order dispatches, prescription verifications, and pharmacy offers.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={markAllRead}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#559620] hover:underline shrink-0 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all as read</span>
                  </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-[#F2F7F1] p-1 rounded-xl w-fit mb-6 overflow-x-auto">
                  {[
                    { id: "all", label: "All Updates" },
                    { id: "order", label: "Orders & Rx" },
                    { id: "offer", label: "Offers" },
                    { id: "health", label: "Health Tips" },
                  ].map((tab) => {
                    const isActive = filter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as any)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

                {/* Notifications List */}
                <div className="space-y-3">
                  {filteredNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markSingleRead(notif.id)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                        !notif.read
                          ? "border-[#559620]/30 bg-linear-to-r from-[#F5FAF3] to-white"
                          : "border-[#EAF0EB] bg-white opacity-85"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#DDE7DC] shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                          {getCategoryIcon(notif.category)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-[#14304A]">
                              {notif.title}
                            </h4>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-[#559620]" />
                            )}
                          </div>

                          <p className="text-xs text-[#5E7361] mt-1 leading-relaxed">
                            {notif.message}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-[11px] text-[#788E7B]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {notif.timestamp}
                            </span>
                            {notif.actionUrl && (
                              <Link
                                href={notif.actionUrl}
                                className="font-bold text-[#559620] hover:underline flex items-center gap-0.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span>View Details</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
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
