"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  UploadCloud,
  FileText,
  AlertCircle
} from "lucide-react";
import { FormInput } from "@/components/admin/FormInput";
import { UploadBox } from "@/components/admin/UploadBox";

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Medicines",
    sku: "",
    mrp: "",
    sellingPrice: "",
    gstRate: "12",
    stockQuantity: "",
    composition: "",
    description: "",
    prescriptionRequired: false,
    status: "Active",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      router.push("/admin/products");
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E2EAE0]">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#559620] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Product Catalog</span>
          </Link>
          <h2 className="font-serif text-2xl font-bold text-[#14304A]">
            Add New Healthcare Product
          </h2>
          <p className="text-xs text-[#637766] mt-0.5">
            Enter medicine specifications, manufacturer details, taxation, and stock allocation.
          </p>
        </div>
      </div>

      {submitted && (
        <div className="p-4 rounded-2xl bg-[#EDF7E9] border border-[#CDE5C8] text-[#447719] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#559620]" />
          <span>Product created and published to Genekon catalog! Redirecting...</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <div className="rounded-2xl border border-[#E2EAE0] bg-white p-6 shadow-2xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#14304A] pb-3 border-b border-[#EDF3EC]">
            1. Basic Product Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Product Name"
              required
              placeholder="e.g. Paracetamol 500 mg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <FormInput
              label="Brand / Manufacturer"
              required
              placeholder="e.g. Cipla, Dr. Reddy's, Cetaphil"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#14304A]">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620]"
              >
                <option value="Medicines">Medicines</option>
                <option value="Vitamins & Nutrition">Vitamins &amp; Nutrition</option>
                <option value="Medical Devices">Medical Devices</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Ayurveda">Ayurveda</option>
                <option value="Baby Care">Baby Care</option>
                <option value="Healthcare">Healthcare Essentials</option>
              </select>
            </div>

            <FormInput
              label="SKU Code"
              required
              placeholder="e.g. MED-CIP-500"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14304A] mb-1">
              Active Chemical Salt / Composition *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Paracetamol IP 500mg, Caffeine 30mg"
              value={formData.composition}
              onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14304A] mb-1">
              Product Description &amp; Usage Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Detailed indications, precautions, and dosage instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620]"
            />
          </div>
        </div>

        {/* Product Media */}
        <div className="rounded-2xl border border-[#E2EAE0] bg-white p-6 shadow-2xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#14304A] pb-3 border-b border-[#EDF3EC]">
            2. Product Visual Asset
          </h3>
          <UploadBox
            label="Primary Product Image"
            initialPreview="/images/products/cipla-paracetamol-v2.jpg"
            helperText="1024x1024 studio shot on clean background (PNG or JPG)"
          />
        </div>

        {/* Pricing, Tax & Inventory */}
        <div className="rounded-2xl border border-[#E2EAE0] bg-white p-6 shadow-2xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#14304A] pb-3 border-b border-[#EDF3EC]">
            3. Pricing, Taxation &amp; Inventory Stock
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <FormInput
              label="MRP (₹)"
              type="number"
              required
              placeholder="40"
              value={formData.mrp}
              onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
            />

            <FormInput
              label="Selling Price (₹)"
              type="number"
              required
              placeholder="32"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
            />

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#14304A]">
                GST Slab (%) *
              </label>
              <select
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620]"
              >
                <option value="5">5% (Life-saving essentials)</option>
                <option value="12">12% (Standard pharmaceutical)</option>
                <option value="18">18% (Devices &amp; personal care)</option>
                <option value="0">0% (Exempt items)</option>
              </select>
            </div>

            <FormInput
              label="Stock Units"
              type="number"
              required
              placeholder="100"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-[#EDF3EC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Prescription toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.prescriptionRequired}
                onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
                className="rounded h-4 w-4 text-[#559620] focus:ring-[#559620]"
              />
              <div>
                <span className="text-xs font-bold text-[#14304A] block">
                  Schedule H Prescription Required (Rx)
                </span>
                <span className="text-[11px] text-[#697D6B]">
                  Requires pharmacist verification before dispatch
                </span>
              </div>
            </label>

            {/* Status Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#14304A]">Status:</span>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none"
              >
                <option value="Active">Active (Visible)</option>
                <option value="Draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-[#CCDCCD] text-xs font-bold text-[#14304A] hover:bg-[#F2F7F2]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Publish Product &rarr;</span>
          </button>
        </div>

      </form>

    </div>
  );
}
