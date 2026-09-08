"use client";

import React from "react";
import {
  User,
  Truck,
  Building2,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { numberToWords } from "@/utils/numberToWords";

export interface InvoiceItem {
  id?: string;
  name: string;
  variant?: string;
  composition?: string;
  hsn?: string;
  batchNo?: string;
  expiryDate?: string;
  quantity: number;
  mrp?: number;
  price: number;
  gstRate?: number;
}

export interface InvoiceData {
  orderId: string;
  invoiceNo?: string;
  invoiceDate?: string;
  dueDate?: string;
  paymentTerms?: string;
  customerName?: string;
  customerPhone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: string;
  bankRef?: string;
  paymentStatus?: string;
  items: InvoiceItem[];
  subtotal?: number;
  discount?: number;
  discountPercentage?: number;
  taxableAmount?: number;
  gstAmount?: number;
  grandTotal?: number;
}

interface GenekonInvoiceProps {
  invoice: InvoiceData;
  className?: string;
}

export const GenekonInvoice: React.FC<GenekonInvoiceProps> = ({
  invoice,
  className = "",
}) => {
  // Compute calculated amounts if not provided
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    {
      name: "Paracetamol 500 mg Tablets (Crocin Plus)",
      variant: "Strip of 15 Tablets",
      hsn: "30049099",
      batchNo: "PC24081",
      expiryDate: "DEC 2026",
      quantity: 2,
      mrp: 52.0,
      price: 42.0,
      gstRate: 12,
    },
    {
      name: "Cetirizine 10 mg Tablets (Alerid)",
      variant: "Strip of 10 Tablets",
      hsn: "30049099",
      batchNo: "CT24120",
      expiryDate: "NOV 2026",
      quantity: 1,
      mrp: 36.5,
      price: 28.0,
      gstRate: 12,
    },
    {
      name: "Multivitamin & Minerals Capsules (HealthVit)",
      variant: "Strip of 10 Capsules",
      hsn: "21069099",
      batchNo: "MV25011",
      expiryDate: "JAN 2027",
      quantity: 1,
      mrp: 125.0,
      price: 98.0,
      gstRate: 18,
    },
  ];

  const calculatedSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotal = invoice.subtotal !== undefined ? invoice.subtotal : calculatedSubtotal;
  const discount = invoice.discount !== undefined ? invoice.discount : Math.round(subtotal * 0.1);
  const taxable = subtotal - discount;
  const gstAmount = invoice.gstAmount !== undefined ? invoice.gstAmount : Math.round(taxable * 0.12 * 100) / 100;
  const grandTotal = invoice.grandTotal !== undefined ? invoice.grandTotal : Math.round((taxable + gstAmount) * 100) / 100;

  const invoiceNo = invoice.invoiceNo || `GKPL/2026/${invoice.orderId.replace(/[^0-9]/g, "").slice(-4) || "0428"}`;
  const invoiceDate = invoice.invoiceDate || "28 Apr 2026";
  const dueDate = invoice.dueDate || invoiceDate;
  const paymentTerms = invoice.paymentTerms || (invoice.paymentMethod?.toLowerCase().includes("cod") ? "Cash on Delivery" : "Prepaid");
  const customerName = invoice.customerName || "Mr. Rahul Mehta";
  const customerPhone = invoice.customerPhone || "+91 98765 43210";
  const address = invoice.shippingAddress || invoice.billingAddress || "A-102, Green Park Apartments, Sector 21, Navi Mumbai - 410210, Maharashtra, India";

  const paymentMethod = invoice.paymentMethod || "Online Payment (UPI)";
  const transactionId = invoice.transactionId || `UPI/${invoice.orderId.replace(/[^0-9]/g, "").padEnd(12, "512874639201").slice(0, 12)}`;
  const bankRef = invoice.bankRef || "HDFC0003281";
  const isPaid = (invoice.paymentStatus || "Paid").toLowerCase() === "paid";

  const grandTotalInWords = numberToWords(grandTotal);

  return (
    <div
      id="genekon-invoice-root"
      className={`w-full max-w-[850px] mx-auto bg-white border border-[#DCE8D8] text-[#14304A] font-sans p-5 sm:p-8 shadow-sm relative overflow-hidden print:shadow-none print:border-none print:p-2 print:m-0 print:max-w-none ${className}`}
      style={{ minHeight: "1120px" }}
    >
      {/* ================= 1. EXACT TOP HEADER BANNER ================= */}
      {/* Contains exact Genekon Helix Logo, Slogan, and Right Trust Badges from template */}
      <div className="w-full mb-3 select-none">
        <img
          src="/exact_invoice_header.png"
          alt="Genekon Pharmaceuticals - For a Healthier Brighter Tomorrow"
          className="w-full h-auto object-contain drop-shadow-2xs"
        />
      </div>

      {/* ================= 2. INVOICE META BANNER ================= */}
      <div className="rounded-2xl bg-[#F4F8FA] border border-[#E2ECF2] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: INVOICE Title */}
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#14304A] tracking-wider leading-none">
            INVOICE
          </h1>
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#576A5D] mt-1.5">
            MEDICINES TODAY. A HEALTHIER TOMORROW.
          </p>
        </div>

        {/* Center: Metadata Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-[#566D5A]">Invoice No. :</span>
            <span className="font-mono font-bold text-[#14304A]">{invoiceNo}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-[#566D5A]">Payment Terms :</span>
            <span className="font-bold text-[#14304A]">{paymentTerms}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-[#566D5A]">Invoice Date :</span>
            <span className="font-semibold text-[#14304A]">{invoiceDate}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-[#566D5A]">Due Date :</span>
            <span className="font-semibold text-[#14304A]">{dueDate}</span>
          </div>
          <div className="flex items-center justify-between gap-3 col-span-2 sm:col-span-1">
            <span className="font-bold text-[#566D5A]">Order No. :</span>
            <span className="font-mono font-extrabold text-[#1B52A4]">{invoice.orderId}</span>
          </div>
        </div>

        {/* Right: Exact Safe & Genuine Pill Badge Image */}
        <div className="shrink-0 flex items-center justify-center select-none">
          <img
            src="/exact_safe_badge.png"
            alt="Safe Genuine Effective Always"
            className="w-[110px] h-auto object-contain drop-shadow-2xs"
          />
        </div>
      </div>

      {/* ================= 3. THREE-COLUMN ADDRESS GRID ================= */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bill To */}
        <div className="rounded-2xl border border-[#E4EDE2] bg-[#FAFCFA] p-4 text-xs">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#EAF2E8]">
            <div className="w-6 h-6 rounded-full bg-[#EAF2FC] text-[#1B52A4] flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-serif text-sm font-bold text-[#14304A]">Bill To</h3>
          </div>
          <p className="font-bold text-[#14304A] text-sm">{customerName}</p>
          <p className="text-[#596D5C] mt-1 leading-relaxed text-[11px]">{address}</p>
          <p className="text-[#14304A] font-semibold mt-2 text-[11px]">Phone: {customerPhone}</p>
        </div>

        {/* Shipping Address */}
        <div className="rounded-2xl border border-[#E4EDE2] bg-[#FAFCFA] p-4 text-xs">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#EAF2E8]">
            <div className="w-6 h-6 rounded-full bg-[#EAF2FC] text-[#1B52A4] flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-serif text-sm font-bold text-[#14304A]">Shipping Address</h3>
          </div>
          <p className="font-bold text-[#14304A] text-sm">{customerName}</p>
          <p className="text-[#596D5C] mt-1 leading-relaxed text-[11px]">{address}</p>
          <p className="text-[#14304A] font-semibold mt-2 text-[11px]">Phone: {customerPhone}</p>
        </div>

        {/* Sold By */}
        <div className="rounded-2xl border border-[#E4EDE2] bg-[#FAFCFA] p-4 text-xs">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#EAF2E8]">
            <div className="w-6 h-6 rounded-full bg-[#EAF2FC] text-[#1B52A4] flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-serif text-sm font-bold text-[#14304A]">Sold By</h3>
          </div>
          <p className="font-bold text-[#14304A] text-sm">Genekon Pharmaceuticals Pvt Ltd</p>
          <p className="text-[#596D5C] mt-1 leading-relaxed text-[11px]">
            Plot No. 56, Pharma SEZ, Bidadi Industrial Area, Ramanagara - 562109, Karnataka, India
          </p>
          <p className="text-[#14304A] font-extrabold mt-2 text-[11px]">
            GSTIN: <span className="font-mono">29AAGCG1234F1Z8</span>
          </p>
        </div>
      </div>

      {/* ================= 4. PRODUCTS TABLE ================= */}
      <div className="mt-4 rounded-2xl border border-[#DCE8D8] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#4D8E22] text-white text-[10px] sm:text-xs uppercase font-extrabold tracking-wider">
              <th className="py-2.5 px-3 text-center w-8">#</th>
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-2 text-center">HSN</th>
              <th className="py-2.5 px-2 text-center">Batch No.</th>
              <th className="py-2.5 px-2 text-center">Expiry</th>
              <th className="py-2.5 px-2 text-center w-10">Qty</th>
              <th className="py-2.5 px-2 text-right">MRP (₹)</th>
              <th className="py-2.5 px-2 text-right">Price (₹)</th>
              <th className="py-2.5 px-2 text-center">GST %</th>
              <th className="py-2.5 px-3 text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-[#EAF2E8] bg-white">
            {items.map((item, idx) => {
              const itemTotal = item.price * item.quantity;
              const hsn = item.hsn || "30049099";
              const batch = item.batchNo || `PC${24080 + idx}`;
              const expiry = item.expiryDate || "DEC 2026";
              const mrp = item.mrp || Math.round(item.price * 1.25);
              const gst = item.gstRate || 12;

              return (
                <tr key={idx} className={idx % 2 === 1 ? "bg-[#F9FCF8]" : "bg-white"}>
                  <td className="py-2.5 px-3 text-center text-[#556958] font-bold">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-[#14304A] leading-snug">{item.name}</p>
                    {item.variant && (
                      <p className="text-[10px] text-[#1B52A4] font-semibold mt-0.5">
                        {item.variant}
                      </p>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-[11px] text-[#556958]">{hsn}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-[11px] text-[#556958]">{batch}</td>
                  <td className="py-2.5 px-2 text-center text-[11px] text-[#556958]">{expiry}</td>
                  <td className="py-2.5 px-2 text-center font-bold text-[#14304A]">{item.quantity}</td>
                  <td className="py-2.5 px-2 text-right font-mono text-[#6A7E6C]">₹{mrp.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right font-mono text-[#14304A] font-semibold">₹{item.price.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-center text-[#556958] font-semibold">{gst}%</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#14304A]">
                    ₹{itemTotal.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= 5. PAYMENT DETAILS & TOTALS GRID ================= */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Left Side: Payment Details Card & Exact Thank You Card */}
        <div className="space-y-3">
          {/* Payment Card */}
          <div className="rounded-2xl border border-[#E3EDE1] bg-[#FAFCFA] p-4 text-xs">
            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-[#EAF2E8]">
              <div className="w-6 h-6 rounded-full bg-[#EAF2FC] text-[#1B52A4] flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-serif text-sm font-bold text-[#14304A]">Payment Details</h3>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5D7160] font-medium">Method :</span>
                <span className="font-bold text-[#14304A]">{paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5D7160] font-medium">Transaction ID :</span>
                <span className="font-mono font-bold text-[#14304A]">{transactionId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5D7160] font-medium">Payment Date :</span>
                <span className="font-semibold text-[#14304A]">{invoice.paymentDate || invoiceDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5D7160] font-medium">Bank Reference :</span>
                <span className="font-mono text-[#14304A]">{bankRef}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#5D7160] font-medium">Status :</span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    isPaid ? "bg-[#EDF7E9] text-[#447719]" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-[#559620]" />
                  <span>{isPaid ? "Paid" : "Pending on Delivery"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Exact Thank You Card from Template */}
          <div className="select-none">
            <img
              src="/exact_thank_you_card.png"
              alt="Thank you for choosing Genekon. TOGETHER FOR A HEALTHIER TOMORROW."
              className="w-full max-w-[340px] h-auto object-contain rounded-xl drop-shadow-2xs"
            />
          </div>
        </div>

        {/* Right Side: Totals Calculation & Grand Total Banner */}
        <div className="rounded-2xl border border-[#E3EDE1] bg-white p-4 sm:p-5 text-xs space-y-2">
          <div className="flex items-center justify-between text-[#5D7160]">
            <span className="font-semibold">Subtotal</span>
            <span className="font-mono font-bold text-[#14304A]">₹ {subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-[#5D7160]">
            <span className="font-semibold">Discount ({invoice.discountPercentage || 10}%)</span>
            <span className="font-mono font-bold text-[#D92D20]">- ₹ {discount.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-[#5D7160] pt-1 border-t border-[#EAF2E8]">
            <span className="font-semibold">Taxable Amount</span>
            <span className="font-mono font-bold text-[#14304A]">₹ {taxable.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-[#5D7160]">
            <span className="font-semibold">GST (12% + 18%)</span>
            <span className="font-mono font-bold text-[#14304A]">₹ {gstAmount.toFixed(2)}</span>
          </div>

          {/* Grand Total Highlight Banner */}
          <div className="mt-2 pt-2 border-t-2 border-[#559620] rounded-xl bg-[#EDF7E9] p-3 flex items-center justify-between">
            <span className="font-serif text-base font-bold text-[#14304A]">
              Grand Total
            </span>
            <span className="font-serif text-xl font-black text-[#14304A]">
              ₹ {grandTotal.toFixed(2)}
            </span>
          </div>

          {/* Amount In Words */}
          <div className="pt-1 text-[11px] text-[#556958] leading-relaxed">
            <span className="font-bold text-[#14304A]">Amount in Words: </span>
            <span className="italic">{grandTotalInWords}</span>
          </div>
        </div>
      </div>

      {/* ================= 6. EXACT TRUST FEATURES BAR ================= */}
      <div className="mt-4 w-full select-none">
        <img
          src="/exact_trust_bar.png"
          alt="Genuine Medicines, Safe Delivery, Care for Healthier You, People Health, Good Health Brighter Days"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* ================= 7. EXACT DARK NAVY FOOTER ================= */}
      <div className="mt-2 w-full select-none">
        <img
          src="/exact_navy_footer.png"
          alt="Genekon Contact Footer"
          className="w-full h-auto object-contain rounded-2xl shadow-xs"
        />
      </div>
    </div>
  );
};
