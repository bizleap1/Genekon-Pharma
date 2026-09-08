"use client";

import React, { useState } from "react";
import { Tag, Plus, CheckCircle2, Clock, Trash2, Edit2, Download } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FormInput } from "@/components/admin/FormInput";
import { ADMIN_COUPONS, AdminCoupon } from "@/data/adminData";

export default function AdminOffersPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>(ADMIN_COUPONS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "Percentage" as "Percentage" | "Fixed",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    expiryDate: "",
  });
  const [alertMsg, setAlertMsg] = useState("");

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AdminCoupon = {
      id: `cpn-${Date.now()}`,
      code: newCoupon.code.toUpperCase(),
      discountType: newCoupon.discountType,
      discountValue: parseFloat(newCoupon.discountValue) || 10,
      minOrderValue: parseFloat(newCoupon.minOrderValue) || 499,
      maxDiscount: parseFloat(newCoupon.maxDiscount) || undefined,
      expiryDate: newCoupon.expiryDate || "2026-12-31",
      redemptionsCount: 0,
      status: "Active",
    };
    setCoupons((prev) => [created, ...prev]);
    setShowAddForm(false);
    setAlertMsg(`Coupon ${created.code} successfully created and active.`);
    setTimeout(() => setAlertMsg(""), 3000);
  };

  const columns = [
    {
      header: "Coupon Code",
      render: (c: AdminCoupon) => (
        <code className="font-mono text-xs font-extrabold bg-[#F2F7F1] text-[#14304A] px-2.5 py-1 rounded-md border border-[#D5E4D2]">
          {c.code}
        </code>
      ),
    },
    {
      header: "Discount Rule",
      render: (c: AdminCoupon) => (
        <span className="font-bold text-[#559620]">
          {c.discountType === "Percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
        </span>
      ),
    },
    {
      header: "Thresholds",
      render: (c: AdminCoupon) => (
        <div className="text-xs text-[#59705E]">
          <p>Min Order: ₹{c.minOrderValue}</p>
          {c.maxDiscount && <p>Max Discount: ₹{c.maxDiscount}</p>}
        </div>
      ),
    },
    {
      header: "Redemptions",
      render: (c: AdminCoupon) => (
        <span className="font-bold text-[#14304A]">
          {c.redemptionsCount} used
        </span>
      ),
    },
    {
      header: "Expiry Date",
      render: (c: AdminCoupon) => (
        <span className="text-xs text-[#6F8271] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {c.expiryDate}
        </span>
      ),
    },
    {
      header: "Status",
      render: (c: AdminCoupon) => <StatusBadge status={c.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#14304A]">
            Coupons &amp; Promotional Offers
          </h2>
          <p className="text-xs text-[#637766] mt-0.5">
            Configure cart discounts, promotional vouchers, and customer acquisition discount rules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? "Close Form" : "Create New Coupon"}</span>
        </button>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-2xl bg-[#EDF7E9] border border-[#CDE5C8] text-[#447719] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#559620]" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Coupon Creation Card */}
      {showAddForm && (
        <div className="rounded-3xl border border-[#DCE8D8] bg-white p-6 sm:p-8 shadow-xs">
          <h3 className="font-serif text-lg font-bold text-[#14304A] pb-3 mb-4 border-b border-[#E3EDE1]">
            Create Promotional Coupon
          </h3>

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="Coupon Code *"
                required
                placeholder="e.g. WELLNESS25"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
              />

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14304A]">
                  Discount Type *
                </label>
                <select
                  value={newCoupon.discountType}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620]"
                >
                  <option value="Percentage">Percentage Discount (%)</option>
                  <option value="Fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <FormInput
                label={newCoupon.discountType === "Percentage" ? "Discount Percentage (%)" : "Discount Amount (₹)"}
                type="number"
                required
                placeholder={newCoupon.discountType === "Percentage" ? "20" : "150"}
                value={newCoupon.discountValue}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="Minimum Order Value (₹) *"
                type="number"
                required
                placeholder="499"
                value={newCoupon.minOrderValue}
                onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
              />

              <FormInput
                label="Max Discount Cap (₹ Optional)"
                type="number"
                placeholder="300"
                value={newCoupon.maxDiscount}
                onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
              />

              <FormInput
                label="Expiry Date *"
                type="date"
                required
                value={newCoupon.expiryDate}
                onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
              />
            </div>

            <div className="pt-3 border-t border-[#E3EDE1] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-[#CCDCCD] text-xs font-bold text-[#14304A]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Publish Coupon &rarr;
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <DataTable
        columns={columns}
        data={coupons}
        emptyMessage="No promotional coupons found."
      />

    </div>
  );
}
