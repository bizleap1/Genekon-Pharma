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
  ChevronRight,
  FileText
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { CustomerOrder } from "@/data/customer";
import { ordersApi } from "@/api/orders";
import { orderService } from "@/services/orderService";
import { useAuthStore } from "@/stores/authStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import { InvoiceModal } from "@/components/invoice/InvoiceModal";
import { InvoiceData } from "@/components/invoice/GenekonInvoice";

export default function MyOrdersPage() {
  const { isLoggedIn, openLoginModal, user } = useAuthStore();
  const { requireAuth } = useAuthGuard();
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState<"all" | "in-transit" | "delivered">("all");
  const [reorderedId, setReorderedId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<CustomerOrder | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await ordersApi.getUserOrders();
        let userOrders: CustomerOrder[] = [];
        if (res.success && res.data && res.data.length > 0) {
          userOrders = res.data.map((o) => ({
            id: o.orderId,
            date: o.date,
            totalAmount: o.totals.totalAmount,
            paymentMethod: o.formData.paymentMethod === "cod" ? "Cash on Delivery" : "Online / UPI",
            paymentStatus: (o.formData.paymentMethod === "cod" ? "Cash on Delivery" : "Paid") as any,
            deliveryStatus: (o.status === "Delivered" ? "Delivered" : o.status === "Shipped" ? "Shipped" : "Confirmed") as any,
            currentStep: o.status === "Delivered" ? 5 : o.status === "Shipped" ? 4 : 2,
            estimatedDelivery: o.estimatedDelivery || "In 2-4 business days",
            deliveryAddress: `${o.formData.addressLine}, ${o.formData.city}, ${o.formData.state} - ${o.formData.pincode}`,
            items: o.items.map((it) => ({
              id: it.id || it.productId || "p1",
              name: it.name,
              brand: it.brand || "Genekon",
              variant: it.variant || "Standard",
              price: it.price,
              quantity: it.quantity,
              image: it.image || "/images/products/cipla-paracetamol-v2.jpg",
            })),
            priceBreakdown: {
              subtotal: o.totals.subtotal,
              discount: o.totals.discount,
              deliveryFee: o.totals.deliveryCost,
              total: o.totals.totalAmount,
            },
          }));
        } else {
          const local = orderService.getStoredOrders();
          if (local && local.length > 0) {
            userOrders = local.map((o) => ({
              id: o.orderId,
              date: o.date,
              totalAmount: o.totals.totalAmount,
              paymentMethod: o.formData.paymentMethod === "cod" ? "Cash on Delivery" : "Online / UPI",
              paymentStatus: (o.formData.paymentMethod === "cod" ? "Cash on Delivery" : "Paid") as any,
              deliveryStatus: (o.status === "Delivered" ? "Delivered" : o.status === "Shipped" ? "Shipped" : "Confirmed") as any,
              currentStep: o.status === "Delivered" ? 5 : o.status === "Shipped" ? 4 : 2,
              estimatedDelivery: o.estimatedDelivery || "In 2-4 business days",
              deliveryAddress: `${o.formData.addressLine}, ${o.formData.city}, ${o.formData.state} - ${o.formData.pincode}`,
              items: o.items.map((it) => ({
                id: it.id || it.productId || "p1",
                name: it.name,
                brand: it.brand || "Genekon",
                variant: it.variant || "Standard",
                price: it.price,
                quantity: it.quantity,
                image: it.image || "/images/products/cipla-paracetamol-v2.jpg",
              })),
              priceBreakdown: {
                subtotal: o.totals.subtotal,
                discount: o.totals.discount,
                deliveryFee: o.totals.deliveryCost,
                total: o.totals.totalAmount,
              },
            }));
          }
        }
        setOrders(userOrders);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    if (isLoggedIn) {
      loadOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [isLoggedIn]);

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "in-transit") return order.deliveryStatus === "Shipped" || order.deliveryStatus === "Confirmed";
    if (activeFilter === "delivered") return order.deliveryStatus === "Delivered";
    return true;
  });

  const handleReorder = (order: CustomerOrder) => {
    requireAuth(
      () => {
        order.items?.forEach((item) => {
          const minimalProd: Product = {
            id: item.id,
            name: item.name,
            brand: item.brand || "Genekon",
            manufacturer: item.brand || "Genekon",
            category: "Medicines",
            subCategory: "Prescription Medicines",
            composition: "",
            description: "",
            usage: "",
            precautions: "",
            images: [item.image],
            image: item.image,
            mrp: item.price * 1.2,
            sellingPrice: item.price,
            price: item.price,
            discount: 10,
            gst: 12,
            stockStatus: "In Stock",
            stockQuantity: 50,
            quantity: 1,
            sku: `SKU-${item.id}`,
            batchNumber: "BTH-GEN-01",
            expiryDate: "12/2028",
            prescriptionRequired: false,
            storageInstructions: "Store in a cool dry place.",
            rating: 4.5,
            inStock: true,
            variants: [],
          };
          addToCart(minimalProd, item.quantity || 1, item.variant);
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
                      { id: "all" as const, label: "All Orders" },
                      { id: "in-transit" as const, label: "In Transit" },
                      { id: "delivered" as const, label: "Delivered" },
                    ].map((tab) => {
                      const isActive = activeFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveFilter(tab.id)}
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

                {/* Orders List / Empty State */}
                {filteredOrders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#C5D6C7] bg-[#FAFCFB] p-10 sm:p-14 text-center my-6">
                    <div className="w-14 h-14 rounded-full bg-[#EDF7E9] text-[#559620] flex items-center justify-center mx-auto mb-3">
                      <Package className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#14304A]">
                      {activeFilter === "all"
                        ? "You haven't placed any orders yet."
                        : "No orders found"}
                    </h3>
                    <p className="text-xs text-[#637766] max-w-xs mx-auto mt-1 mb-5 leading-relaxed">
                      {activeFilter === "all"
                        ? "Explore our verified catalog of authentic medicines and wellness essentials to place your first order."
                        : `You have no ${activeFilter === "in-transit" ? "in-transit" : "delivered"} orders.`}
                    </p>
                    <Link
                      href="/search"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>Explore Medicines</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
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
                            {/* Invoice Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceOrder(order)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#D5E5D1] bg-[#EDF7E9] hover:bg-[#DCF0D6] text-xs font-bold text-[#447719] transition-colors cursor-pointer"
                              title="View and Download Tax Invoice"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#559620]" />
                              <span>Invoice (PDF)</span>
                            </button>

                            <Link
                              href={`/account/orders/${order.id}`}
                              className="px-3.5 py-1.5 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-colors"
                            >
                              View Details
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
              )}

              {/* Invoice Modal for Selected Order */}
              {selectedInvoiceOrder && (
                <InvoiceModal
                  isOpen={Boolean(selectedInvoiceOrder)}
                  onClose={() => setSelectedInvoiceOrder(null)}
                  invoice={{
                    orderId: selectedInvoiceOrder.id,
                    invoiceNo: `GKPL/2026/${selectedInvoiceOrder.id.replace(/[^0-9]/g, "").slice(-4) || "0428"}`,
                    invoiceDate: selectedInvoiceOrder.date,
                    dueDate: selectedInvoiceOrder.date,
                    paymentTerms: selectedInvoiceOrder.paymentMethod.toLowerCase().includes("cod") ? "Cash on Delivery" : "Prepaid",
                    customerName: user?.name || "Customer",
                    customerPhone: user?.mobile ? `+91 ${user.mobile}` : "",
                    shippingAddress: selectedInvoiceOrder.deliveryAddress,
                    billingAddress: selectedInvoiceOrder.deliveryAddress,
                    paymentMethod: selectedInvoiceOrder.paymentMethod,
                    transactionId: `UPI/${selectedInvoiceOrder.id.replace(/[^0-9]/g, "").padEnd(12, "512874639201").slice(0, 12)}`,
                    paymentDate: selectedInvoiceOrder.date,
                    paymentStatus: selectedInvoiceOrder.paymentStatus,
                    items: selectedInvoiceOrder.items.map((item, idx) => ({
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
                    subtotal: selectedInvoiceOrder.items.reduce((acc, i) => acc + i.price * i.quantity, 0),
                    discount: Math.round(selectedInvoiceOrder.totalAmount * 0.1),
                    taxableAmount: Math.round(selectedInvoiceOrder.totalAmount * 0.9),
                    gstAmount: Math.round(selectedInvoiceOrder.totalAmount * 0.9 * 0.12),
                    grandTotal: selectedInvoiceOrder.totalAmount,
                  }}
                />
              )}

              </div>

            </div>

          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
