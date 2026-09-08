"use client";

import React, { useEffect, useState } from "react";

export function ClientOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFCFA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#559620] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#556958]">Loading your medicines cart...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
