"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, File, CheckCircle2, X } from "lucide-react";
import { FormField } from "./FormField";

export interface FileUploadProps {
  label?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  optional?: boolean;
  accept?: string;
  maxSizeBytes?: number;
  onFileSelect: (file: File | null) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  hint = "PNG, JPG, or PDF up to 5 MB",
  error,
  required = false,
  optional = false,
  accept = "image/jpeg,image/png,application/pdf",
  onFileSelect,
  className = "",
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <FormField
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragging
            ? "border-[#559620] bg-[#EDF7E9]/40 scale-[1.01]"
            : error
            ? "border-red-300 bg-red-50/20"
            : "border-[#CCDCCD] bg-[#FAFCFB] hover:border-[#559620] hover:bg-[#F2F7F2]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {selectedFile ? (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#DDE7DC]">
            <div className="flex items-center gap-3 truncate text-left">
              <div className="w-10 h-10 rounded-xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center shrink-0">
                <File className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#14304A] truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-[#708573]">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="p-1.5 rounded-lg text-[#7C917E] hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EDF7E9] text-[#559620] flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-[#14304A] mb-1">
              Click to browse or drag & drop prescription
            </p>
            <p className="text-[11px] text-[#708573]">{hint}</p>
          </div>
        )}
      </div>
    </FormField>
  );
};
