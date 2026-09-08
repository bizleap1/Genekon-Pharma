import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Category } from "@/types/product";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, className }) => {
  return (
    <Link
      href={category.slug}
      className={`group flex items-center justify-between p-3.5 rounded-xl border border-[#E7ECEF] bg-[#FAFCFB] hover:bg-white hover:border-[#315FAE]/30 hover:shadow-sm transition-all duration-200 ${
        className || ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#F2F6FC] border border-[#E7ECEF] flex items-center justify-center text-[#315FAE] font-semibold text-sm group-hover:bg-[#315FAE] group-hover:text-white transition-colors">
          {category.name.charAt(0)}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#14304A] group-hover:text-[#315FAE] transition-colors">
            {category.name}
          </h4>
          {category.itemCount && (
            <p className="text-xs text-[#68746F]">
              {category.itemCount.toLocaleString()} items
            </p>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[#68746F] group-hover:text-[#315FAE] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
};
