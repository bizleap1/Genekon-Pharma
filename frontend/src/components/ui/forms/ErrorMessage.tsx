"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  error?: string | null;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, className = "" }) => {
  if (!error) return null;

  return (
    <div
      role="alert"
      className={`flex items-center gap-1.5 text-xs font-bold text-red-600 animate-in fade-in duration-150 ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{error}</span>
    </div>
  );
};
