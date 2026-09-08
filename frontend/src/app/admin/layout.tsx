"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAuthStore } from "@/stores/authStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const isLoginPage = pathname === "/admin/login";
  const { user, isAdmin, isLoggedIn } = useAuthStore();

  if (isLoginPage) {
    return <>{children}</>;
  }

  // If user is logged in as a normal customer (not admin), block access with clear guidance
  if (isLoggedIn && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7FBF6] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E3EDE1] p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#14304A] mb-2">
            Restricted Admin Area
          </h2>
          <p className="text-xs sm:text-sm text-[#5F7361] leading-relaxed mb-6">
            You are currently signed in as <strong className="text-[#14304A]">{user?.name || "Customer"}</strong> with a standard customer account. This administrative console is strictly reserved for authorized clinical staff and pharmacists (Dr. Shreya Meshram).
          </p>
          <div className="space-y-2.5">
            <Link
              href="/account"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#14304A] hover:bg-[#1C4164] text-white text-xs font-bold transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Customer Account</span>
            </Link>
            <Link
              href="/admin/login"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#D0E2CC] bg-[#F2F8F0] hover:bg-[#E5F2E2] text-xs font-bold text-[#447719] transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In with Admin Credentials</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FAFCFA] text-[#14304A]">
      {/* Responsive Admin Sidebar */}
      <AdminSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Admin Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
