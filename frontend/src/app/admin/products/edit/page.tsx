"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Pill,
  Droplets,
  ShieldCheck,
  Eye,
  RefreshCw,
  Trash2,
  HelpCircle,
  DollarSign,
  Thermometer,
  ExternalLink
} from "lucide-react";
import { adminApi } from "@/api/admin";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";

// Packaging Presets
const IMAGE_PRESETS = [
  {
    id: "tablets",
    name: "Tablets Blister Strip",
    url: "/images/products/genekon-tablets-pack.jpg",
    badge: "Tablets / Strips",
  },
  {
    id: "capsules",
    name: "Capsules Bottle",
    url: "/images/products/genekon-capsules-bottle.jpg",
    badge: "Capsules / Softgels",
  },
  {
    id: "syrup",
    name: "Syrup / Liquid Bottle",
    url: "/images/products/genekon-syrup-bottle.jpg",
    badge: "Oral Liquid / Syrup",
  },
  {
    id: "ointment",
    name: "Ointment / Gel Tube",
    url: "/images/products/genekon-ointment-tube.jpg",
    badge: "Cream / Topical Gel",
  },
  {
    id: "inhaler",
    name: "Respiratory Inhaler",
    url: "/images/products/genekon-inhaler-device.jpg",
    badge: "Inhaler / MDI",
  },
  {
    id: "drops",
    name: "Sterile Eye / Ear Drops",
    url: "/images/products/genekon-eye-drops.jpg",
    badge: "Ophthalmic Drops",
  },
  {
    id: "powder",
    name: "Protein / Health Powder",
    url: "/images/products/genekon-health-powder.jpg",
    badge: "Powder / Granules",
  },
  {
    id: "device",
    name: "Diagnostic Health Monitor",
    url: "/images/products/genekon-diagnostic-device.jpg",
    badge: "Medical Device",
  },
];

const PACK_SIZE_OPTIONS = [
  "1 Strip of 10 Tablets",
  "1 Strip of 15 Tablets",
  "1 Strip of 20 Tablets",
  "1 Bottle of 30 Capsules",
  "1 Bottle of 60 Capsules",
  "1 Bottle of 100 ml (Syrup)",
  "1 Bottle of 200 ml (Syrup)",
  "1 Tube of 20g (Ointment)",
  "1 Tube of 30g (Gel)",
  "1 Inhaler (200 Metered Doses)",
  "1 Sterile Vial of 10 ml (Drops)",
  "1 Jar of 200g (Powder)",
  "1 Jar of 400g (Powder)",
  "1 Single Device Unit",
];

function EditProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id") || "";

  // State
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    manufacturer: "",
    categoryId: "",
    sku: "",
    mrp: "",
    sellingPrice: "",
    gst: "12",
    stockQuantity: "50",
    dosageForm: "10 Tablets / Strip",
    composition: "",
    strength: "",
    route: "",
    productType: "OTHER",
    description: "",
    usage: "",
    precautions: "",
    storageInstructions: "Store below 25°C in a cool and dry place away from direct sunlight.",
    prescriptionRequired: false,
    status: "ACTIVE",
    image: "/images/products/genekon-tablets-pack.jpg",
    customImageUrl: "",
  });

  // Load product and categories
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Fetch categories
        const catRes = await adminApi.getCategories({ flat: true });
        let catList: any[] = [];
        if (catRes.data && Array.isArray(catRes.data)) {
          catList = catRes.data;
        } else if (catRes.data && Array.isArray((catRes.data as any).categories)) {
          catList = (catRes.data as any).categories;
        }
        if (catList.length > 0) {
          const sorted = catList
            .map((c) => ({ id: c.id, name: c.name, slug: c.slug }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setCategories(sorted);
        }

        // 2. If productId exists, fetch product details
        if (productId) {
          const prodRes = await adminApi.getProduct(productId);
          const p = prodRes.data?.product || prodRes.data;
          if (p) {
            const rawImg =
              p.images?.[0]?.imageUrl ||
              p.image ||
              "/images/products/genekon-tablets-pack.jpg";

            const isKnownPreset = IMAGE_PRESETS.some((preset) => preset.url === rawImg);

            setFormData({
              name: p.name || "",
              brand: p.brand || "Genekon",
              manufacturer: p.manufacturer || p.brand || "Genekon Pharmaceuticals Pvt Ltd",
              categoryId: p.categoryId || p.category?.id || "",
              sku: p.sku || "",
              mrp: String(p.mrp || 100),
              sellingPrice: String(p.sellingPrice || 80),
              gst: String(p.gst || 12),
              stockQuantity: String(p.stockQuantity !== undefined ? p.stockQuantity : 50),
              dosageForm: p.dosageForm || "10 Tablets / Strip",
              composition: p.composition || "",
              strength: p.strength || "",
              route: p.route || "",
              productType: p.productType || "OTHER",
              description: p.description || "",
              usage: p.usage || "",
              precautions: p.precautions || "",
              storageInstructions:
                p.storageInstructions || "Store below 25°C in a cool and dry place away from direct sunlight.",
              prescriptionRequired: Boolean(p.prescriptionRequired),
              status: p.status || "ACTIVE",
              image: isKnownPreset ? rawImg : "/images/products/genekon-tablets-pack.jpg",
              customImageUrl: isKnownPreset ? "" : rawImg,
            });
          }
        }
      } catch (err: any) {
        console.error("Error loading product:", err);
        setErrorMessage("Could not load product details. Please return to catalog.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [productId]);

  // Pricing calculations
  const mrpNum = Number(formData.mrp) || 0;
  const priceNum = Number(formData.sellingPrice) || 0;
  const discountAmount = mrpNum > priceNum ? mrpNum - priceNum : 0;
  const discountPercent = mrpNum > 0 && mrpNum > priceNum ? Math.round((discountAmount / mrpNum) * 100) : 0;
  const isPriceValid = mrpNum > 0 && priceNum > 0 && priceNum <= mrpNum;

  // Handle Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Please enter a valid product name.");
      return;
    }
    if (priceNum > mrpNum) {
      setErrorMessage("Selling price cannot exceed Maximum Retail Price (MRP).");
      return;
    }

    const effectiveImage = formData.customImageUrl.trim() || formData.image;

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      manufacturer: formData.manufacturer.trim() || formData.brand.trim(),
      categoryId: formData.categoryId || undefined,
      sku: formData.sku.trim().toUpperCase(),
      mrp: mrpNum,
      sellingPrice: priceNum,
      discount: discountPercent,
      gst: Number(formData.gst) || 12,
      stockQuantity: Number(formData.stockQuantity) || 0,
      dosageForm: formData.dosageForm || "10 Tablets / Strip",
      composition: formData.composition.trim() || formData.name.trim(),
      strength: formData.strength.trim(),
      route: formData.route.trim(),
      productType: formData.productType,
      description: formData.description.trim(),
      usage: formData.usage.trim(),
      precautions: formData.precautions.trim(),
      storageInstructions: formData.storageInstructions.trim(),
      prescriptionRequired: formData.prescriptionRequired,
      status: formData.status,
      image: effectiveImage,
    };

    try {
      setSubmitting(true);
      const res = await adminApi.updateProduct(productId, payload);
      if (res.success || (res as any).data) {
        setSuccessMessage("Product specifications and pricing updated successfully!");
        setTimeout(() => {
          router.push("/admin/products");
        }, 1200);
      } else {
        setErrorMessage(res.message || "Failed to update product.");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      setErrorMessage(err.message || "Network error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await adminApi.deleteProduct(productId);
      setIsDeleteModalOpen(false);
      router.push("/admin/products");
    } catch (err: any) {
      console.error("Delete error:", err);
      setErrorMessage(err.message || "Failed to delete product.");
      setIsDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const selectedCategoryName = useMemo(() => {
    return categories.find((c) => c.id === formData.categoryId)?.name || "Therapeutic Segment";
  }, [categories, formData.categoryId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#559620] animate-spin" />
        <p className="text-xs font-bold text-[#637766]">Loading product specifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2EAE0]">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#559620] hover:underline mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Product Catalog</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14304A]">
              Edit Product
            </h1>
            {productId && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#EDF3EC] text-[#526657]">
                {formData.sku || productId.slice(0, 8)}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#637766] mt-0.5">
            Update pricing, clinical composition, instructions, and stock allocation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {productId && (
            <Link
              href={`/product/${productId}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-all shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#559620]" />
              <span>View Storefront</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-xs font-bold text-red-600 transition-all cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-[#EDF7E9] border border-[#CDE5C8] text-[#447719] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#559620] shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 2-Column Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Form Inputs (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Identification & Classification */}
          <div className="rounded-3xl border border-[#E0EBE0] bg-white p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#14304A] pb-3 border-b border-[#EDF3EC]">
              1. Basic Product Information
            </h3>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Product / Medicine Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
              />
            </div>

            {/* Brand and Manufacturer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Category & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  Therapeutic Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  SKU Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white uppercase transition-all"
                />
              </div>
            </div>

            {/* Prescription & Status Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-2xl bg-[#F9FCF8] border border-[#E0ECE0]">
                <span className="block text-xs font-bold text-[#14304A] mb-1">
                  Prescription Requirement
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#14304A] cursor-pointer">
                    <input
                      type="radio"
                      name="prescriptionRequired"
                      checked={!formData.prescriptionRequired}
                      onChange={() => setFormData({ ...formData, prescriptionRequired: false })}
                      className="accent-[#559620]"
                    />
                    <span>OTC (No Rx)</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary cursor-pointer">
                    <input
                      type="radio"
                      name="prescriptionRequired"
                      checked={formData.prescriptionRequired}
                      onChange={() => setFormData({ ...formData, prescriptionRequired: true })}
                      className="accent-[#1853A8]"
                    />
                    <span className="font-bold">Rx Mandatory (Schedule H)</span>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F9FCF8] border border-[#E0ECE0]">
                <span className="block text-xs font-bold text-[#14304A] mb-1">
                  Catalog Status
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  {["ACTIVE", "DRAFT", "ARCHIVED"].map((st) => (
                    <label
                      key={st}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#14304A] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="catalogStatus"
                        checked={formData.status === st}
                        onChange={() => setFormData({ ...formData, status: st })}
                        className="accent-[#559620]"
                      />
                      <span>{st}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Clinical Details */}
          <div className="rounded-3xl border border-[#E0EBE0] bg-white p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#14304A] pb-3 border-b border-[#EDF3EC]">
              2. Pharmaceutical Composition &amp; Clinical Information
            </h3>

            {/* Composition */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Active Chemical Composition / Salt *
              </label>
              <input
                type="text"
                required
                value={formData.composition}
                onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
              />
            </div>
            {/* Product Type, Strength & Route */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  Product Type *
                </label>
                <select
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
                >
                  <option value="BRANDED">Branded Medicine</option>
                  <option value="GENERIC">Generic Medicine</option>
                  <option value="OTHER">Other Product</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  Strength (e.g. 500 mg)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500 mg"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  Route of Admin
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oral, Topical"
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
                />
              </div>
            </div>
            {/* Dosage Form */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Dosage Form &amp; Packaging Size *
              </label>
              <input
                type="text"
                required
                value={formData.dosageForm}
                onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all mb-2"
              />

              <div className="flex flex-wrap gap-1.5">
                {PACK_SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({ ...formData, dosageForm: opt })}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      formData.dosageForm === opt
                        ? "bg-[#EBF5E7] text-[#559620] border-[#559620] font-bold"
                        : "bg-[#FAFCFB] text-[#637766] border-[#DCE8D8] hover:border-[#559620]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Product Description &amp; Overview
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620] focus:bg-white transition-all leading-relaxed"
              />
            </div>

            {/* Usage */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Directions for Use &amp; Dosage Guidelines
              </label>
              <textarea
                rows={3}
                value={formData.usage}
                onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620] focus:bg-white transition-all leading-relaxed"
              />
            </div>

            {/* Precautions */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Safety Advice, Warnings &amp; Precautions
              </label>
              <textarea
                rows={3}
                value={formData.precautions}
                onChange={(e) => setFormData({ ...formData, precautions: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620] focus:bg-white transition-all leading-relaxed"
              />
            </div>

            {/* Storage */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Storage Instructions
              </label>
              <input
                type="text"
                value={formData.storageInstructions}
                onChange={(e) => setFormData({ ...formData, storageInstructions: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
              />
            </div>

          </div>

          {/* Section 3: Pricing & Stock */}
          <div className="rounded-3xl border border-[#E0EBE0] bg-white p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#14304A] pb-3 border-b border-[#EDF3EC]">
              3. Pricing, Taxation &amp; Inventory Stock
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  MRP (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#637766]">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full text-xs pl-8 pr-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-bold outline-none focus:border-[#559620] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  Selling Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#559620]">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full text-xs pl-8 pr-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-bold outline-none focus:border-[#559620] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  Current Stock (Units) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-bold outline-none focus:border-[#559620] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  GST Rate (%)
                </label>
                <select
                  value={formData.gst}
                  onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-bold outline-none focus:border-[#559620] focus:bg-white"
                >
                  <option value="0">0% (Nil)</option>
                  <option value="5">5% (Life Saving)</option>
                  <option value="12">12% (Standard Medicines)</option>
                  <option value="18">18% (Cosmetics / Devices)</option>
                  <option value="28">28% (Luxury)</option>
                </select>
              </div>
            </div>

            {/* Banner */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#E0EBE0] flex items-center justify-between flex-wrap gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#718573] uppercase font-bold block">
                  Calculated Discount
                </span>
                <span
                  className={`font-bold text-sm ${
                    discountPercent > 0 ? "text-[#559620]" : "text-[#718573]"
                  }`}
                >
                  {discountPercent > 0
                    ? `₹${discountAmount.toFixed(2)} (${discountPercent}% OFF)`
                    : "No Discount (Sold at MRP)"}
                </span>
              </div>

              {priceNum > mrpNum && (
                <span className="text-red-600 font-bold text-xs flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Selling price cannot exceed MRP!
                </span>
              )}
            </div>

          </div>

          {/* Section 4: Packaging Imagery */}
          <div className="rounded-3xl border border-[#E0EBE0] bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF3EC]">
              <h3 className="font-serif text-base font-bold text-[#14304A]">
                4. Product Packaging Image
              </h3>
              <span className="text-[11px] text-[#718573]">Upload, paste URL, or pick a preset</span>
            </div>

            <ProductImageUploader
              value={formData.customImageUrl.trim() || formData.image}
              onChange={(url) =>
                setFormData({
                  ...formData,
                  image: url,
                  customImageUrl: url.startsWith("/images/") ? "" : url,
                })
              }
              productId={productId || undefined}
              label=""
            />
          </div>

        </div>

        {/* RIGHT COLUMN: Live Preview Card (Span 4) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          
          <div className="rounded-3xl border border-[#DCE8D8] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF3EC]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#559620]" />
                <h3 className="font-serif text-sm font-bold text-[#14304A]">
                  Storefront Live Preview
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDF7E9] text-[#559620]">
                Customer View
              </span>
            </div>

            {/* Image Preview */}
            <div className="w-full aspect-square rounded-2xl bg-[#F7FAF6] border border-[#E3EDE1] relative overflow-hidden flex items-center justify-center p-4">
              <Image
                src={formData.customImageUrl.trim() || formData.image}
                alt="Product preview"
                fill
                className="object-contain p-4"
              />
              {formData.prescriptionRequired && (
                <div className="absolute top-3 left-3 bg-brand-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                  Rx Required
                </div>
              )}
              {discountPercent > 0 && (
                <div className="absolute top-3 right-3 bg-[#559620] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Product Meta */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#559620]">
                {selectedCategoryName}
              </div>
              <h4 className="font-serif text-base font-bold text-[#14304A] leading-snug">
                {formData.name || "Product Name"}
              </h4>
              <p className="text-xs text-[#637766] line-clamp-1">
                {formData.composition || "Active Chemical Composition"}
              </p>
              <div className="text-[11px] text-[#718573]">
                By <span className="font-semibold text-[#14304A]">{formData.brand || "Genekon"}</span> • {formData.dosageForm}
              </div>
            </div>

            {/* Price Block */}
            <div className="pt-3 border-t border-[#EDF3EC] flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#14304A]">
                ₹{priceNum > 0 ? priceNum.toFixed(2) : "0.00"}
              </span>
              {mrpNum > priceNum && (
                <span className="text-xs text-[#8C9C8F] line-through">
                  ₹{mrpNum.toFixed(2)}
                </span>
              )}
              <span className="text-xs font-semibold text-emerald-700 ml-auto">
                {Number(formData.stockQuantity) > 0 ? `${formData.stockQuantity} Units` : "Out of Stock"}
              </span>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>

          </div>

        </div>

      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${formData.name}"? This SKU will be deactivated and removed from the active catalog.`}
        confirmLabel={deleting ? "Deleting..." : "Delete Product"}
        isDestructive={true}
      />

    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#559620] animate-spin" />
          <p className="text-xs font-bold text-[#637766]">Loading product editor...</p>
        </div>
      }
    >
      <EditProductForm />
    </Suspense>
  );
}

