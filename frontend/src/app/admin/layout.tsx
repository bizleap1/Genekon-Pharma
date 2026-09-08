"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-[#FAFCFA] text-[#14304A]">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar />

      {/* Main Admin Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader />
        <main className="flex-1 p-6 sm:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
