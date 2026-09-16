"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Link2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
} from "lucide-react";
import { adminApi } from "@/api/admin";

const IMAGE_PRESETS = [
  { id: "tablets",  name: "Tablets",  url: "/images/products/genekon-tablets-pack.jpg",     badge: "Tablets / Strips"  },
  { id: "capsules", name: "Capsules", url: "/images/products/genekon-capsules-bottle.jpg",   badge: "Capsules"          },
  { id: "syrup",    name: "Syrup",    url: "/images/products/genekon-syrup-bottle.jpg",       badge: "Oral Liquid"       },
  { id: "ointment", name: "Cream",    url: "/images/products/genekon-ointment-tube.jpg",      badge: "Cream / Gel"       },
  { id: "inhaler",  name: "Inhaler",  url: "/images/products/genekon-inhaler-device.jpg",    badge: "Inhaler / MDI"     },
  { id: "drops",    name: "Drops",    url: "/images/products/genekon-eye-drops.jpg",          badge: "Ophthalmic"        },
  { id: "powder",   name: "Powder",   url: "/images/products/genekon-health-powder.jpg",      badge: "Powder"            },
  { id: "device",   name: "Device",   url: "/images/products/genekon-diagnostic-device.jpg", badge: "Medical Device"    },
];

type Mode = "presets" | "upload" | "url";

interface ProductImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  /** Pass the product ID after creation to enable live Cloudinary upload */
  productId?: string;
  label?: string;
}

