"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { useAuthStore } from "@/stores/authStore";

interface TrackOrderItem {
  name: string;
  qty: number;
  price: number;
  image: string;
}

interface TrackOrderTimelineItem {
  step: number;
  title: string;
  subtitle: string;
  time: string;
  completed: boolean;
}

interface TrackOrderRecord {
  orderId: string;
  status: string;
  currentStep: number;
  estimatedDelivery: string;
  courier: string;
  awbNumber: string;
  deliveryAddress: string;
  recipient: string;
  items: TrackOrderItem[];
  timeline: TrackOrderTimelineItem[];
}

const SAMPLE_ORDERS: Record<string, TrackOrderRecord> = {
  "GNK-89241": {
    orderId: "GNK-89241",
    status: "Shipped",
    currentStep: 4, // 1: Placed, 2: Confirmed, 3: Packed, 4: Shipped, 5: Delivered
    estimatedDelivery: "Tomorrow, by 4:00 PM",
    courier: "Genekon Express Delivery",
    awbNumber: "GNK-EXP-90214",
    deliveryAddress: "Gittikhadan, Katol Road, Nagpur, Maharashtra - 440013",
    recipient: "Prerna Sharma (+91 9370102691)",
    items: [
      {
        name: "Cetaphil Gentle Skin Cleanser (500 ml)",
        qty: 1,
        price: 475,
        image: "/images/products/cetaphil-cleanser-v2.jpg",
      },
      {
        name: "Paracetamol 500 mg (10 Tablets)",
        qty: 2,
        price: 64,
        image: "/images/products/cipla-paracetamol-v2.jpg",
      },
    ],
    timeline: [
      {
        step: 1,
        title: "Order Placed",
        subtitle: "Order placed on Genekon Pharmacy Portal",
        time: "Yesterday, 10:14 AM",
        completed: true,
      },
      {
        step: 2,
        title: "Pharmacist Verified & Confirmed",
        subtitle: "Verified by Clinical Pharmacist Dr. Shreya Meshram (Reg: MH-68214)",
        time: "Yesterday, 11:30 AM",
        completed: true,
      },
      {
        step: 3,
        title: "Packed in Temperature-Controlled Box",
        subtitle: "Dispatched from Central Hub, Gittikhadan, Nagpur",
        time: "Yesterday, 3:45 PM",
        completed: true,
      },
      {
        step: 4,
        title: "Out for Delivery / In Transit",
        subtitle: "Assigned to delivery executive Rahul Verma (+91 9822334455)",
        time: "Today, 9:20 AM",
        completed: true,
      },
      {
        step: 5,
        title: "Delivered",
        subtitle: "Package delivered to your doorstep",
        time: "Expected Tomorrow, 4:00 PM",
        completed: false,
      },
    ],
  },
};

