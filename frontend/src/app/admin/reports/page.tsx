"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  DollarSign,
  PackageCheck,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Building2,
  ShoppingBag,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Printer
} from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SALES_CHART_DATA, CATEGORY_PERFORMANCE_DATA } from "@/data/adminData";

// Extended reporting dataset
const FULFILLMENT_DATA = [
  { stage: "Rx Pharmacist Verification (< 15 mins)", count: "1,412 / 1,428", rate: "98.8%", status: "Optimal" },
  { stage: "Batch Audit & Dispensing Pack", count: "1,406 / 1,428", rate: "98.4%", status: "Optimal" },
  { stage: "Cold-chain Insulated Handover", count: "318 / 320", rate: "99.3%", status: "Optimal" },
  { stage: "Nagpur Express Same-Day Delivery", count: "982 / 1,010", rate: "97.2%", status: "Good" },
  { stage: "Vidarbha Regional 24h Delivery", count: "402 / 418", rate: "96.1%", status: "Good" },
];

const INVENTORY_TURNOVER_DATA = [
  {
    sku: "MED-CIP-500",
    name: "Paracetamol 500mg (Cipla)",
    category: "Medicines",
    stock: 450,
    monthlySales: 1200,
    turnoverRatio: "8.4x",
    daysOfStock: "11 Days",
    velocity: "Fast Moving",
    margin: "18.5%"
  },
  {
    sku: "SKN-CET-500",
    name: "Cetaphil Gentle Skin Cleanser",
    category: "Personal Care",
    stock: 92,
    monthlySales: 180,
    turnoverRatio: "5.8x",
    daysOfStock: "15 Days",
    velocity: "Fast Moving",
    margin: "24.0%"
  },
  {
    sku: "DEV-ACC-50S",
    name: "Accu-Chek Blood Glucose Strips",
    category: "Medical Devices",
    stock: 4,
    monthlySales: 65,
    turnoverRatio: "6.2x",
    daysOfStock: "2 Days (Low)",
    velocity: "Critical Demand",
    margin: "16.2%"
  },
  {
    sku: "AYU-DAB-1KG",
    name: "Authentic Chyawanprash Special",
    category: "Ayurveda",
    stock: 140,
    monthlySales: 110,
    turnoverRatio: "3.2x",
    daysOfStock: "38 Days",
    velocity: "Moderate",
    margin: "22.0%"
  },
  {
    sku: "DEV-OMR-BP7",
    name: "Omron Blood Pressure Monitor",
    category: "Medical Devices",
    stock: 0,
    monthlySales: 42,
    turnoverRatio: "4.1x",
    daysOfStock: "0 Days (OOS)",
    velocity: "Stockout",
    margin: "19.5%"
  },
];

