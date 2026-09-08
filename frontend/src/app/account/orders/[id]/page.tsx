"use client";

import React, { use, useState, useEffect } from "react";
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
  FileText,
  AlertTriangle,
  AlertCircle,
  XCircle,
  X,
  HelpCircle,
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { useToast } from "@/context/ToastContext";
import { useAuthStore } from "@/stores/authStore";
import { InvoiceModal } from "@/components/invoice/InvoiceModal";
import { PlacedOrder } from "@/types/order";
import { ordersApi } from "@/api/orders";

function getOrdersFromStorage(): PlacedOrder[] {
  try {
    const raw = localStorage.getItem("genekon_placed_orders_v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const toast = useToast();
  const { user } = useAuthStore();
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [cancellationRequest, setCancellationRequest] = useState<any | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelDetails, setCancelDetails] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  useEffect(() => {
    // 1. Initial check from local storage for instant feedback
    const localOrders = getOrdersFromStorage();
    const found = localOrders.find(
      (o) => o.orderId.toLowerCase() === orderId.toLowerCase()
    );
    if (found) setOrder(found);

    // 2. Fetch authoritative order & cancellation request from backend API
    ordersApi.getOrderById(orderId)
      .then((res) => {
        if (res.data) {
          setOrder(res.data);
          if (res.data.cancellationRequest) {
            setCancellationRequest(res.data.cancellationRequest);
          }
        }
      })
      .finally(() => setLoading(false));

    ordersApi.getOrderCancellationRequest(orderId)
      .then((res) => {
        if (res.data) {
          setCancellationRequest(res.data);
        }
      })
      .catch(() => {});
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFCFA]">
        <UtilityBar />
        <Header />
        <CategoryNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-[#559620] text-sm font-medium">Loading order details...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFCFA]">
        <UtilityBar />
        <Header />
        <CategoryNav />
        <main className="flex-1 py-8 sm:py-12">
          <Container>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <AccountSidebar />
              <div className="flex-1 w-full">
                <div className="rounded-3xl border border-[#DCE8D8] bg-white p-12 shadow-2xs text-center">
                  <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">Order Not Found</h2>
                  <p className="text-sm text-[#6B806E] mb-6">Order <span className="font-bold">#{orderId}</span> could not be found in your account.</p>
                  <Link
                    href="/account/orders"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#559620] text-white text-sm font-bold hover:bg-[#467E19] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to My Orders
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  // Map PlacedOrder fields to display-friendly format
  const displayStatus = order.status || "Placed";
  const currentStep =
    displayStatus === "Delivered" ? 5 :
    displayStatus === "Shipped" ? 4 :
    displayStatus === "Packed" ? 3 :
    displayStatus === "Confirmed" ? 2 :
    displayStatus === "Placed" ? 1 : 1;

  const isCancellable = ["placed", "confirmed", "pending_verification"].includes(
    (order.status || "").toLowerCase()
  );
  const isPackedOrLater = ["packed", "shipped", "delivered"].includes(
    (order.status || "").toLowerCase()
  );
  const isCancelled = (order.status || "").toLowerCase() === "cancelled";

  const handleSubmitCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason) {
      toast.warning("Please select a reason for cancellation");
      return;
    }
    setSubmittingCancel(true);
    try {
      const res = await ordersApi.requestOrderCancellation(order.orderId, cancelReason, cancelDetails);
      if (res.success) {
        setCancellationRequest(res.data || {
          status: "PENDING",
          reason: cancelReason,
          details: cancelDetails,
          createdAt: new Date().toISOString(),
        });
        toast.success("Cancellation request submitted. Our dispensary administration will review it.");
        setIsCancelModalOpen(false);
      } else {
        toast.error(res.message || "Failed to submit cancellation request");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit cancellation request");
    } finally {
      setSubmittingCancel(false);
    }
  };

  const courierName = order.trackingNumber ? "Genekon Express Delivery" : "Genekon Local Dispatch";
  const orderDate = order.date;
  const deliveryAddress = `${order.formData.addressLine}${order.formData.landmark ? ", " + order.formData.landmark : ""}, ${order.formData.city}, ${order.formData.state} - ${order.formData.pincode}`;

  const timelineSteps = [
    { step: 1, label: "Order Placed", desc: "Logged & Payment Received", date: `${orderDate}, 10:15 AM` },
    { step: 2, label: "Confirmed", desc: "Pharmacist verified batch & dosage", date: `${orderDate}, 10:45 AM` },
    { step: 3, label: "Packed", desc: "Sealed in insulated box", date: currentStep >= 3 ? `${orderDate}, 04:20 PM` : "Pending" },
    { step: 4, label: "Shipped", desc: `Handed to ${courierName}`, date: currentStep >= 4 ? "Dispatched" : "Pending" },
    { step: 5, label: "Delivered", desc: "Doorstep delivery complete", date: displayStatus === "Delivered" ? "Completed" : order.estimatedDelivery || "In Transit" },
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
            <span className="text-[#14304A] font-semibold">{order.orderId}</span>
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
                        Order #{order.orderId}
                      </h1>
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        isCancelled
                          ? "bg-[#FEE2E2] text-[#DC2626]"
                          : "bg-[#EDF7E9] text-[#447719]"
                      }`}>
                        {displayStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B806E] mt-1">
                      Placed on {orderDate} &bull; Total: ₹{order.totals.totalAmount}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Cancellation Action or Policy Notice */}
                    {isCancellable && !isCancelled && cancellationRequest?.status !== "PENDING" && (
                      <button
                        type="button"
                        onClick={() => setIsCancelModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-xs font-bold text-[#DC2626] transition-colors cursor-pointer shadow-2xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Request Cancellation</span>
                      </button>
                    )}

                    {isPackedOrLater && !cancellationRequest && !isCancelled && (
                      <span
                        title="Cancellation is only allowed before the order is packed."
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F3F4F6] text-[11px] font-medium text-[#6B7280]"
                      >
                        <HelpCircle className="w-3 h-3 text-[#9CA3AF]" />
                        <span>Cancellation window closed</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsInvoiceOpen(true)}
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

                {/* Dynamic Cancellation Status Banner */}
                {cancellationRequest && (
                  <div className="mb-6">
                    {cancellationRequest.status === "PENDING" && (
                      <div className="p-4 rounded-2xl border border-[#FCD34D] bg-[#FFFBEB] flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#92400E]">Cancellation Review in Progress</h4>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309]">Pending Admin Review</span>
                          </div>
                          <p className="text-xs text-[#78350F] mt-1">
                            Reason stated: <span className="font-semibold">"{cancellationRequest.reason}"</span>
                            {cancellationRequest.details && ` — ${cancellationRequest.details}`}
                          </p>
                          <p className="text-[11px] text-[#92400E]/80 mt-1">
                            Our clinical dispensary administration is currently reviewing your request. If approved, order stock will be restored and any eligible refunds will be initiated automatically.
                          </p>
                        </div>
                      </div>
                    )}

                    {cancellationRequest.status === "APPROVED" && (
                      <div className="p-4 rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#065F46]">Cancellation Request Approved</h4>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#047857]">Order Cancelled</span>
                          </div>
                          <p className="text-xs text-[#065F46] mt-1">
                            {cancellationRequest.adminComment ? `Dispensary Note: "${cancellationRequest.adminComment}"` : "This order has been cancelled by dispensary administration."}
                          </p>
                          <p className="text-[11px] text-[#065F46]/80 mt-1">
                            {order.formData.paymentMethod?.toLowerCase().includes("cod")
                              ? "No payment was collected for this Cash on Delivery order."
                              : "Your refund has been initiated to your original payment method (expected within 3-5 business days)."}
                          </p>
                        </div>
                      </div>
                    )}

                    {cancellationRequest.status === "REJECTED" && (
                      <div className="p-4 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#991B1B]">Cancellation Request Declined</h4>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#B91C1C]">Declined</span>
                          </div>
                          <p className="text-xs text-[#991B1B] mt-1">
                            Dispensary comment: <span className="font-semibold">"{cancellationRequest.adminComment || "Order could not be cancelled as it is already packed/in final dispatch."}"</span>
                          </p>
                          <p className="text-[11px] text-[#991B1B]/80 mt-1">
                            Your order is progressing normally towards doorstep delivery. For emergency prescription assistance, please reach out to customer support.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5-Step Timeline Bar */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#14304A] mb-6">
                    Order Delivery Timeline
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                    {timelineSteps.map((s) => {
                      const isComplete = s.step <= currentStep;
                      const isCurrent = s.step === currentStep;

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
                      {order.formData.fullName} (+91 {order.formData.mobileNumber})
                    </p>
                    <p className="text-xs text-[#637766] mt-1 leading-relaxed">
                      {deliveryAddress}
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
                        Method: <span className="font-bold text-[#14304A] capitalize">{order.formData.paymentMethod?.replace(/_/g, " ") || "Online"}</span>
                      </p>
                      <p>
                        Status: <span className="font-bold text-[#559620]">Paid</span>
                      </p>
                      <p className="font-mono text-[11px] text-[#718573] pt-1">
                        Ref: GNK-TXN-{order.orderId.replace(/[^0-9]/g, "").padEnd(10, "0").slice(0, 10)}
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
                          ₹{order.totals.subtotal}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#559620]">
                        <span>Discounts & Offers</span>
                        <span className="font-semibold">
                          - ₹{order.totals.discount + order.totals.couponDiscount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charges</span>
                        <span className="font-semibold text-[#14304A]">
                          {order.totals.deliveryCost === 0 ? "FREE" : `₹${order.totals.deliveryCost}`}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-[#EAF2E8] flex justify-between text-sm sm:text-base font-extrabold text-[#14304A]">
                        <span>Total Paid</span>
                        <span>₹{order.totals.totalAmount}</span>
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

        {/* Invoice Modal */}
        {isInvoiceOpen && (
          <InvoiceModal
            isOpen={isInvoiceOpen}
            onClose={() => setIsInvoiceOpen(false)}
            invoice={{
              orderId: order.orderId,
              invoiceNo: `GKPL/2026/${order.orderId.replace(/[^0-9]/g, "").slice(-4) || "0001"}`,
              invoiceDate: order.date,
              dueDate: order.date,
              paymentTerms: order.formData.paymentMethod?.toLowerCase().includes("cod") ? "Cash on Delivery" : "Prepaid",
              customerName: order.formData.fullName || user?.name || "Customer",
              customerPhone: `+91 ${order.formData.mobileNumber || user?.mobile || ""}`,
              shippingAddress: deliveryAddress,
              billingAddress: deliveryAddress,
              paymentMethod: order.formData.paymentMethod?.replace(/_/g, " ") || "Online",
              transactionId: `GNK-TXN-${order.orderId.replace(/[^0-9]/g, "").padEnd(12, "0").slice(0, 12)}`,
              paymentDate: order.date,
              paymentStatus: "Paid",
              items: order.items.map((item, idx) => ({
                name: item.name,
                variant: item.variant,
                hsn: idx % 2 === 0 ? "30049099" : "21069099",
                batchNo: `PC${24080 + idx}`,
                expiryDate: idx % 2 === 0 ? "DEC 2026" : "JAN 2027",
                quantity: item.quantity,
                mrp: Math.round(item.price * 1.25),
                price: item.price,
                gstRate: idx % 2 === 0 ? 12 : 18,
              })),
              subtotal: order.totals.subtotal,
              discount: order.totals.discount + order.totals.couponDiscount,
              taxableAmount: Math.round(order.totals.totalAmount * 0.9),
              gstAmount: Math.round(order.totals.totalAmount * 0.9 * 0.12),
              grandTotal: order.totals.totalAmount,
            }}
          />
        )}

        {/* Cancellation Request Modal */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE8D8]">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#F0F5F1] text-[#637766] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#14304A]">
                    Request Order Cancellation
                  </h3>
                  <p className="text-xs text-[#637766]">Order #{order.orderId} &bull; Total: ₹{order.totals.totalAmount}</p>
                </div>
              </div>

              <form onSubmit={handleSubmitCancellation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#14304A] mb-1.5">
                    Reason for Cancellation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] text-xs font-medium text-[#14304A] focus:outline-hidden focus:border-[#559620]"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Ordered incorrect medication or dosage">Ordered incorrect medication or dosage</option>
                    <option value="Doctor modified prescription">Doctor modified prescription</option>
                    <option value="Order placed by mistake / duplicate">Order placed by mistake / duplicate</option>
                    <option value="Delivery timeline exceeds urgency requirement">Delivery timeline exceeds urgency requirement</option>
                    <option value="Found alternate clinical treatment / other">Found alternate clinical treatment / other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14304A] mb-1.5">
                    Additional Details / Prescription Context (Optional)
                  </label>
                  <textarea
                    value={cancelDetails}
                    onChange={(e) => setCancelDetails(e.target.value)}
                    placeholder="Provide any specific notes for the dispensary pharmacist or administrator..."
                    rows={3}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] text-xs font-medium text-[#14304A] focus:outline-hidden focus:border-[#559620] resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F4F9F2] border border-[#DCE8D8] text-[11px] text-[#4A634E] space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-[#2C4830]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#559620]" />
                    <span>Schedule H Dispensary Compliance</span>
                  </p>
                  <p>
                    Once submitted, our dispensary admin will review your cancellation request. If approved, order stock will be restored and any online payment will be refunded within 3-5 business days.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#CCDCCD] text-xs font-bold text-[#14304A] hover:bg-[#F2F7F2] transition-colors cursor-pointer"
                  >
                    Keep My Order
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCancel || !cancelReason}
                    className="px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {submittingCancel ? "Submitting..." : "Confirm Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
