"use client";

import React from "react";
import Link from "next/link";
import { useAuth, RoleType } from "@/context/AuthContext";
import { ShieldAlert, ArrowLeft } from "lucide-react";

interface RoleGuardProps {
  allowedRoles: RoleType | RoleType[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
}) => {
  const { isAuthenticated, hasRole, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="w-8 h-8 rounded-full border-2 border-[#559620] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !hasRole(allowedRoles)) {
    return (
      fallback || (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-[#FAFCFA]">
          <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl border border-[#E2EAE0] text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#14304A] mb-2">
              Access Restricted
            </h2>
            <p className="text-xs text-[#637766] leading-relaxed mb-6">
              Your account ({user?.role || "guest"}) does not have clearance for this pharmacy module.
              Required role: {Array.isArray(allowedRoles) ? allowedRoles.join(" / ") : allowedRoles}.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#CCDCCD] text-xs font-bold text-[#14304A] hover:bg-[#F2F7F2]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Store</span>
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold shadow-xs"
              >
                Switch Account
              </Link>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};
