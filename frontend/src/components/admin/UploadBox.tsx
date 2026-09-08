"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";

interface UploadBoxProps {
  label: string;
  initialPreview?: string;
  onFileSelect?: (file: File) => void;
  helperText?: string;
}

export const UploadBox: React.FC<UploadBoxProps> = ({
  label,
  initialPreview,
  onFileSelect,
  helperText = "PNG, JPG or WEBP up to 5MB",
}) => {
  const [preview, setPreview] = useState<string | null>(initialPreview || null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      onFileSelect && onFileSelect(file);
    }
  };

  const clear = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-[#14304A]">
        {label}
      </label>

      {preview ? (
        <div className="relative w-32 h-32 rounded-2xl border border-[#D5E2D3] bg-[#FAFCFA] p-2 overflow-hidden flex items-center justify-center">
          <Image
            src={preview}
            alt="Upload preview"
            fill
            sizes="128px"
            className="object-contain p-1"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#14304A] text-white flex items-center justify-center shadow-xs hover:bg-red-600 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-[#CCDCCD] bg-[#FAFCFB] hover:bg-[#F2F8F0] hover:border-[#559620] transition-colors cursor-pointer p-4 text-center">
          <UploadCloud className="w-6 h-6 text-[#559620] mb-1.5" />
          <span className="text-xs font-bold text-[#14304A]">
            Click to upload or drag &amp; drop
          </span>
          <span className="text-[10px] text-[#788E7A] mt-0.5">
            {helperText}
          </span>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFile}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};