const TOP_REVENUE_PRODUCTS = [
  { name: "Blood Glucose Strips 50s", brand: "Accu-Chek", revenue: "₹2,15,820", unitsSold: 180, growth: "+22%" },
  { name: "Cetaphil Gentle Cleanser 500ml", brand: "Cetaphil", revenue: "₹1,85,250", unitsSold: 390, growth: "+14%" },
  { name: "Digital BP Monitor IntelliSense", brand: "Omron", revenue: "₹1,66,410", unitsSold: 90, growth: "+9%" },
  { name: "Paracetamol 500mg Strip Pack", brand: "Cipla", revenue: "₹1,44,000", unitsSold: 450, growth: "+18%" },
  { name: "Multivitamin Immunity Complex", brand: "HealthKart", revenue: "₹1,19,800", unitsSold: 200, growth: "+26%" },
];

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"sales" | "fulfillment" | "inventory">("sales");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [channelFilter, setChannelFilter] = useState("All Channels");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExport = (reportType: string, format: string) => {
    setToastMessage(`Generating ${reportType} (${format})... Download will start automatically.`);
    setTimeout(() => {
      setToastMessage(`✓ ${reportType}.${format.toLowerCase()} exported successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#14304A] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#559620]/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#559620] shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Export Controls */}
      <div className="rounded-2xl border border-[#DCE8D8] bg-white p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EDF7E9] text-[#447719]">
              ANALYTICS &amp; COMPLIANCE INTELLIGENCE
            </span>
            <span className="text-xs text-[#637766]">&bull; Financial Year 2026-27</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14304A]">
            Dispensary Reports &amp; Financial Analytics
          </h1>
          <p className="text-xs text-[#637766] mt-1">
            Comprehensive audit of commercial throughput, clinical order fulfillment SLAs, inventory turnover, and GST filing readiness.
          </p>
        </div>

        {/* Global Export & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Date Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Filter reports by date range"
              className="pl-8 pr-3 py-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] text-xs font-bold text-[#14304A] focus:outline-hidden focus:border-[#559620]"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days (Current)</option>
              <option value="Last Quarter">Last Quarter (Q1 FY26)</option>
              <option value="Financial Year 2026-27">Financial Year 2026-27</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-[#637766] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Channel Selector */}
          <div className="relative">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              aria-label="Filter reports by sales channel"
              className="pl-8 pr-3 py-2 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] text-xs font-bold text-[#14304A] focus:outline-hidden focus:border-[#559620]"
            >
              <option value="All Channels">All Channels (Omni)</option>
              <option value="Retail B2C">Retail Storefront (B2C)</option>
              <option value="Wholesale B2B">B2B Wholesale / Institutional</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-[#637766] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("Genekon_Sales_Revenue_Report", "CSV")}
              className="px-3.5 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Sales CSV</span>
            </button>

            <button
              onClick={() => handleExport("Genekon_GST_Compliance_Tax_Audit", "PDF")}
              className="px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#1853A8]" />
              <span>Export Tax PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Gross B2C & B2B Sales"
          value="₹14,82,450"
          change="+18.4%"
          isPositive={true}
          period="vs prior 30 days"
          icon={DollarSign}
          iconBg="bg-[#EDF7E9]"
          iconColor="text-[#559620]"
        />
        <DashboardCard
          title="Average Order Value (AOV)"
          value="₹1,038"
          change="+6.2%"
          isPositive={true}
          period="Wholesale AOV: ₹5,400"
          icon={ShoppingBag}
          iconBg="bg-[#EBF3FC]"
          iconColor="text-[#1853A8]"
        />
        <DashboardCard
          title="Order Fulfillment SLA"
          value="98.6%"
          change="+1.1%"
          isPositive={true}
          period="Avg Delivery: 3.4 hrs"
          icon={PackageCheck}
          iconBg="bg-[#EDF7E9]"
          iconColor="text-[#447719]"
        />
        <DashboardCard
          title="Inventory Turnover Ratio"
          value="5.4x"
          change="+0.8x"
          isPositive={true}
          period="Days stock held: 21"
          icon={RotateCcw}
          iconBg="bg-[#FFF4E5]"
          iconColor="text-[#D97706]"
        />
      </div>

      {/* Tabbed Navigation */}
      <div className="flex border-b border-[#E2EAE0] gap-2">
        <button
          onClick={() => setActiveTab("sales")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "sales"
              ? "border-[#559620] text-[#559620]"
              : "border-transparent text-[#637766] hover:text-[#14304A]"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales &amp; Revenue Reports</span>
        </button>

        <button
          onClick={() => setActiveTab("fulfillment")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "fulfillment"
              ? "border-[#559620] text-[#559620]"
              : "border-transparent text-[#637766] hover:text-[#14304A]"
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Order Fulfillment &amp; SLAs</span>
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "inventory"
              ? "border-[#559620] text-[#559620]"
              : "border-transparent text-[#637766] hover:text-[#14304A]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Inventory Turnover &amp; Stock Aging</span>
        </button>
      </div>

      {/* TAB 1: SALES & REVENUE REPORTS */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Monthly Progression Chart (Span 8) */}
            <ChartCard
              title="Monthly Revenue Progression (H1 2026)"
              subtitle="Comparison of Gross Revenue, Direct Medicine Costs & Gross Margin (INR in Lakhs)"
              className="lg:col-span-8"
              action={
                <button
                  onClick={() => handleExport("Monthly_Revenue_Trends", "CSV")}
                  className="text-xs text-[#559620] font-bold hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Table</span>
                </button>
              }
            >
              <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#E2EAE0]">
                {SALES_CHART_DATA.map((item, index) => {
                  const maxVal = 1600000;
                  const heightPercent = Math.round((item.revenue / maxVal) * 100);
                  const marginHeight = Math.round(heightPercent * 0.28); // ~28% gross margin
                  const isLatest = index === SALES_CHART_DATA.length - 1;

                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="relative w-full flex flex-col items-center justify-end h-full">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-[#14304A] text-white text-[10px] py-1 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20">
                          ₹{(item.revenue / 100000).toFixed(2)} Lakhs &bull; {item.orders} Orders
                        </div>

                        {/* Combined Stacked Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[42px] rounded-t-lg transition-all flex flex-col justify-end overflow-hidden ${
                            isLatest ? "bg-[#559620]" : "bg-[#6BB032] opacity-85 hover:opacity-100"
                          }`}
                        >
                          {/* Inner Margin Indicator */}
                          <div
                            style={{ height: `${marginHeight}%` }}
                            className="w-full bg-[#3D6E14] opacity-75"
                            title="Gross Margin Component"
                          />
                        </div>
                      </div>

                      {/* Label */}
                      <span className={`text-[11px] font-bold ${isLatest ? "text-[#559620]" : "text-[#637766]"}`}>
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#559620]" />
                    <span className="text-[#14304A] font-medium">Gross Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#3D6E14]" />
                    <span className="text-[#637766]">Gross Margin (~28%)</span>
                  </div>
                </div>
                <div className="text-[#637766]">
                  Highest: <strong className="text-[#14304A]">Sep 2026 (₹14.82 Lakhs)</strong>
                </div>
              </div>
            </ChartCard>

            {/* Channel & Tax Breakdown (Span 4) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Channel Split Card */}
              <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs">
                <h3 className="font-serif text-base font-bold text-[#14304A]">Channel Revenue Distribution</h3>
                <p className="text-xs text-[#637766] mt-0.5 mb-4">Retail customer portal vs B2B wholesale partner accounts</p>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#14304A] flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#559620]" />
                        Retail B2C (Storefront)
                      </span>
                      <span className="font-mono font-bold text-[#14304A]">₹9,85,450 (66.5%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#EBF3FC] overflow-hidden">
                      <div className="h-full bg-[#559620] rounded-full" style={{ width: "66.5%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#14304A] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#1853A8]" />
                        Wholesale B2B (Clinics &amp; Stores)
                      </span>
                      <span className="font-mono font-bold text-[#14304A]">₹4,97,000 (33.5%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#EBF3FC] overflow-hidden">
                      <div className="h-full bg-[#1853A8] rounded-full" style={{ width: "33.5%" }} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-[#FAFCFA] border border-[#E2EAE0] text-[11px] text-[#637766] space-y-1">
                  <div className="flex justify-between">
                    <span>Active Wholesale Partners:</span>
                    <strong className="text-[#14304A]">38 Clinics / Pharmacies</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Retail Repeat Order Rate:</span>
                    <strong className="text-[#559620]">44.2% (Monthly)</strong>
                  </div>
                </div>
              </div>

              {/* GST Tax Summary Card */}
              <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-base font-bold text-[#14304A]">GST Tax Filing Breakdown</h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EDF7E9] text-[#447719]">
                    GSTR-1 Ready
                  </span>
                </div>
                <p className="text-xs text-[#637766] mb-3">Reconciled Indian GST liability across active tax slabs</p>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#F0F5F0]">
                    <span className="text-[#637766]">12% Slab (Essential Medicines):</span>
                    <span className="font-mono font-bold text-[#14304A]">₹88,940</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F0F5F0]">
                    <span className="text-[#637766]">18% Slab (Devices &amp; Derma):</span>
                    <span className="font-mono font-bold text-[#14304A]">₹64,220</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F0F5F0]">
                    <span className="text-[#637766]">5% Slab (Herbal &amp; Ayurveda):</span>
                    <span className="font-mono font-bold text-[#14304A]">₹8,450</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-[#14304A]">
                    <span>Total Tax Liability:</span>
                    <span className="font-mono text-[#559620]">₹1,61,610</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Products Table */}
          <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#14304A]">Top Revenue Contributing Medicines &amp; Devices</h3>
                <p className="text-xs text-[#637766]">Ranked by total sales volume and unit velocity in the current period</p>
              </div>
              <button
                onClick={() => handleExport("Top_Selling_Products_Audit", "CSV")}
                className="px-3 py-1.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] flex items-center gap-1.5 self-start"
              >
                <Download className="w-3.5 h-3.5 text-[#559620]" />
                <span>Export Ranking</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2EAE0] text-[#637766] uppercase text-[10px] tracking-wider bg-[#FAFCFA]">
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Units Dispatched</th>
                    <th className="py-3 px-4">Total Revenue</th>
                    <th className="py-3 px-4">Growth Rate</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EAE0]">
                  {TOP_REVENUE_PRODUCTS.map((prod, i) => (
                    <tr key={i} className="hover:bg-[#F9FCF8] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#14304A] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#EDF7E9] text-[#559620] font-mono text-[10px] flex items-center justify-center font-bold">
                          #{i + 1}
                        </span>
                        {prod.name}
                      </td>
                      <td className="py-3 px-4 text-[#637766]">{prod.brand}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#14304A]">{prod.unitsSold} units</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#559620]">{prod.revenue}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#559620]">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          {prod.growth}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href="/admin/products"
                          className="text-xs text-[#1853A8] font-bold hover:underline"
                        >
                          View Stock
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER FULFILLMENT & SLAS */}
      {activeTab === "fulfillment" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fulfillment Completion Funnel (Span 2) */}
            <div className="lg:col-span-2 rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#14304A]">Dispensary Fulfillment Pipeline &amp; Audit</h3>
                  <p className="text-xs text-[#637766]">Turnaround and quality control check results from prescription receipt to doorstep delivery</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#EDF7E9] text-[#447719]">
                  Live Audited
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {FULFILLMENT_DATA.map((step, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-[#E8EFE6] bg-[#FAFCFA] space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#14304A] text-white text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-[#14304A]">{step.stage}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#637766]">Audit: <strong>{step.count}</strong></span>
                        <span className="font-mono font-bold text-[#559620] px-2 py-0.5 bg-[#EDF7E9] rounded-md">
                          {step.rate}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[#E5ECE3] overflow-hidden">
                      <div
                        className="h-full bg-[#559620] rounded-full"
                        style={{ width: step.rate }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#EDF7E9] border border-[#D5E6CF] text-xs text-[#14304A] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#559620] shrink-0 mt-0.5" />
                <div>
                  <strong>Regulatory SLA Compliance:</strong>
                  <p className="text-[#447719] mt-0.5 text-[11px]">
                    All prescription schedule H verifications were concluded within the statutory 15-minute window by licensed pharmacists with 100% batch traceability.
                  </p>
                </div>
              </div>
            </div>

            {/* Turnaround Time Metrics */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs space-y-4">
                <h3 className="font-serif text-base font-bold text-[#14304A]">Delivery Turnaround Benchmarks</h3>
                <p className="text-xs text-[#637766]">Average duration between order confirmation and customer handshake</p>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#FAFCFA] border border-[#E2EAE0] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#14304A] block">Intra-Nagpur Express</span>
                      <span className="text-[11px] text-[#637766]">Pincodes 440001 - 440035</span>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-[#559620]">2.8 Hours</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFCFA] border border-[#E2EAE0] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#14304A] block">Nagpur Rural &amp; MIDC</span>
                      <span className="text-[11px] text-[#637766]">Hingna, Butibori &amp; Kalmeshwar</span>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-[#1853A8]">6.2 Hours</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFCFA] border border-[#E2EAE0] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#14304A] block">Vidarbha Wholesale Transit</span>
                      <span className="text-[11px] text-[#637766]">Amravati, Wardha, Chandrapur</span>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-[#14304A]">22.5 Hours</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2EAE0] flex items-center justify-between text-xs">
                  <span className="text-[#637766]">Return / Refusal Rate:</span>
                  <span className="font-mono font-bold text-[#559620]">1.2% (Very Low)</span>
                </div>
              </div>

              {/* Delivery Fleet & Cold Chain Status */}
              <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs">
                <h3 className="font-serif text-base font-bold text-[#14304A]">Cold-Chain Integrity Check</h3>
                <p className="text-xs text-[#637766] mt-0.5 mb-3">Temperature records for Insulin and Biologicals (2°C - 8°C)</p>
                <div className="p-3 rounded-xl bg-[#EBF3FC] border border-[#D0E2F7] text-xs space-y-1">
                  <div className="flex justify-between font-bold text-[#1853A8]">
                    <span>Insulin &amp; Vaccine Shipments:</span>
                    <span>320 Dispatched</span>
                  </div>
                  <div className="flex justify-between text-[#14304A]">
                    <span>Temperature Excursions:</span>
                    <span className="text-[#559620] font-bold">0 Violations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY TURNOVER & STOCK AGING */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {/* Top Stock Valuation Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs">
              <span className="text-xs font-bold text-[#637766] uppercase tracking-wider">Total Warehouse Inventory Value</span>
              <div className="font-serif text-2xl font-bold text-[#14304A] mt-1">₹18,40,250</div>
              <span className="text-[11px] text-[#637766] mt-0.5 block">Evaluated at Maximum Retail Price (MRP)</span>
            </div>

            <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs">
              <span className="text-xs font-bold text-[#637766] uppercase tracking-wider">Inventory Holding Cost</span>
              <div className="font-serif text-2xl font-bold text-[#1853A8] mt-1">₹12,88,175</div>
              <span className="text-[11px] text-[#637766] mt-0.5 block">Net purchase cost from manufacturer</span>
            </div>

            <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs">
              <span className="text-xs font-bold text-[#637766] uppercase tracking-wider">Stockout Rate / Lost Demand</span>
              <div className="font-serif text-2xl font-bold text-[#D97706] mt-1">0.8%</div>
              <span className="text-[11px] text-[#637766] mt-0.5 block">Below pharma industry threshold of 2.5%</span>
            </div>
          </div>

          {/* Stock Velocity Table */}
          <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#14304A]">Medicine SKU Turnover &amp; Days of Stock Remaining</h3>
                <p className="text-xs text-[#637766]">Analyzes stock velocity, replenishment requirements and batch profitability</p>
              </div>
              <button
                onClick={() => handleExport("Inventory_Turnover_Velocity_Report", "CSV")}
                className="px-3 py-1.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] flex items-center gap-1.5 self-start"
              >
                <Download className="w-3.5 h-3.5 text-[#559620]" />
                <span>Export Turnover CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2EAE0] text-[#637766] uppercase text-[10px] tracking-wider bg-[#FAFCFA]">
                    <th className="py-3 px-4">SKU Code</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">On-Hand Stock</th>
                    <th className="py-3 px-4">Turnover Ratio</th>
                    <th className="py-3 px-4">Days of Supply</th>
                    <th className="py-3 px-4">Velocity Tier</th>
                    <th className="py-3 px-4 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EAE0]">
                  {INVENTORY_TURNOVER_DATA.map((item) => (
                    <tr key={item.sku} className="hover:bg-[#F9FCF8] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#14304A]">{item.sku}</td>
                      <td className="py-3 px-4 font-bold text-[#14304A]">{item.name}</td>
                      <td className="py-3 px-4 text-[#637766]">{item.category}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#14304A]">{item.stock} units</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#559620]">{item.turnoverRatio}</td>
                      <td className="py-3 px-4 font-mono text-[#14304A]">{item.daysOfStock}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            item.velocity === "Critical Demand"
                              ? "bg-[#FFF4E5] text-[#D97706]"
                              : item.velocity === "Stockout"
                              ? "bg-[#FEECEB] text-[#E02D3C]"
                              : item.velocity === "Fast Moving"
                              ? "bg-[#EDF7E9] text-[#447719]"
                              : "bg-[#F0F5F2] text-[#14304A]"
                          }`}
                        >
                          {item.velocity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#559620] text-right">{item.margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