export function ProductImageUploader({
  value,
  onChange,
  productId,
  label = "Product Image",
}: ProductImageUploaderProps) {
  const [mode, setMode] = useState<Mode>("presets");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPreset = IMAGE_PRESETS.some((p) => p.url === value);

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError("");
      setUploadSuccess("");

      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        setUploadError("Only JPEG, PNG, or WebP images are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Image must be under 5 MB.");
        return;
      }

      // Show immediate local preview
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl);

      if (!productId) {
        setUploadSuccess("Image selected ✓  Will upload to Cloudinary after saving product.");
        return;
      }

      try {
        setUploading(true);
        setUploadProgress(35);
        const formData = new FormData();
        formData.append("images", file);
        const res = await adminApi.uploadProductImages(productId, formData);
        setUploadProgress(100);
        const uploaded = Array.isArray(res.data) ? res.data[0] : res.data;
        const cloudUrl = uploaded?.imageUrl || uploaded?.url || localUrl;
        onChange(cloudUrl);
        setUploadSuccess("Uploaded to Cloudinary ✓");
      } catch (err: any) {
        setUploadError(err?.message || "Upload failed — image kept as preview.");
      } finally {
        setUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [productId, onChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      setUploadError("Please enter a valid https:// image URL.");
      return;
    }
    setUploadError("");
    onChange(trimmed);
    setUploadSuccess("Custom URL applied ✓");
  };

  const clearFeedback = () => {
    setUploadError("");
    setUploadSuccess("");
  };

  return (
    <div className="space-y-3">
      {/* Label + Mode Tabs */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#14304A]">{label}</label>
        <div className="flex items-center rounded-xl overflow-hidden border border-[#CCDCCD] bg-[#F8FAF7] text-xs font-bold">
          {(["presets", "upload", "url"] as Mode[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setMode(tab); clearFeedback(); }}
              className={`px-3 py-1.5 cursor-pointer transition-colors capitalize ${
                mode === tab ? "bg-[#559620] text-white" : "text-[#637766] hover:text-[#14304A]"
              }`}
            >
              {tab === "url" ? "URL" : tab === "upload" ? "Upload" : "Presets"}
            </button>
          ))}
        </div>
      </div>

      {/* ── PRESETS ── */}
      {mode === "presets" && (
        <div className="grid grid-cols-4 gap-2">
          {IMAGE_PRESETS.map((preset) => {
            const chosen = value === preset.url;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => { onChange(preset.url); clearFeedback(); }}
                className={`group rounded-2xl border p-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                  chosen
                    ? "bg-[#F3F9F1] border-[#559620] ring-2 ring-[#559620]/20 shadow-xs"
                    : "bg-white border-[#E0EBE0] hover:border-[#559620] hover:bg-[#FAFDF9]"
                }`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F2F5F2] relative mb-1.5 group-hover:scale-105 transition-transform">
                  <Image src={preset.url} alt={preset.name} fill className="object-contain p-1" />
                  {chosen && (
                    <div className="absolute inset-0 bg-[#559620]/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#559620]" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#14304A] leading-tight">{preset.name}</span>
                <span className="text-[9px] text-[#718573]">{preset.badge}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── UPLOAD ── */}
      {mode === "upload" && (
        <div className="space-y-3">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 py-8 select-none ${
              dragOver
                ? "border-[#559620] bg-[#EDF7E9]"
                : "border-[#C8DBC5] bg-[#FAFCFB] hover:border-[#559620] hover:bg-[#F5FAF4]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleInputChange}
            />

            {uploading ? (
              <>
                <RefreshCw className="w-8 h-8 text-[#559620] animate-spin" />
                <span className="text-xs font-bold text-[#559620]">Uploading to Cloudinary...</span>
                <div className="w-40 h-1.5 bg-[#E0EBE0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#559620] rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[#E8F3E5] flex items-center justify-center">
                  <UploadCloud className="w-6 h-6 text-[#559620]" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-[#14304A]">
                    Drag &amp; drop or <span className="text-[#559620] underline">click to browse</span>
                  </p>
                  <p className="text-[10px] text-[#718573] mt-0.5">
                    JPEG, PNG, WebP &bull; Max 5 MB &bull; Auto-uploads to Cloudinary
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Local blob warning */}
          {value && value.startsWith("blob:") && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-800 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Local preview only — will upload to Cloudinary once product is saved.
            </div>
          )}
        </div>
      )}

      {/* ── URL ── */}
      {mode === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8FA292]" />
              <input
                type="url"
                placeholder="https://cdn.example.com/medicine.jpg"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); clearFeedback(); }}
                onKeyDown={(e) => e.key === "Enter" && applyUrl()}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620] focus:bg-white transition-all"
              />
            </div>
            <button
              type="button"
              onClick={applyUrl}
              className="px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              Apply
            </button>
          </div>
          <p className="text-[10px] text-[#8FA292]">
            Paste a direct image link from Cloudinary, ImgBB, Imgur, or any public CDN
          </p>

          {/* Applied URL chip */}
          {value && !isPreset && !value.startsWith("blob:") && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#EDF7E9] border border-[#CDE5C8] text-[10px] text-[#447719]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#559620]" />
              <span className="font-semibold flex-1 truncate">{value}</span>
              <a href={value} target="_blank" rel="noreferrer" className="shrink-0 text-[#559620] hover:text-[#467E19]">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => { onChange(IMAGE_PRESETS[0].url); setUrlInput(""); clearFeedback(); }}
                className="shrink-0 text-red-400 hover:text-red-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Feedback ── */}
      {uploadError && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
          <span>{uploadError}</span>
        </div>
      )}
      {uploadSuccess && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#EDF7E9] border border-[#CDE5C8] text-xs text-[#447719] animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#559620]" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* ── Active Image Strip ── */}
      {value && (
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#F8FAF7] border border-[#E2EDE0]">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#E0EBE0] relative shrink-0">
            <Image src={value} alt="Selected image" fill className="object-contain p-1" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#14304A] uppercase tracking-wider mb-0.5">Active Image</p>
            <p className="text-[10px] text-[#718573] truncate">
              {isPreset
                ? IMAGE_PRESETS.find((p) => p.url === value)?.badge || "Preset"
                : value.startsWith("blob:")
                ? "Local file preview"
                : value}
            </p>
          </div>
          {!isPreset && (
            <button
              type="button"
              onClick={() => { onChange(IMAGE_PRESETS[0].url); setUrlInput(""); clearFeedback(); }}
              className="shrink-0 p-1.5 rounded-lg text-[#8FA292] hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
              title="Reset to default preset"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
