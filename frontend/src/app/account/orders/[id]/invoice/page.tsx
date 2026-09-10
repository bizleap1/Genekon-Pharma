"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Printer, Loader2, Check, AlertTriangle } from "lucide-react";
import { GenekonInvoice, InvoiceData } from "@/components/invoice/GenekonInvoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { PlacedOrder } from "@/types/order";
import { useAuthStore } from "@/stores/authStore";
import { orderService } from "@/services/orderService";
import { ordersApi } from "@/api/orders";

export default function OrderInvoiceFullPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orders = orderService.getStoredOrders(user?.id);
    const found = orders.find(
      (o) => o.orderId.toLowerCase() === orderId.toLowerCase()
    );
    if (found) {
      setOrder(found);
      setLoading(false);
    } else {
      ordersApi.getOrderById(orderId).then((res) => {
        if (res.data) {
          setOrder(res.data);
        }
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [orderId, user?.id]);

  const handleDownloadPdf = async () => {
    const invoiceEl = document.getElementById("genekon-invoice-root");
    if (!invoiceEl) return;

    try {
      setIsGenerating(true);
      const canvas = await html2canvas(invoiceEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Genekon_Invoice_${order!.orderId.replace(/[^a-zA-Z0-9_-]/g, "")}.pdf`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Download invoice PDF failed:", err);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F5F0] flex items-center justify-center">
        <div className="animate-pulse text-[#559620] text-sm font-medium">Loading invoice...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F0F5F0] flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-[#DCE8D8] p-12 max-w-md w-full text-center shadow-lg">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">Order Not Found</h2>
          <p className="text-sm text-[#6B806E] mb-6">
            We couldn&apos;t find order <span className="font-bold">#{orderId}</span>. It may have been placed from a different device.
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#559620] text-white text-sm font-bold hover:bg-[#467E19] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const deliveryAddress = `${order.formData.addressLine}${order.formData.landmark ? ", " + order.formData.landmark : ""}, ${order.formData.city}, ${order.formData.state} - ${order.formData.pincode}`;

  const invoiceData: InvoiceData = {
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
  };

  return (
    <div className="min-h-screen bg-[#F0F5F0] py-6 sm:py-10 print:p-0 print:bg-white">
      {/* Floating Action Bar (Hidden when printing) */}
      <div className="max-w-[850px] mx-auto px-4 mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/account/orders/${order.orderId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14304A] hover:text-[#559620] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order Details</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#559620]" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Rendered Invoice Component */}
      <div className="px-3">
        <GenekonInvoice invoice={invoiceData} />
      </div>
    </div>
  );
}
