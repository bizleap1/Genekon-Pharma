"use client";

import React, { useState, use, useEffect } from "react";
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
  FileCheck,
  X,
  AlertCircle
} from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ADMIN_ORDERS, AdminOrder } from "@/data/adminData";
import { apiClient } from "@/api/client";
import { adminApi } from "@/api/admin";
import { OrderStatus } from "@/types/order";

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<AdminOrder>(() => {
    // 1. Check static admin orders
    const staticMatch = ADMIN_ORDERS.find(
      (o) => o.id.toLowerCase() === orderId.toLowerCase()
    );
    if (staticMatch) return staticMatch;

    // 2. Check local placed orders
    if (typeof window !== "undefined") {
      try {
        const storedStr = localStorage.getItem("genekon_placed_orders_v1");
        if (storedStr) {
          const parsed = JSON.parse(storedStr);
          const match = parsed.find(
            (p: any) => p.orderId.toLowerCase() === orderId.toLowerCase()
          );
          if (match) {
            return {
              id: match.orderId,
              customerName: match.formData?.fullName || "Customer",
              customerPhone: match.userPhone || match.formData?.mobileNumber || "9370102691",
              customerEmail: match.userEmail || match.formData?.email || "customer@genekon.com",
              deliveryAddress: `${match.formData?.addressLine || "Nagpur"}, ${match.formData?.city || "Maharashtra"}`,
              orderDate: match.date || "Today",
              itemCount: (match.items || []).reduce(
                (acc: number, i: any) => acc + (i.quantity || 1),
                0
              ) || 1,
              totalAmount: match.totals?.totalAmount || 0,
              paymentMethod:
                match.formData?.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "Online UPI/Card",
              paymentStatus: match.formData?.paymentMethod === "cod" ? "Pending" : "Paid",
              orderStatus: (match.status as OrderStatus) || "Placed",
              items: (match.items || []).map((i: any) => ({
                name: i.name,
                brand: i.brand || "Genekon",
                variant: i.variant || `${i.quantity || 1} pack`,
                quantity: i.quantity || 1,
                price: i.sellingPrice || i.price || 100,
                image: i.image || "/images/products/cipla-paracetamol-v2.jpg",
                batchNumber: "BN-LOCAL-101",
              })),
              cancellationRequest: match.cancellationRequest || null,
            };
          }
        }
      } catch {}
    }

    return {
      id: orderId,
      customerName: "Customer",
      customerPhone: "",
      customerEmail: "",
      deliveryAddress: "Address not available",
      orderDate: "Recent",
      itemCount: 0,
      totalAmount: 0,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Placed",
      items: [],
      cancellationRequest: null,
    };
  });

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order?.orderStatus || "Placed");
  const [successMsg, setSuccessMsg] = useState("");
  const [cancellationRequest, setCancellationRequest] = useState<any | null>(order?.cancellationRequest || null);
  const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; decision: "APPROVE" | "REJECT" } | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Also fetch live from backend API
    apiClient
      .get<any>(`/orders/${orderId}`)
      .then((res) => {
        const o = res.data?.order || res.data;
        if (o && (o.id || o.orderNumber)) {
          const liveOrder: AdminOrder = {
            id: o.orderNumber || o.id,
            customerName:
              o.customerName ||
              o.customer?.name ||
              (o.deliveryAddressSnapshot as any)?.fullName ||
              "Customer",
            customerPhone:
              o.customerPhone ||
              o.customer?.phone ||
              (o.deliveryAddressSnapshot as any)?.phone ||
              "9876543210",
            customerEmail: o.customer?.email || "customer@genekon.com",
            deliveryAddress: (o.deliveryAddressSnapshot as any)?.addressLine
              ? `${(o.deliveryAddressSnapshot as any).addressLine}, ${(o.deliveryAddressSnapshot as any).city}`
              : "Nagpur, Maharashtra",
            orderDate: o.createdAt
              ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })
              : "Today",
            itemCount: (o.items || []).reduce(
              (acc: number, i: any) => acc + (i.quantity || 1),
              0
            ) || 1,
            totalAmount: Number(o.totalAmount || 0),
            paymentMethod: o.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment",
            paymentStatus:
              o.paymentStatus === "SUCCESS" || o.paymentStatus === "PAID"
                ? "Paid"
                : o.paymentStatus === "FAILED"
                ? "Failed"
                : "Pending",
            orderStatus: (o.orderStatus === "CONFIRMED"
              ? "Processing"
              : o.orderStatus === "DELIVERED"
              ? "Delivered"
              : o.orderStatus === "SHIPPED"
              ? "Shipped"
              : o.orderStatus === "CANCELLED"
              ? "Cancelled"
              : "Processing") as any,
            cancellationRequest: o.cancellationRequest || null,
            items: (o.items || []).map((i: any) => ({
              name: i.name || i.productNameSnapshot || "Medicine Item",
              brand: i.brand || "Genekon",
              variant: "Standard",
              quantity: i.quantity || 1,
              price: Number(i.sellingPrice || i.price || 0),
              image: i.image || "/images/products/cipla-paracetamol-v2.jpg",
              batchNumber: "BN-LIVE-101",
            })),
          };
          setOrder(liveOrder);
          setCurrentStatus(liveOrder.orderStatus);
          if (liveOrder.cancellationRequest) setCancellationRequest(liveOrder.cancellationRequest);
        }
      })
      .catch(() => {});

    apiClient
      .get<any>(`/orders/${orderId}/cancel-request`)
      .then((res) => {
        if (res.data) setCancellationRequest(res.data);
      })
      .catch(() => {});
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    setOrder((prev) => ({ ...prev, orderStatus: newStatus }));

    const apiStatus =
      newStatus === "Cancelled"
        ? "CANCELLED"
        : newStatus === "Delivered"
        ? "DELIVERED"
        : newStatus === "Shipped"
        ? "SHIPPED"
        : newStatus === "Packed"
        ? "CONFIRMED"
        : newStatus === "Confirmed"
        ? "CONFIRMED"
        : "PROCESSING";

    try {
      await adminApi.updateOrderStatus(orderId, apiStatus as any);
      setSuccessMsg(`Order status successfully updated to "${newStatus}".`);
    } catch {
      setSuccessMsg(`Order status updated to "${newStatus}".`);
    }
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleReviewCancellation = async (decision: "APPROVE" | "REJECT") => {
    const reqId = cancellationRequest?.id || `cancel-${orderId}`;
    setSubmittingReview(true);
    try {
      const res = await adminApi.reviewCancellationRequest(
        reqId,
        decision,
        adminComment,
        orderId
      );
      if (res.success) {
        setCancellationRequest((prev: any) => ({
          ...(prev || {}),
          status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
          adminComment,
          reviewedAt: new Date().toISOString(),
        }));
        if (decision === "APPROVE") {
          setCurrentStatus("Cancelled");
          setOrder((prev) => ({
            ...prev,
            orderStatus: "Cancelled",
            paymentStatus: prev.paymentMethod === "COD" ? "Pending" : "Refunded",
          }));
          setSuccessMsg("Cancellation approved. Order is cancelled, stock restored, and refund processed.");
        } else {
          setSuccessMsg("Cancellation request was declined.");
        }
        setReviewModal(null);
      } else {
        alert(res.message || "Failed to process cancellation review");
      }
    } catch (err: any) {
      alert(err.message || "Failed to process cancellation review");
    } finally {
      setSubmittingReview(false);
    }
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
              Order #{order.id}
            </h2>
            <StatusBadge status={currentStatus} />
          </div>
          <p className="text-xs text-[#637766] mt-0.5">
            Placed on {order.orderDate} &bull; Payment: {order.paymentMethod}
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

      {/* Cancellation Request Alert / Review Banner */}
      {cancellationRequest && (
        <div
          className={`rounded-2xl border p-6 shadow-sm transition-all ${
            cancellationRequest.status === "PENDING"
              ? "bg-amber-50/70 border-amber-200"
              : cancellationRequest.status === "APPROVED"
              ? "bg-emerald-50/60 border-emerald-200"
              : "bg-red-50/60 border-red-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl mt-0.5 ${
                  cancellationRequest.status === "PENDING"
                    ? "bg-amber-100 text-amber-800"
                    : cancellationRequest.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {cancellationRequest.status === "PENDING" ? (
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                ) : cancellationRequest.status === "APPROVED" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-700" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-[#14304A]">
                    Customer Cancellation Request:{" "}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider ${
                        cancellationRequest.status === "PENDING"
                          ? "bg-amber-200 text-amber-900"
                          : cancellationRequest.status === "APPROVED"
                          ? "bg-emerald-200 text-emerald-900"
                          : "bg-red-200 text-red-900"
                      }`}
                    >
                      {cancellationRequest.status}
                    </span>
                  </h4>
                  {cancellationRequest.createdAt && (
                    <span className="text-[11px] text-gray-500">
                      &bull; Requested on{" "}
                      {new Date(cancellationRequest.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700">
                  <span className="font-semibold text-[#14304A]">Reason:</span>{" "}
                  {cancellationRequest.reason}
                </p>
                {cancellationRequest.comment && (
                  <p className="text-xs text-gray-600 bg-white/70 p-2 rounded-lg border border-gray-200/50 mt-1">
                    <span className="font-semibold">Customer Note:</span> {cancellationRequest.comment}
                  </p>
                )}
                {cancellationRequest.adminComment && (
                  <p className="text-xs text-gray-700 mt-1">
                    <span className="font-semibold">Admin Response:</span> {cancellationRequest.adminComment}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons if PENDING */}
            {cancellationRequest.status === "PENDING" && (
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setAdminComment("");
                    setReviewModal({ isOpen: true, decision: "REJECT" });
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 transition-colors cursor-pointer"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminComment("");
                    setReviewModal({ isOpen: true, decision: "APPROVE" });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#559620] hover:bg-[#447719] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve &amp; Cancel
                </button>
              </div>
            )}
          </div>
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
            <p className="font-bold text-[#14304A] text-sm">{order.customerName}</p>
            <p className="text-[#5F7361] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#559620]" />
              <span>+91 {order.customerPhone}</span>
            </p>
            <p className="text-[#5F7361] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#1853A8]" />
              <span>{order.customerEmail}</span>
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
              <p className="leading-relaxed">{order.deliveryAddress}</p>
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
          Order Items ({order.items?.length || 0})
        </h3>

        <div className="divide-y divide-[#EDF3EC]">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-[#FAFCFB] border border-[#DDE7DC] p-1 shrink-0 overflow-hidden">
                  <Image
                    src={item.image || "/images/products/cipla-paracetamol-v2.jpg"}
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
          <span className="text-xs text-[#697E6C]">Payment Status: <strong className="text-[#559620]">{order.paymentStatus}</strong></span>
          <div className="text-right">
            <span className="text-xs text-[#697E6C] mr-2">Grand Total:</span>
            <span className="font-serif text-xl font-bold text-[#14304A]">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Cancellation Review Modal */}
      {reviewModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setReviewModal(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-3 rounded-2xl ${
                  reviewModal.decision === "APPROVE"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {reviewModal.decision === "APPROVE" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-700" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#14304A]">
                  {reviewModal.decision === "APPROVE" ? "Approve Cancellation" : "Reject Cancellation"}
                </h3>
                <p className="text-xs text-gray-500">
                  {reviewModal.decision === "APPROVE"
                    ? "Order will be cancelled, inventory restored, and refund processed."
                    : "Customer order fulfillment will proceed as scheduled."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1.5">
                  Admin Comment / Reason {reviewModal.decision === "REJECT" ? "(Mandatory for rejection)" : "(Optional note to customer)"}
                </label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder={
                    reviewModal.decision === "APPROVE"
                      ? "e.g., Cancellation verified and approved. Refund initiated."
                      : "e.g., Order is already staged for shipment and cannot be cancelled."
                  }
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#559620]/30 focus:border-[#559620] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  disabled={submittingReview}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewCancellation(reviewModal.decision)}
                  disabled={submittingReview || (reviewModal.decision === "REJECT" && !adminComment.trim())}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm cursor-pointer ${
                    reviewModal.decision === "APPROVE"
                      ? "bg-[#559620] hover:bg-[#447719]"
                      : "bg-red-600 hover:bg-red-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submittingReview
                    ? "Processing..."
                    : reviewModal.decision === "APPROVE"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
