"use client";

import React, { createContext, useContext, useMemo } from "react";
import { UserProfile, UserRole } from "@/types/user";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/api/auth";

export type RoleType = "CUSTOMER" | "WHOLESALE" | "ADMIN" | "customer" | "wholesale" | "admin";

export interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isWholesale: boolean;
  isCustomer: boolean;
  login: (identifier: string, password?: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (allowedRoles: RoleType | RoleType[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    isLoggedIn,
    loading,
    token,
    isAdmin,
    isWholesale,
    loginCustomer,
    loginAsAdmin,
    loginWholesalePartner,
    logout: storeLogout,
  } = useAuthStore();

  const isCustomer = Boolean(user && user.role === "customer");

  const hasRole = (allowedRoles: RoleType | RoleType[]): boolean => {
    if (!user) return false;
    const list = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const normalizedUserRole = user.role.toUpperCase();
    return list.some((r) => r.toUpperCase() === normalizedUserRole);
  };

  const login = async (identifier: string, password?: string): Promise<boolean> => {
    try {
      const res = await authApi.loginUser({ identifier, password });
      if (res.success && res.data) {
        if (res.data.user.role === "admin") {
          loginAsAdmin();
        } else if (res.data.user.role === "wholesale") {
          loginWholesalePartner({
            name: res.data.user.name,
            phone: res.data.user.phone || identifier,
            businessType: "Retail Pharmacy",
          });
        } else {
          loginCustomer({
            mobile: res.data.user.mobile || identifier,
            email: res.data.user.email,
          });
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    storeLogout();
    authApi.logoutUser().catch(() => {});
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      role: user?.role || null,
      token,
      isAuthenticated: isLoggedIn,
      isLoading: loading,
      isAdmin,
      isWholesale,
      isCustomer,
      login,
      logout,
      hasRole,
    }),
    [user, token, isLoggedIn, loading, isAdmin, isWholesale, isCustomer]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
