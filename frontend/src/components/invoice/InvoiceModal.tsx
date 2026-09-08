"use client";

import React, { useState } from "react";
import { Download, Printer, X, ExternalLink, Loader2, Check } from "lucide-react";
import { GenekonInvoice, InvoiceData } from "./GenekonInvoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    const invoiceEl = document.getElementById("genekon-invoice-root");
    if (!invoiceEl) return;

    try {
      setIsGenerating(true);

      // Capture high-resolution canvas of the invoice DOM
      const canvas = await html2canvas(invoiceEl, {
        scale: 2, // 2x scale for crystal crisp text and graphics
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
      const filename = `Genekon_Invoice_${invoice.orderId.replace(/[^a-zA-Z0-9_-]/g, "")}.pdf`;
      pdf.save(filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to generate invoice PDF", err);
      // Fallback to window.print if html2canvas encounters issue
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
      {/* Container Box */}
      <div className="relative w-full max-w-4xl max-h-[95vh] flex flex-col rounded-3xl bg-[#F8FAF8] border border-[#D5E5D1] shadow-2xl overflow-hidden">
        {/* Modal Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-white border-b border-[#E3EDE1] shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#447719] bg-[#EDF7E9] px-2 py-0.5 rounded-full">
              OFFICIAL TAX INVOICE
            </span>
            <h2 className="font-serif text-lg font-bold text-[#14304A] mt-0.5">
              Invoice for Order #{invoice.orderId}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
              title="Download Tax Invoice PDF"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] hover:bg-[#F0F5F1] text-xs font-bold text-[#14304A] transition-colors cursor-pointer"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5 text-[#559620]" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Standalone Route Link */}
            <a
              href={`/account/orders/${invoice.orderId}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] hover:bg-[#F0F5F1] text-[#14304A] transition-colors"
              title="Open Invoice in Full Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Invoice Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#EEF4ED]/50 flex justify-center">
          <GenekonInvoice invoice={invoice} />
        </div>
      </div>
    </div>
  );
};
