import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-[#E6EFE6] rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[#E2EAE0] bg-white p-3.5 sm:p-4 space-y-3">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/3 rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
        <Skeleton className="h-3 w-2/3 rounded" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 6,
}) => {
  return (
    <div className="rounded-2xl border border-[#E2EAE0] bg-white overflow-hidden">
      <div className="p-4 bg-[#F8FAF8] border-b border-[#E2EAE0] flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded" />
        ))}
      </div>
      <div className="divide-y divide-[#EDF3EC] p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center pt-2">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-5 flex-1 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
