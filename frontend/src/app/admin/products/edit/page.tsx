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
  Trash2
} from "lucide-react";
import { FormInput } from "@/components/admin/FormInput";
import { UploadBox } from "@/components/admin/UploadBox";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useToast } from "@/context/ToastContext";

export default function EditProductPage() {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "Cetaphil Gentle Skin Cleanser",
    brand: "Cetaphil",
    category: "Personal Care",
    sku: "DER-CET-500",
    mrp: "579",
    sellingPrice: "475",
    gstRate: "18",
    stockQuantity: "92",
    composition: "Niacinamide + Panthenol + Glycerin formula",
    description: "Dermatologist-recommended soothing cleanser for dry and sensitive skin.",
    prescriptionRequired: false,
    status: "Active",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-bold text-[#14304A]">
              Edit: {formData.name}
            </h2>
            <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-[#EDF7E9] text-[#447719]">
              {formData.sku}
            </span>
          </div>
          <p className="text-xs text-[#637766] mt-0.5">
            Modify product pricing, stock thresholds, and therapeutic specifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="p-2 rounded-xl text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
          title="Delete product"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {submitted && (
        <div className="p-4 rounded-2xl bg-[#EDF7E9] border border-[#CDE5C8] text-[#447719] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#559620]" />
          <span>Product updates saved successfully! Redirecting...</span>
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <FormInput
              label="Brand / Manufacturer"
              required
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
                <option value="Personal Care">Personal Care</option>
                <option value="Medicines">Medicines</option>
                <option value="Vitamins & Nutrition">Vitamins &amp; Nutrition</option>
                <option value="Medical Devices">Medical Devices</option>
                <option value="Ayurveda">Ayurveda</option>
              </select>
            </div>

            <FormInput
              label="SKU Code"
              required
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
              value={formData.composition}
              onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14304A] mb-1">
              Product Description
            </label>
            <textarea
              rows={3}
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
            label="Product Image"
            initialPreview="/images/products/cetaphil-cleanser-v2.jpg"
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
              value={formData.mrp}
              onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
            />

            <FormInput
              label="Selling Price (₹)"
              type="number"
              required
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
            />

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#14304A]">
                GST Slab (%)
              </label>
              <select
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620]"
              >
                <option value="18">18%</option>
                <option value="12">12%</option>
                <option value="5">5%</option>
                <option value="0">0%</option>
              </select>
            </div>

            <FormInput
              label="Stock Quantity"
              type="number"
              required
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-[#EDF3EC] flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.prescriptionRequired}
                onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
                className="rounded h-4 w-4 text-[#559620] focus:ring-[#559620]"
              />
              <span className="text-xs font-bold text-[#14304A]">
                Prescription Required (Schedule H / Rx)
              </span>
            </label>

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
            <span>Save Changes</span>
          </button>
        </div>

      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${formData.name}"? This action cannot be undone.`}
        confirmLabel="Delete Product"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={() => {
          toast.success(`Product "${formData.name}" deleted.`);
          setIsDeleteModalOpen(false);
          router.push("/admin/products");
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

    </div>
  );
}
