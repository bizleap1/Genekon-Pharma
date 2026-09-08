"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Building2,
  AlertTriangle,
  FileText,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  ADMIN_METRICS,
  ADMIN_ORDERS,
  ADMIN_PRESCRIPTIONS,
  ADMIN_WHOLESALE_APPS,
  SALES_CHART_DATA,
  CATEGORY_PERFORMANCE_DATA
} from "@/data/adminData";

export default function AdminDashboardPage() {
  const recentOrders = ADMIN_ORDERS.slice(0, 4);
  const pendingRx = ADMIN_PRESCRIPTIONS.filter((p) => p.status === "Pending Review");
  const wholesaleApps = ADMIN_WHOLESALE_APPS.slice(0, 3);

  const maxRevenue = Math.max(...SALES_CHART_DATA.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert / Welcome */}
      <div className="rounded-2xl border border-[#DCE8D8] bg-linear-to-r from-[#F2F8F0] via-white to-[#F7FAF6] p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EDF7E9] text-[#447719]">
            DISPENSARY OPERATIONS
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14304A] mt-1">
            Central Pharmacy &amp; Wholesale Overview
          </h2>
          <p className="text-xs text-[#637766] mt-0.5">
            Nagpur Regional Fulfillment Centre &bull; All systems operating under schedule H &amp; 20B/21B compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/prescriptions"
            className="px-3.5 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Verify Prescriptions ({pendingRx.length})</span>
          </Link>
          <Link
            href="/admin/products/add"
            className="px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-colors"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <DashboardCard
          title={ADMIN_METRICS.totalRevenue.title}
          value={ADMIN_METRICS.totalRevenue.value}
          change={ADMIN_METRICS.totalRevenue.change}
          isPositive={ADMIN_METRICS.totalRevenue.isPositive}
          period={ADMIN_METRICS.totalRevenue.period}
          icon={DollarSign}
          iconBg="bg-[#EDF7E9]"
          iconColor="text-[#559620]"
        />

        <DashboardCard
          title={ADMIN_METRICS.totalOrders.title}
          value={ADMIN_METRICS.totalOrders.value}
          change={ADMIN_METRICS.totalOrders.change}
          isPositive={ADMIN_METRICS.totalOrders.isPositive}
          period={ADMIN_METRICS.totalOrders.period}
          icon={ShoppingBag}
          iconBg="bg-[#EBF3FC]"
          iconColor="text-[#1853A8]"
        />

        <DashboardCard
          title={ADMIN_METRICS.totalCustomers.title}
          value={ADMIN_METRICS.totalCustomers.value}
          change={ADMIN_METRICS.totalCustomers.change}
          isPositive={ADMIN_METRICS.totalCustomers.isPositive}
          period={ADMIN_METRICS.totalCustomers.period}
          icon={Users}
          iconBg="bg-[#F0F5F2]"
          iconColor="text-[#14304A]"
        />

        <DashboardCard
          title={ADMIN_METRICS.wholesalePartners.title}
          value={ADMIN_METRICS.wholesalePartners.value}
          change={ADMIN_METRICS.wholesalePartners.change}
          isPositive={ADMIN_METRICS.wholesalePartners.isPositive}
          period={ADMIN_METRICS.wholesalePartners.period}
          icon={Building2}
          iconBg="bg-[#EDF7E9]"
          iconColor="text-[#447719]"
        />

        <DashboardCard
          title={ADMIN_METRICS.lowStockCount.title}
          value={ADMIN_METRICS.lowStockCount.value}
          change={ADMIN_METRICS.lowStockCount.change}
          isPositive={ADMIN_METRICS.lowStockCount.isPositive}
          period={ADMIN_METRICS.lowStockCount.period}
          icon={AlertTriangle}
          iconBg="bg-[#FFF6E5]"
          iconColor="text-[#D97706]"
        />

        <DashboardCard
          title={ADMIN_METRICS.pendingPrescriptions.title}
          value={ADMIN_METRICS.pendingPrescriptions.value}
          change={ADMIN_METRICS.pendingPrescriptions.change}
          isPositive={ADMIN_METRICS.pendingPrescriptions.isPositive}
          period={ADMIN_METRICS.pendingPrescriptions.period}
          icon={FileText}
          iconBg="bg-[#FFF4E5]"
          iconColor="text-[#D97706]"
        />
      </div>

      {/* 3 Visual Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sales Overview Bar Chart (Span 7) */}
        <ChartCard
          title="Monthly Revenue Trends"
          subtitle="6-Month revenue & order progression (INR in Lakhs)"
          className="lg:col-span-7"
        >
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {SALES_CHART_DATA.map((d, i) => {
              const heightPercent = Math.round((d.revenue / maxRevenue) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-[#677C6A] opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{(d.revenue / 100000).toFixed(1)}L
                  </span>
                  <div className="w-full max-w-[36px] bg-[#E8F0E6] rounded-t-lg overflow-hidden flex flex-col justify-end h-44">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-[#559620] group-hover:bg-[#467E19] transition-all rounded-t-md"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#14304A]">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-[#EDF3EC] flex items-center justify-between text-xs text-[#637766]">
            <span>Average Monthly Growth: <strong className="text-[#559620]">+11.2%</strong></span>
            <span>Current September Run-rate: <strong className="text-[#14304A]">₹14.82 Lakh</strong></span>
          </div>
        </ChartCard>

        {/* Category Performance Breakdown (Span 5) */}
        <ChartCard
          title="Category Sales Performance"
          subtitle="Revenue share across clinical categories"
          className="lg:col-span-5"
        >
          <div className="space-y-4 py-2">
            {CATEGORY_PERFORMANCE_DATA.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#14304A]">{cat.name}</span>
                  <span className="text-[#5D7360]">{cat.revenue} ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EDF3EC] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-3 border-t border-[#EDF3EC] text-xs text-[#637766]">
            <span>Top Performing Sector: <strong className="text-[#559620]">Prescription Medicines</strong> (42%)</span>
          </div>
        </ChartCard>

      </div>

      {/* Recent Activity 3-Column Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Queue */}
        <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EDF3EC]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#559620]" />
                <h3 className="font-serif text-base font-bold text-[#14304A]">
                  Recent Orders
                </h3>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-[#559620] hover:underline"
              >
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-xl border border-[#EDF3EC] bg-[#FAFCFA] hover:bg-white hover:border-[#CCDCCD] transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono font-bold text-[#14304A] hover:text-[#1853A8]"
                      >
                        {order.id}
                      </Link>
                      <StatusBadge status={order.orderStatus} size="sm" />
                    </div>
                    <p className="text-[11px] text-[#637766] mt-0.5">
                      {order.customerName} &bull; {order.itemCount} items
                    </p>
                  </div>
                  <span className="font-extrabold text-[#14304A]">
                    ₹{order.totalAmount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#EDF3EC] mt-4">
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#559620] hover:underline flex items-center justify-between"
            >
              <span>Manage all active dispatches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Prescription Verification Feed */}
        <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EDF3EC]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D97706]" />
                <h3 className="font-serif text-base font-bold text-[#14304A]">
                  Rx Review Queue
                </h3>
              </div>
              <Link
                href="/admin/prescriptions"
                className="text-xs font-bold text-[#559620] hover:underline"
              >
                Review All &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {pendingRx.map((rx) => (
                <div
                  key={rx.id}
                  className="p-3 rounded-xl border border-[#FFF0D4] bg-[#FFFBF4] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#14304A]">
                        {rx.id}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-[#FFF6E5] text-[#D97706]">
                        Needs Review
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#14304A] mt-0.5">
                      {rx.customerName}
                    </p>
                    <p className="text-[11px] text-[#697E6C]">
                      {rx.doctorName}
                    </p>
                  </div>

                  <Link
                    href="/admin/prescriptions"
                    className="px-2.5 py-1 rounded-lg bg-[#559620] text-white font-bold text-[11px] hover:bg-[#467E19]"
                  >
                    Verify
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#EDF3EC] mt-4">
            <Link
              href="/admin/prescriptions"
              className="text-xs font-bold text-[#559620] hover:underline flex items-center justify-between"
            >
              <span>View full verification queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Wholesale B2B Registrations */}
        <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EDF3EC]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1853A8]" />
                <h3 className="font-serif text-base font-bold text-[#14304A]">
                  Wholesale Partners
                </h3>
              </div>
              <Link
                href="/admin/wholesale"
                className="text-xs font-bold text-[#559620] hover:underline"
              >
                Manage B2B &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {wholesaleApps.map((app) => (
                <div
                  key={app.id}
                  className="p-3 rounded-xl border border-[#EDF3EC] bg-[#FAFCFA] flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-[#14304A]">
                      {app.businessName}
                    </h4>
                    <p className="text-[11px] text-[#637766]">
                      {app.businessType} &bull; {app.city}
                    </p>
                    <p className="font-mono text-[10px] text-[#788E7A] mt-0.5">
                      GST: {app.gstNumber}
                    </p>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#EDF3EC] mt-4">
            <Link
              href="/admin/wholesale"
              className="text-xs font-bold text-[#559620] hover:underline flex items-center justify-between"
            >
              <span>Review B2B verification queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
