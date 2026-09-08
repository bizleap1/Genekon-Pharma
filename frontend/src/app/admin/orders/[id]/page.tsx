"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Download,
  ShieldCheck,
  XCircle,
  FileCheck
} from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ADMIN_ORDERS, AdminOrder } from "@/data/adminData";

import { OrderStatus } from "@/types/order";

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const baseOrder =
    ADMIN_ORDERS.find((o) => o.id.toLowerCase() === orderId.toLowerCase()) ||
    ADMIN_ORDERS[0];

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(baseOrder.orderStatus);
  const [successMsg, setSuccessMsg] = useState("");

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    setSuccessMsg(`Order status successfully updated to "${newStatus}".`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const timelineSteps = [
    { label: "Placed", desc: "Logged & Payment Received" },
    { label: "Confirmed", desc: "Pharmacist Verified" },
    { label: "Packed", desc: "Sealed Cold-Chain" },
    { label: "Shipped", desc: "Handed to Courier" },
    { label: "Delivered", desc: "Delivered to Doorstep" },
  ];

  const getStepIndex = (status: string) => {
    switch (status.toLowerCase()) {
      case "placed": return 0;
      case "confirmed": return 1;
      case "processing": return 1;
      case "packed": return 2;
      case "shipped": return 3;
      case "delivered": return 4;
      default: return 0;
    }
  };

  const activeIdx = getStepIndex(currentStatus);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2EAE0]">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#559620] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders Queue</span>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-bold text-[#14304A]">
              Order #{baseOrder.id}
            </h2>
            <StatusBadge status={currentStatus} />
          </div>
          <p className="text-xs text-[#637766] mt-0.5">
            Placed on {baseOrder.orderDate} &bull; Payment: {baseOrder.paymentMethod}
          </p>
        </div>

        {/* Status Actions Dropdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          <select
            value={currentStatus}
            onChange={(e) => handleStatusUpdate(e.target.value as OrderStatus)}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-[#559620] bg-white text-[#14304A] outline-none cursor-pointer shadow-2xs"
          >
            <option value="Placed">Set Status: Placed</option>
            <option value="Confirmed">Set Status: Confirmed (Rx Verified)</option>
            <option value="Packed">Set Status: Packed</option>
            <option value="Shipped">Set Status: Shipped</option>
            <option value="Delivered">Set Status: Delivered</option>
          </select>

          <button
            type="button"
            onClick={() => handleStatusUpdate("Cancelled")}
            className="px-3.5 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer transition-colors"
          >
            Cancel Order
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#EDF7E9] border border-[#CDE5C8] text-[#447719] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#559620]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 5-Step Order Timeline */}
      <div className="rounded-2xl border border-[#E2EAE0] bg-white p-6 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#14304A] mb-5">
          Fulfillment Stepper Progression
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {timelineSteps.map((step, idx) => {
            const isCompleted = idx <= activeIdx;
            const isCurrent = idx === activeIdx;

            return (
              <div
                key={step.label}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? "border-[#559620] bg-[#F4F9F2] ring-1 ring-[#559620]/20"
                    : isCompleted
                    ? "border-[#DCE8D8] bg-white"
                    : "border-[#EDF3EC] bg-[#FAFCFA] opacity-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                      isCompleted ? "bg-[#559620] text-white" : "bg-[#CCDCCD] text-[#14304A]"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </span>
                  <span className="text-xs font-bold text-[#14304A]">
                    {step.label}
                  </span>
                </div>
                <p className="text-[11px] text-[#697D6B]">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer & Address Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="rounded-2xl border border-[#E2EAE0] bg-white p-6 shadow-2xs space-y-3">
          <h3 className="font-serif text-base font-bold text-[#14304A] pb-3 border-b border-[#EDF3EC]">
            Customer Details
          </h3>
          <div className="space-y-2 text-xs">
            <p className="font-bold text-[#14304A] text-sm">{baseOrder.customerName}</p>
            <p className="text-[#5F7361] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#559620]" />
              <span>+91 {baseOrder.customerPhone}</span>
            </p>
            <p className="text-[#5F7361] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#1853A8]" />
              <span>{baseOrder.customerEmail}</span>
            </p>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="rounded-2xl border border-[#E2EAE0] bg-white p-6 shadow-2xs space-y-3">
          <h3 className="font-serif text-base font-bold text-[#14304A] pb-3 border-b border-[#EDF3EC]">
            Delivery Address
          </h3>
          <div className="text-xs text-[#526654] space-y-1">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#559620] shrink-0 mt-0.5" />
              <p className="leading-relaxed">{baseOrder.deliveryAddress}</p>
            </div>
            <p className="pt-2 text-[11px] text-[#718573]">
              Fulfillment Hub: <strong className="text-[#14304A]">Nagpur Regional Dispensary</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Itemized Medicine List */}
      <div className="rounded-2xl border border-[#E2EAE0] bg-white p-6 shadow-2xs">
        <h3 className="font-serif text-base font-bold text-[#14304A] pb-3 mb-4 border-b border-[#EDF3EC]">
          Order Items ({baseOrder.items.length})
        </h3>

        <div className="divide-y divide-[#EDF3EC]">
          {baseOrder.items.map((item, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-[#FAFCFB] border border-[#DDE7DC] p-1 shrink-0 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#14304A] text-sm">{item.name}</p>
                  <p className="text-[#657967]">{item.brand} &bull; {item.variant}</p>
                  <p className="font-mono text-[10px] text-[#559620] font-bold">
                    Batch: {item.batchNumber}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-[#14304A]">Qty: {item.quantity} &times; ₹{item.price}</p>
                <p className="font-bold text-[#14304A] text-sm sm:text-base mt-0.5">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total Price Bar */}
        <div className="mt-4 pt-4 border-t border-[#EDF3EC] flex items-center justify-between">
          <span className="text-xs text-[#697E6C]">Payment Status: <strong className="text-[#559620]">{baseOrder.paymentStatus}</strong></span>
          <div className="text-right">
            <span className="text-xs text-[#697E6C] mr-2">Grand Total:</span>
            <span className="font-serif text-xl font-bold text-[#14304A]">
              ₹{baseOrder.totalAmount}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
