"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { UtilityBar } from "./UtilityBar";
import { Header } from "./Header";
import { CategoryNav } from "./CategoryNav";

export function StoreHeader() {
  const pathname = usePathname();

  // Do not render the store header on admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="sticky top-0 z-[100] w-full flex flex-col shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] transition-transform duration-300">
      <UtilityBar />
      <Header />
      <CategoryNav />
    </div>
  );
}
