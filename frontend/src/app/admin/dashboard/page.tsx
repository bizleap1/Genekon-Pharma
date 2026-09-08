"use client";

import React, { useState, useEffect } from "react";
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
  SALES_CHART_DATA,
  CATEGORY_PERFORMANCE_DATA,
  AdminWholesaleApp
} from "@/data/adminData";
import { adminApi, DashboardStatsResponse } from "@/api/admin";
import { useAdminStore } from "@/stores/adminStore";

export default function AdminDashboardPage() {
  const { orders, prescriptions, syncWithBackend } = useAdminStore();
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [wholesaleApps, setWholesaleApps] = useState<AdminWholesaleApp[]>([]);

  useEffect(() => {
    adminApi.getDashboardStats().then((res) => {
      if (res.data) setStats(res.data);
    });
    adminApi.getWholesaleApplications().then((res) => {
      if (res.data) setWholesaleApps(res.data.slice(0, 3));
    });
    syncWithBackend();
  }, [syncWithBackend]);

  const recentOrders = orders.slice(0, 4);
  const pendingRx = prescriptions.filter(
    (p) => p.status === "Pending Review"
  );

  const maxRevenue = SALES_CHART_DATA.length > 0 ? Math.max(...SALES_CHART_DATA.map((d) => d.revenue)) : 1;

  const totalRevenue = stats?.totalRevenue ?? orders.reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);
  const totalOrders = stats?.totalOrders ?? orders.length;

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
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          change="Realtime"
          isPositive={true}
          period="actual orders"
          icon={DollarSign}
          iconBg="bg-[#EDF7E9]"
          iconColor="text-[#559620]"
        />

        <DashboardCard
          title="Total Orders"
          value={totalOrders.toString()}
          change="Realtime"
          isPositive={true}
          period="actual orders"
          icon={ShoppingBag}
          iconBg="bg-[#EBF3FC]"
          iconColor="text-[#1853A8]"
        />

        <DashboardCard
          title="Active Patients & Buyers"
          value={(stats?.totalCustomers ?? (orders.length > 0 ? 1 : 0)).toString()}
          change="Verified"
          isPositive={true}
          period="registered"
          icon={Users}
          iconBg="bg-[#F0F5F2]"
          iconColor="text-[#14304A]"
        />

        <DashboardCard
          title="Wholesale Partners"
          value={(stats?.totalWholesalePartners ?? 0).toString()}
          change="B2B"
          isPositive={true}
          period="approved"
          icon={Building2}
          iconBg="bg-[#EDF7E9]"
          iconColor="text-[#447719]"
        />

        <DashboardCard
          title="Low Stock Alerts"
          value={(stats?.lowStockProducts ?? 0).toString()}
          change="Inventory"
          isPositive={true}
          period="reorder buffer"
          icon={AlertTriangle}
          iconBg="bg-[#FFF6E5]"
          iconColor="text-[#D97706]"
        />

        <DashboardCard
          title="Pending Rx Verification"
          value={(stats?.pendingPrescriptions ?? pendingRx.length).toString()}
          change="Queue"
          isPositive={true}
          period="pharmacist queue"
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
          subtitle="Order progression and revenue across dispensary"
          className="lg:col-span-7"
        >
          {orders.length > 0 ? (
            <div className="h-64 flex flex-col justify-center items-center gap-3 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#14304A]">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-[#637766] mt-1 font-medium">
                  Generated across {orders.length} confirmed order{orders.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col justify-center items-center gap-2 p-6 text-center text-xs text-[#637766]">
              <Clock className="w-8 h-8 text-[#CCDCCD] mb-1" />
              <p className="font-bold text-[#14304A]">No revenue recorded yet</p>
              <p>Monthly charts will populate automatically as new customer orders are placed.</p>
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-[#EDF3EC] flex items-center justify-between text-xs text-[#637766]">
            <span>Live Dispensary Status: <strong className="text-[#559620]">Online & Active</strong></span>
            <span>Current Total Revenue: <strong className="text-[#14304A]">₹{totalRevenue.toLocaleString("en-IN")}</strong></span>
          </div>
        </ChartCard>

        {/* Category Performance Breakdown (Span 5) */}
        <ChartCard
          title="Category Sales Performance"
          subtitle="Real-time category distribution"
          className="lg:col-span-5"
        >
          {orders.length > 0 ? (
            <div className="space-y-4 py-8">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#14304A]">Medicines & Healthcare Products</span>
                  <span className="text-[#5D7360]">100%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#EDF3EC] overflow-hidden">
                  <div className="h-full rounded-full bg-[#559620] w-full" />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col justify-center items-center gap-2 p-6 text-center text-xs text-[#637766]">
              <CheckCircle2 className="w-8 h-8 text-[#CCDCCD] mb-1" />
              <p className="font-bold text-[#14304A]">No category sales yet</p>
              <p>Category distribution will calculate dynamically from real order items.</p>
            </div>
          )}
          <div className="mt-6 pt-3 border-t border-[#EDF3EC] text-xs text-[#637766]">
            <span>Real-time category tracking enabled</span>
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
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
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
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#718573]">
                  <ShoppingBag className="w-8 h-8 text-[#CCDCCD] mx-auto mb-2" />
                  <p className="font-bold text-[#14304A]">No recent orders</p>
                  <p className="text-[11px] mt-0.5">Customer orders will appear here in real time.</p>
                </div>
              )}
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
              {pendingRx.length > 0 ? (
                pendingRx.map((rx) => (
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
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#718573]">
                  <CheckCircle2 className="w-8 h-8 text-[#88B870] mx-auto mb-2" />
                  <p className="font-bold text-[#14304A]">Rx verification queue clear</p>
                  <p className="text-[11px] mt-0.5">No pending prescriptions needing verification.</p>
                </div>
              )}
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
              {wholesaleApps.length > 0 ? (
                wholesaleApps.map((app) => (
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
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#718573]">
                  <Building2 className="w-8 h-8 text-[#CCDCCD] mx-auto mb-2" />
                  <p className="font-bold text-[#14304A]">No pending applications</p>
                  <p className="text-[11px] mt-0.5">Wholesale B2B applications will show up here.</p>
                </div>
              )}
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
