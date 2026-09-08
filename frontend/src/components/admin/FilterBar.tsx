"use client";

import React from "react";
import { Search, Filter, SlidersHorizontal, Download } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  categoryFilter?: string;
  onCategoryChange?: (val: string) => void;
  categories?: string[];
  statusFilter?: string;
  onStatusChange?: (val: string) => void;
  statuses?: string[];
  onExport?: () => void;
  actions?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
  categoryFilter,
  onCategoryChange,
  categories,
  statusFilter,
  onStatusChange,
  statuses,
  onExport,
  actions,
}) => {
  return (
    <div className="rounded-2xl border border-[#E2EAE0] bg-white p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Left: Search input */}
      <div className="flex-1 max-w-md relative flex items-center rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] px-3 py-1.5 focus-within:border-[#559620] focus-within:bg-white transition-all">
        <Search className="w-4 h-4 text-[#8C9C8F] shrink-0 mr-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full text-xs text-[#14304A] bg-transparent outline-none"
        />
      </div>

      {/* Right: Category and Status Filters */}
      <div className="flex items-center flex-wrap gap-2.5">
        {categories && onCategoryChange && (
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}

        {statuses && onStatusChange && (
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFB] text-[#14304A] outline-none focus:border-[#559620]"
          >
            <option value="all">All Statuses</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        )}

        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#CCDCCD] bg-[#FAFCFA] hover:bg-[#F0F5F1] text-xs font-bold text-[#14304A] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#559620]" />
            <span>Export CSV</span>
          </button>
        )}

        {actions}
      </div>
    </div>
  );
};
