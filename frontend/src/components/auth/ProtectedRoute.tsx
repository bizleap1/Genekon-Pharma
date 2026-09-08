"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/login",
  fallback,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const { openLoginModal } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openLoginModal({
        type: "REDIRECT",
        redirectUrl: pathname,
        title: "Sign In Required",
      });
      router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, redirectTo, router, openLoginModal]);

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#559620] border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-[#637766]">Verifying patient session...</p>
          </div>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