export default function TrackOrderPage() {
  const { isLoggedIn, openLoginModal } = useAuthStore();
  const [orderIdInput, setOrderIdInput] = useState("GNK-89241");
  const [mobileInput, setMobileInput] = useState("9370102691");
  const [trackedOrder, setTrackedOrder] = useState<TrackOrderRecord | null>(SAMPLE_ORDERS["GNK-89241"]);
  const [hasSearched, setHasSearched] = useState(true);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openLoginModal(
        {
          type: "TRACK_ORDER",
          title: "Track Order",
          payload: { orderId: orderIdInput.trim() },
          redirectUrl: "/track-order",
        },
        "Login required to track order status"
      );
      return;
    }

    setHasSearched(true);
    if (orderIdInput.trim().toUpperCase() === "GNK-89241") {
      setTrackedOrder(SAMPLE_ORDERS["GNK-89241"]);
    } else {
      // Generate synthetic tracked order for test inputs
      setTrackedOrder({
        orderId: orderIdInput.trim().toUpperCase(),
        status: "Packed",
        currentStep: 3,
        estimatedDelivery: "In 2 business days",
        courier: "BlueDart Express Pharmacy Service",
        awbNumber: "BD-88402-GEN",
        deliveryAddress: "Customer Address, Nagpur, Maharashtra",
        recipient: `Customer (${mobileInput || "+91 9370102691"})`,
        items: [
          {
            name: "HealthKart Multivitamin Tablets (60 Tablets)",
            qty: 1,
            price: 599,
            image: "/images/products/healthkart-multivitamin-v2.jpg",
          },
        ],
        timeline: [
          {
            step: 1,
            title: "Order Placed",
            subtitle: "Payment received & order logged",
            time: "Today, 08:30 AM",
            completed: true,
          },
          {
            step: 2,
            title: "Confirmed",
            subtitle: "Pharmacist verification complete",
            time: "Today, 09:10 AM",
            completed: true,
          },
          {
            step: 3,
            title: "Packed",
            subtitle: "Package packed with batch verification",
            time: "Today, 11:45 AM",
            completed: true,
          },
          {
            step: 4,
            title: "Shipped",
            subtitle: "Dispatched to regional sorting hub",
            time: "Pending dispatch",
            completed: false,
          },
          {
            step: 5,
            title: "Delivered",
            subtitle: "Final doorstep delivery",
            time: "Expected in 2 days",
            completed: false,
          },
        ],
      });
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
            <span className="text-[#14304A] font-semibold">Track Order</span>
          </nav>

          {/* Heading */}
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7E9] text-[#447719] text-xs font-bold uppercase tracking-wider mb-2.5">
              <Truck className="w-3.5 h-3.5" />
              <span>LIVE DELIVERY STATUS</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#14304A] tracking-tight">
              Track Your Order
            </h1>
            <p className="text-xs sm:text-sm text-[#5D7160] mt-1.5">
              Enter your Genekon Order ID and registered phone number to view live dispensing and courier updates.
            </p>
          </div>

          {/* Search Card */}
          <div className="max-w-2xl mx-auto rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-2xs mb-10">
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#14304A] mb-1">
                    Order ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    placeholder="e.g. GNK-89241"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] uppercase font-mono font-bold focus:border-[#559620] focus:bg-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14304A] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#D0DED1] bg-[#FAFCFB] text-[#14304A] font-semibold focus:border-[#559620] focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-[#718573]">
                  Try sample order:{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setOrderIdInput("GNK-89241");
                      setMobileInput("9370102691");
                    }}
                    className="text-[#559620] font-bold hover:underline cursor-pointer"
                  >
                    GNK-89241
                  </button>
                </p>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                >
                  Track Order &rarr;
                </button>
              </div>
            </form>
          </div>

          {/* Tracked Results Display */}
          {hasSearched && trackedOrder && (
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Top Banner Status */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-[#F0F5F2] text-[#14304A]">
                      {trackedOrder.orderId}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#EDF7E9] text-[#447719]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#559620] animate-pulse" />
                      Status: {trackedOrder.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#14304A] mt-2">
                    Estimated Delivery: {trackedOrder.estimatedDelivery}
                  </h3>
                  <p className="text-xs text-[#637766] mt-0.5">
                    Courier: {trackedOrder.courier} (AWB: {trackedOrder.awbNumber})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/917666168147?text=Hello%20Genekon,%20I%20am%20inquiring%20about%20order%20${trackedOrder.orderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <WhatsAppIcon size={16} variant="monochrome" className="text-white" />
                    <span>Need Help on WhatsApp (+91 7666168147)</span>
                  </a>
                </div>
              </div>

              {/* 5-Step Timeline Card */}
              <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-10 shadow-2xs">
                <h3 className="font-serif text-xl font-bold text-[#14304A] mb-8">
                  Order Progression
                </h3>

                {/* Timeline Visual */}
                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[17px] sm:before:left-[21px] before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E3EDE1]">
                  {trackedOrder.timeline.map((item: TrackOrderTimelineItem) => {
                    const isCompleted = item.completed;
                    const isCurrent = item.step === trackedOrder.currentStep;

                    return (
                      <div key={item.step} className="relative flex items-start gap-4">
                        {/* Status Icon Indicator */}
                        <div
                          className={`absolute -left-[24px] sm:-left-[28px] w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold z-10 transition-all ${
                            isCompleted
                              ? "bg-[#559620] text-white ring-4 ring-[#EDF7E9]"
                              : isCurrent
                              ? "bg-[#1853A8] text-white ring-4 ring-[#EBF3FC]"
                              : "bg-[#E3EDE1] text-[#718573]"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            item.step
                          )}
                        </div>

                        {/* Text Details */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4
                              className={`text-sm font-bold ${
                                isCompleted || isCurrent
                                  ? "text-[#14304A]"
                                  : "text-[#829685]"
                              }`}
                            >
                              {item.title}
                            </h4>
                            <span className="text-[11px] font-semibold text-[#829685]">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-xs text-[#5D7360] mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Package & Address Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Details */}
                <div className="rounded-2xl border border-[#DCE8D8] bg-white p-6 shadow-2xs">
                  <div className="flex items-center gap-2.5 mb-3 text-[#14304A]">
                    <MapPin className="w-4 h-4 text-[#559620]" />
                    <h4 className="font-serif text-base font-bold">
                      Delivery Address
                    </h4>
                  </div>
                  <p className="text-xs font-bold text-[#14304A]">
                    {trackedOrder.recipient}
                  </p>
                  <p className="text-xs text-[#637766] mt-1 leading-relaxed">
                    {trackedOrder.deliveryAddress}
                  </p>
                </div>

                {/* Items in Package */}
                <div className="rounded-2xl border border-[#DCE8D8] bg-white p-6 shadow-2xs">
                  <div className="flex items-center gap-2.5 mb-3 text-[#14304A]">
                    <Package className="w-4 h-4 text-[#559620]" />
                    <h4 className="font-serif text-base font-bold">
                      Package Items ({trackedOrder.items.length})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {trackedOrder.items.map((item: TrackOrderItem, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-[#E3EDE1] bg-[#FAFCFA] p-1 shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="36px"
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-[#14304A] line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-[#718573]">
                              Qty: {item.qty}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-[#14304A]">
                          ₹{item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </Container>
      </main>

      <Footer />
    </div>
  );
}
