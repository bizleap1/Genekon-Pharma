"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Plus,
  HelpCircle,
  FileText,
  DollarSign,
  Layers,
  Thermometer,
  Tag
} from "lucide-react";
import { adminApi } from "@/api/admin";

// Pharmaceutical Packaging Presets
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

// Clinical Quick-Fill Templates
const CLINICAL_TEMPLATES = [
  {
    id: "oral-tablet",
    name: "Tablets / Pills",
    icon: Pill,
    dosageForm: "1 Strip of 10 Tablets",
    compositionHint: "e.g. Paracetamol 500mg, Caffeine 30mg",
    description:
      "Pharmaceutical-grade oral tablet indicated for symptomatic relief and treatment under medical supervision. Formulated with high bioavailability excipients for rapid therapeutic action.",
    usage:
      "Take 1 tablet after meals as advised by your physician. Swallow whole with a glass of water. Do not crush, chew, or break the tablet.",
    precautions:
      "Keep out of reach of children. Consult a physician before use if you have kidney/liver disorders, are pregnant, or breastfeeding. Do not exceed prescribed daily dosage.",
    storageInstructions: "Store below 25°C in a dry place away from direct sunlight and moisture.",
    prescriptionRequired: false,
    imagePreset: "/images/products/genekon-tablets-pack.jpg",
    gst: "12",
  },
  {
    id: "antibiotic",
    name: "Antibiotic (Rx)",
    icon: ShieldCheck,
    dosageForm: "1 Strip of 10 Tablets",
    compositionHint: "e.g. Amoxicillin (500mg) + Clavulanic Acid (125mg)",
    description:
      "Broad-spectrum antimicrobial formulation formulated to treat bacterial infections of the respiratory tract, urinary tract, and soft tissues. Complies with Schedule H1 drug regulations.",
    usage:
      "Take exactly as directed by your treating physician at evenly spaced intervals with meals. Complete the entire prescribed course even if symptoms improve.",
    precautions:
      "Schedule H Prescription Drug — Warning: To be sold by retail on the prescription of a Registered Medical Practitioner only. Inform doctor of any penicillin allergies.",
    storageInstructions: "Store in a cool and dry place below 25°C. Protect from light and humidity.",
    prescriptionRequired: true,
    imagePreset: "/images/products/genekon-tablets-pack.jpg",
    gst: "12",
  },
  {
    id: "oral-syrup",
    name: "Syrup / Suspension",
    icon: Droplets,
    dosageForm: "1 Bottle of 100 ml",
    compositionHint: "e.g. Dextromethorphan HBr 10mg + Chlorpheniramine 2mg / 5ml",
    description:
      "Oral liquid suspension formulated for fast symptomatic relief of respiratory irritation and cough. Palatable flavor base suitable for smooth pediatric and adult administration.",
    usage:
      "Shake well before use. Use the measuring cup provided for precise dosing: Adults 10 ml, Children (6-12 yrs) 5 ml every 6 to 8 hours or as advised by physician.",
    precautions:
      "May cause mild drowsiness. Avoid driving or operating machinery after consumption. Keep tightly closed and out of reach of children.",
    storageInstructions: "Store at room temperature below 25°C. Do not freeze. Protect from direct heat.",
    prescriptionRequired: false,
    imagePreset: "/images/products/genekon-syrup-bottle.jpg",
    gst: "12",
  },
  {
    id: "topical-gel",
    name: "Ointment / Gel",
    icon: Thermometer,
    dosageForm: "1 Tube of 30g",
    compositionHint: "e.g. Diclofenac Diethylamine 1.16% w/w + Linseed Oil + Menthol",
    description:
      "Targeted topical non-steroidal anti-inflammatory and pain relief gel. Penetrates deep into muscular and joint tissues for localized therapeutic action.",
    usage:
      "Clean and dry the affected area. Apply a thin layer of gel gently 3 to 4 times daily. Wash hands thoroughly after application unless treating hands.",
    precautions:
      "For external use only. Do not apply on open wounds, broken skin, burns, or near eyes and mucous membranes. Discontinue if severe irritation develops.",
    storageInstructions: "Store below 25°C in a dry place. Keep tube tightly closed after use.",
    prescriptionRequired: false,
    imagePreset: "/images/products/genekon-ointment-tube.jpg",
    gst: "12",
  },
  {
    id: "inhaler",
    name: "Respiratory Inhaler",
    icon: Pill,
    dosageForm: "1 Inhaler (200 Metered Doses)",
    compositionHint: "e.g. Budesonide 200mcg + Formoterol Fumarate 6mcg",
    description:
      "Metered dose inhaler for the management and maintenance treatment of chronic asthma, bronchospasms, and chronic obstructive pulmonary disease (COPD).",
    usage:
      "Inhale 1-2 puffs twice daily or as prescribed by a pulmonologist. Rinse mouth with water after each use to prevent fungal oral infections.",
    precautions:
      "Schedule H Prescription Drug. Not for acute bronchospasm relief unless specifically indicated. Do not puncture or expose canister to direct fire.",
    storageInstructions: "Store below 30°C. Protect from direct sunlight and freezing.",
    prescriptionRequired: true,
    imagePreset: "/images/products/genekon-inhaler-device.jpg",
    gst: "12",
  },
  {
    id: "eye-drops",
    name: "Eye / Ear Drops",
    icon: Droplets,
    dosageForm: "1 Sterile Vial of 10 ml",
    compositionHint: "e.g. Carboxymethylcellulose Sodium 0.5% w/v + Stabilized Oxychloro",
    description:
      "Sterile ophthalmic lubricating solution providing instant soothing relief from ocular dryness, digital eye strain, and irritation caused by dry environments.",
    usage:
      "Instill 1-2 drops into the affected eye(s) 3-4 times daily as needed. Ensure applicator tip does not touch the eyelid, eyelashes, or fingers.",
    precautions:
      "Sterile until opened. Discard unused portion 1 month after opening container. Remove contact lenses prior to application unless specifically indicated.",
    storageInstructions: "Store below 25°C. Do not freeze. Keep bottle tightly closed.",
    prescriptionRequired: false,
    imagePreset: "/images/products/genekon-eye-drops.jpg",
    gst: "12",
  },
  {
    id: "vitamin-supplement",
    name: "Vitamin & Supplement",
    icon: Sparkles,
    dosageForm: "1 Bottle of 60 Capsules",
    compositionHint: "e.g. Methylcobalamin 1500mcg + Alpha Lipoic Acid + Folic Acid",
    description:
      "High-potency nutraceutical formulation enriched with vital micronutrients and antioxidants to support nerve health, immune defense, and cellular energy metabolism.",
    usage:
      "Take 1 capsule daily after breakfast or your main meal with water, or as advised by your healthcare nutritionist.",
    precautions:
      "Dietary supplement — not for medicinal use. Do not exceed the recommended daily allowance. Store out of reach of children.",
    storageInstructions: "Store in a cool, dry, and dark place. Protect from direct light, heat, and moisture.",
    prescriptionRequired: false,
    imagePreset: "/images/products/genekon-capsules-bottle.jpg",
    gst: "18",
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

export default function AddProductPage() {
  const router = useRouter();

  // Categories list loaded from backend
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    brand: "Genekon",
    manufacturer: "Genekon Pharmaceuticals Pvt Ltd",
    categoryId: "",
    sku: "",
    mrp: "",
    sellingPrice: "",
    gst: "12",
    stockQuantity: "100",
    dosageForm: "1 Strip of 10 Tablets",
    composition: "",
    description: "",
    usage: "",
    precautions: "",
    storageInstructions: "Store below 25°C in a cool and dry place away from direct sunlight.",
    prescriptionRequired: false,
    status: "ACTIVE",
    image: "/images/products/genekon-tablets-pack.jpg",
    customImageUrl: "",
  });

  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load real categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoadingCategories(true);
        const res = await adminApi.getCategories({ flat: true });
        let list: any[] = [];
        if (res.data && Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray((res.data as any).categories)) {
          list = (res.data as any).categories;
        }

        if (list.length > 0) {
          // Sort alphabetically
          const sorted = list
            .map((c) => ({ id: c.id, name: c.name, slug: c.slug }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setCategories(sorted);
          // Default to first category
          setFormData((prev) => ({
            ...prev,
            categoryId: prev.categoryId || sorted[0].id,
          }));
        } else {
          // Fallback categories if backend empty
          const fallback = [
            { id: "cat-1", name: "Pain Relief & Fever", slug: "pain-relief-fever" },
            { id: "cat-2", name: "Antibiotics", slug: "antibiotics" },
            { id: "cat-3", name: "Cardiac & Blood Pressure", slug: "cardiac-blood-pressure" },
            { id: "cat-4", name: "Diabetes Care", slug: "diabetes-care" },
            { id: "cat-5", name: "Gastro & Digestive", slug: "gastro-digestive" },
            { id: "cat-6", name: "Vitamins & Nutrition", slug: "vitamins-nutrition" },
            { id: "cat-7", name: "Skin Care & Dermatology", slug: "skin-care-dermatology" },
          ];
          setCategories(fallback);
          setFormData((prev) => ({ ...prev, categoryId: fallback[0].id }));
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Live Calculations
  const mrpNum = Number(formData.mrp) || 0;
  const priceNum = Number(formData.sellingPrice) || 0;
  const discountAmount = mrpNum > priceNum ? mrpNum - priceNum : 0;
  const discountPercent = mrpNum > 0 && mrpNum > priceNum ? Math.round((discountAmount / mrpNum) * 100) : 0;
  const isPriceValid = mrpNum > 0 && priceNum > 0 && priceNum <= mrpNum;

  // 1-Click Clinical Template Application
  const applyTemplate = (tpl: (typeof CLINICAL_TEMPLATES)[0]) => {
    setActiveTemplate(tpl.id);
    setFormData((prev) => ({
      ...prev,
      dosageForm: tpl.dosageForm,
      description: prev.description || tpl.description,
      usage: tpl.usage,
      precautions: tpl.precautions,
      storageInstructions: tpl.storageInstructions,
      prescriptionRequired: tpl.prescriptionRequired,
      gst: tpl.gst,
      image: tpl.imagePreset,
      customImageUrl: "",
      composition: prev.composition || tpl.compositionHint.replace(/^e\.g\.\s*/i, ""),
    }));
  };

  // Auto-Generate SKU
  const generateSku = () => {
    const brandCode = (formData.brand || "GNK").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
    const nameCode = (formData.name || "MED").replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const sku = `GNK-${brandCode || "GEN"}-${nameCode || "SKU"}-${randomNum}`;
    setFormData((prev) => ({ ...prev, sku }));
  };

  // Handle Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Please enter a valid product name.");
      return;
    }
    if (!formData.brand.trim()) {
      setErrorMessage("Please enter a brand name.");
      return;
    }
    if (!formData.categoryId) {
      setErrorMessage("Please select a valid therapeutic category.");
      return;
    }
    if (!formData.sku.trim()) {
      setErrorMessage("Please specify or auto-generate a SKU code.");
      return;
    }
    if (mrpNum <= 0) {
      setErrorMessage("MRP must be greater than 0.");
      return;
    }
    if (priceNum <= 0) {
      setErrorMessage("Selling price must be greater than 0.");
      return;
    }
    if (priceNum > mrpNum) {
      setErrorMessage("Selling price cannot exceed MRP (Maximum Retail Price).");
      return;
    }

    const effectiveImage = formData.customImageUrl.trim() || formData.image;

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      manufacturer: formData.manufacturer.trim() || formData.brand.trim(),
      categoryId: formData.categoryId,
      sku: formData.sku.trim().toUpperCase(),
      mrp: mrpNum,
      sellingPrice: priceNum,
      discount: discountPercent,
      gst: Number(formData.gst) || 12,
      stockQuantity: Number(formData.stockQuantity) || 50,
      dosageForm: formData.dosageForm || "10 Tablets / Strip",
      composition: formData.composition.trim() || formData.name.trim(),
      description:
        formData.description.trim() ||
        `${formData.name} is a high-grade pharmaceutical formulation manufactured by ${formData.manufacturer} for therapeutic care.`,
      usage:
        formData.usage.trim() ||
        "Take as directed by treating physician or follow packaging instructions carefully. Swallow with water.",
      precautions:
        formData.precautions.trim() ||
        "Keep out of reach of children. Consult a healthcare professional prior to use if pregnant, nursing, or have a chronic medical condition.",
      storageInstructions:
        formData.storageInstructions.trim() || "Store below 25°C in a cool and dry place away from direct sunlight.",
      prescriptionRequired: formData.prescriptionRequired,
      status: formData.status,
      image: effectiveImage,
      images: [effectiveImage],
    };

    try {
      setSubmitting(true);
      const res = await adminApi.createProduct(payload);
      if (res.success || (res as any).data) {
        setSuccessMessage(`Product "${formData.name}" created and added to active catalog!`);
        setTimeout(() => {
          router.push("/admin/products");
        }, 1200);
      } else {
        setErrorMessage(res.message || "Failed to create product. Please verify all details.");
      }
    } catch (err: any) {
      console.error("Create product failed:", err);
      setErrorMessage(err.message || "Network or server error while creating product.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryName = useMemo(() => {
    return categories.find((c) => c.id === formData.categoryId)?.name || "Selected Category";
  }, [categories, formData.categoryId]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2EAE0]">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#559620] hover:underline mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Product Catalog</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14304A]">
            Add Pharmaceutical Product
          </h1>
          <p className="text-xs sm:text-sm text-[#637766] mt-0.5">
            Add active SKU, medical composition, pricing, dosage instructions, and imagery.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-xl border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-xs font-bold text-[#14304A] transition-all shadow-2xs"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Publish to Catalog</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-[#EDF7E9] border border-[#CDE5C8] text-[#447719] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#559620] shrink-0" />
          <span>{successMessage} Redirecting to catalog...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* CLINICAL QUICK-FILL TEMPLATES BAR ("info kahan se du" solved) */}
      {/* ============================================================ */}
      <div className="rounded-3xl border border-[#CDE5C8] bg-gradient-to-br from-[#F4F9F2] via-white to-[#EEF7EB] p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E2F0DE] text-[#559620] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#14304A]">
                1-Click Clinical Autofill Templates
              </h2>
              <p className="text-[11px] text-[#637766]">
                Select medicine type to automatically fill standard medical dosage, safety warnings, and storage rules.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#E5F2E1] text-[#48821B] border border-[#CDE5C8]">
            Instant Pre-fill
          </span>
        </div>

        {/* Template Buttons Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {CLINICAL_TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = activeTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#559620] text-white border-[#559620] shadow-sm ring-2 ring-[#559620]/30"
                    : "bg-white text-[#14304A] border-[#DCE8D8] hover:border-[#559620] hover:bg-[#FAFDF9]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#559620]"}`} />
                  {tpl.prescriptionRequired && (
                    <span
                      className={`text-[9px] font-extrabold px-1 rounded ${
                        isSelected ? "bg-white/20 text-white" : "bg-[#EBF3FC] text-[#1853A8]"
                      }`}
                    >
                      Rx
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs leading-tight line-clamp-1">{tpl.name}</div>
                <div
                  className={`text-[10px] mt-0.5 line-clamp-1 ${
                    isSelected ? "text-white/80" : "text-[#718573]"
                  }`}
                >
                  {tpl.dosageForm.split("(")[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Form Inputs (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SECTION 1: Product Identification & Classification */}
          <div className="rounded-3xl border border-[#E0EBE0] bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF3EC]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#EBF5E7] text-[#559620] text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-serif text-base font-bold text-[#14304A]">
                  Basic Identification &amp; Category
                </h3>
              </div>
              <span className="text-[11px] text-[#718573]">* Required fields</span>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Product / Medicine Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Augmentin 625 Duo Tablet, Paracetamol 500mg, Pan 40"
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
                  placeholder="e.g. Cipla, Sun Pharma, GlaxoSmithKline, Genekon"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#14304A]">
                    Manufacturer
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        manufacturer: `${prev.brand} Pharmaceuticals Ltd`,
                      }))
                    }
                    className="text-[10px] font-bold text-[#559620] hover:underline cursor-pointer"
                  >
                    Auto-Fill from Brand
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Cipla Ltd, Sun Pharmaceutical Industries"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Category & SKU Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  Therapeutic Category *
                </label>
                {loadingCategories ? (
                  <div className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#8C9C8F]">
                    Loading categories from database...
                  </div>
                ) : (
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
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#14304A]">
                    SKU Code *
                  </label>
                  <button
                    type="button"
                    onClick={generateSku}
                    className="text-[10px] font-bold text-[#559620] hover:underline cursor-pointer"
                  >
                    ⚡ Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. GNK-CIP-PAR-500"
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

                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1853A8] cursor-pointer">
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

          {/* SECTION 2: Pharmaceutical & Clinical Details */}
          <div className="rounded-3xl border border-[#E0EBE0] bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF3EC]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#EBF5E7] text-[#559620] text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-serif text-base font-bold text-[#14304A]">
                  Pharmaceutical Formulation &amp; Clinical Information
                </h3>
              </div>
              <span className="text-[11px] text-[#559620] font-semibold">Storefront Tabs Content</span>
            </div>

            {/* Active Composition / Salt */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Active Chemical Composition / Salt *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Paracetamol IP 500mg, Caffeine 30mg"
                value={formData.composition}
                onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
              />
            </div>

            {/* Dosage Form & Packaging */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Dosage Form &amp; Packaging Size *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1 Strip of 10 Tablets, 1 Bottle of 100 ml"
                value={formData.dosageForm}
                onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all mb-2"
              />
              
              {/* Quick Pills */}
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

            {/* Product Description */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Product Description &amp; Overview
              </label>
              <textarea
                rows={3}
                placeholder="Clinical indications, therapeutic benefits, and overview..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620] focus:bg-white transition-all leading-relaxed"
              />
            </div>

            {/* Usage Instructions & Directions */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Directions for Use &amp; Dosage Guidelines
              </label>
              <textarea
                rows={3}
                placeholder="Dosage instructions, frequency, route of administration, and duration..."
                value={formData.usage}
                onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620] focus:bg-white transition-all leading-relaxed"
              />
            </div>

            {/* Safety Precautions & Warnings */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Safety Advice, Warnings &amp; Precautions
              </label>
              <textarea
                rows={3}
                placeholder="Contraindications, pregnancy advice, liver/kidney cautions, and drug interactions..."
                value={formData.precautions}
                onChange={(e) => setFormData({ ...formData, precautions: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620] focus:bg-white transition-all leading-relaxed"
              />
            </div>

            {/* Storage Instructions */}
            <div>
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Storage Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Store below 25°C in a cool, dry place away from sunlight."
                value={formData.storageInstructions}
                onChange={(e) => setFormData({ ...formData, storageInstructions: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-semibold outline-none focus:border-[#559620] focus:bg-white transition-all"
              />
            </div>

          </div>

          {/* SECTION 3: Pricing, Taxation & Inventory */}
          <div className="rounded-3xl border border-[#E0EBE0] bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF3EC]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#EBF5E7] text-[#559620] text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-serif text-base font-bold text-[#14304A]">
                  Pricing, Taxation &amp; Inventory Stock
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* MRP */}
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
                    placeholder="100.00"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full text-xs pl-8 pr-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-bold outline-none focus:border-[#559620] focus:bg-white"
                  />
                </div>
              </div>

              {/* Selling Price */}
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
                    placeholder="80.00"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full text-xs pl-8 pr-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-bold outline-none focus:border-[#559620] focus:bg-white"
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  Initial Stock (Units) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="100"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-bold outline-none focus:border-[#559620] focus:bg-white"
                />
              </div>

              {/* GST Rate */}
              <div>
                <label className="block text-xs font-bold text-[#14304A] mb-1">
                  GST Rate (%)
                </label>
                <select
                  value={formData.gst}
                  onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] font-bold outline-none focus:border-[#559620] focus:bg-white"
                >
                  <option value="0">0% (Nil / Exempted)</option>
                  <option value="5">5% (Life Saving)</option>
                  <option value="12">12% (Standard Medicines)</option>
                  <option value="18">18% (Cosmetics / Devices)</option>
                  <option value="28">28% (Luxury items)</option>
                </select>
              </div>
            </div>

            {/* Price Calculation Banner */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#E0EBE0] flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-4">
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
              </div>

              {priceNum > mrpNum && (
                <span className="text-red-600 font-bold text-xs flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Selling price cannot exceed MRP!
                </span>
              )}

              {isPriceValid && (
                <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Pricing Valid ✓
                </span>
              )}
            </div>

          </div>

          {/* SECTION 4: Product Packaging Imagery */}
          <div className="rounded-3xl border border-[#E0EBE0] bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDF3EC]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#EBF5E7] text-[#559620] text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h3 className="font-serif text-base font-bold text-[#14304A]">
                  Pharmaceutical Packaging Image
                </h3>
              </div>
              <span className="text-[11px] text-[#718573]">Pick from high-res presets or enter custom URL</span>
            </div>

            {/* Visual Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {IMAGE_PRESETS.map((preset) => {
                const isChosen = formData.image === preset.url && !formData.customImageUrl;
                return (
                  <div
                    key={preset.id}
                    onClick={() =>
                      setFormData({ ...formData, image: preset.url, customImageUrl: "" })
                    }
                    className={`group rounded-2xl border p-2.5 transition-all cursor-pointer flex flex-col items-center text-center ${
                      isChosen
                        ? "bg-[#F3F9F1] border-[#559620] ring-2 ring-[#559620]/20 shadow-xs"
                        : "bg-white border-[#E0EBE0] hover:border-[#559620]"
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F2F5F2] relative mb-2 group-hover:scale-105 transition-transform">
                      <Image
                        src={preset.url}
                        alt={preset.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <span className="text-xs font-bold text-[#14304A] leading-tight">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-[#718573] mt-0.5">{preset.badge}</span>
                  </div>
                );
              })}
            </div>

            {/* Custom Image URL */}
            <div className="pt-2 border-t border-[#EDF3EC]">
              <label className="block text-xs font-bold text-[#14304A] mb-1">
                Or enter custom image URL:
              </label>
              <input
                type="url"
                placeholder="https://example.com/images/medicine.jpg"
                value={formData.customImageUrl}
                onChange={(e) => setFormData({ ...formData, customImageUrl: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620] focus:bg-white"
              />
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Real-Time Storefront Preview (Span 4) */}
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

            {/* Medicine Image & Badge */}
            <div className="w-full aspect-square rounded-2xl bg-[#F7FAF6] border border-[#E3EDE1] relative overflow-hidden flex items-center justify-center p-4">
              <Image
                src={formData.customImageUrl.trim() || formData.image}
                alt="Product preview"
                fill
                className="object-contain p-4"
              />
              {formData.prescriptionRequired && (
                <div className="absolute top-3 left-3 bg-[#1853A8] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
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
                {Number(formData.stockQuantity) > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Clinical Tabs Snapshot */}
            <div className="p-3 rounded-2xl bg-[#F8FAF7] border border-[#E2EDE0] space-y-2 text-[11px] text-[#4F6252]">
              <div>
                <strong className="text-[#14304A] block">Usage &amp; Dosage:</strong>
                <p className="line-clamp-2 leading-relaxed">
                  {formData.usage || "Standard directions for use will be displayed here."}
                </p>
              </div>
              <div className="pt-1.5 border-t border-[#E8EFE6]">
                <strong className="text-[#14304A] block">Safety Advice:</strong>
                <p className="line-clamp-2 leading-relaxed">
                  {formData.precautions || "Precautions and contraindications."}
                </p>
              </div>
            </div>

            {/* Publish Action Button */}
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
                  <span>Save &amp; Publish to Catalog</span>
                </>
              )}
            </button>

          </div>

        </div>

      </form>

    </div>
  );
}
