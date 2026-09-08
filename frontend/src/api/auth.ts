/**
 * Authentication API Service
 * Handles user login, OTP verification, registrations, Google OAuth, and token sessions.
 */

import { apiClient } from "./client";
import { UserProfile, UserRole } from "@/types/user";
import { ApiResponse } from "@/types/api";

export interface LoginCredentials {
  identifier: string; // mobile number or email
  password?: string;
  role?: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthResponseData {
  user: UserProfile;
  token: string;
  tokens?: AuthTokens;
  refreshToken?: string;
  expiresIn?: number;
}

export function normalizeUserRole(backendRole?: string): UserRole {
  const r = String(backendRole || "").toUpperCase();
  if (r === "ADMIN") return "admin";
  if (r === "WHOLESALE_PARTNER" || r === "WHOLESALE") return "wholesale";
  return "customer";
}

export function mapBackendUserToProfile(u: any): UserProfile {
  if (!u) return { name: "Guest User", mobile: "", role: "customer" };
  return {
    id: u.id,
    name: u.name || "Genekon User",
    mobile: u.phone || u.mobile || "",
    phone: u.phone || u.mobile || "",
    email: u.email || "",
    role: normalizeUserRole(u.role),
    avatar: u.avatar || "/images/avatars/user-default.png",
    dateOfBirth: u.dateOfBirth,
    gender: u.gender,
    city: u.city || "Nagpur",
    pincode: u.pincode || "440013",
    address: u.address || "",
    businessName: u.businessName,
    gstNumber: u.gstNumber,
    addresses: u.addresses || [],
  };
}

export const authApi = {
  /**
   * Request OTP for mobile authentication
   */
  async sendOtp(phone: string): Promise<ApiResponse<{ message: string; otp?: string }>> {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    return await apiClient.post<{ message: string; otp?: string }>("/auth/send-otp", {
      identifier: cleanPhone,
      phone: cleanPhone,
    });
  },

  /**
   * Verify received OTP and generate auth session
   */
  async verifyOtp(
    phone: string,
    otp: string,
    name?: string,
    email?: string
  ): Promise<ApiResponse<AuthResponseData>> {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const res = await apiClient.post<any>("/auth/verify-otp", {
      identifier: cleanPhone,
      phone: cleanPhone,
      otp,
      name,
      email,
    });

    const userProfile = mapBackendUserToProfile(res.data.user);
    const token = res.data.tokens?.accessToken || res.data.token;
    const refreshToken = res.data.tokens?.refreshToken || res.data.refreshToken;

    return {
      success: true,
      message: res.message || "Authentication successful",
      data: {
        user: userProfile,
        token,
        tokens: res.data.tokens,
        refreshToken,
        expiresIn: res.data.tokens?.expiresIn || 900,
      },
    };
  },

  /**
   * Login with email and password (for Admin or returning credentials)
   */
  async loginUser(credentials: LoginCredentials): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiClient.post<any>("/auth/login", {
      identifier: credentials.identifier,
      password: credentials.password,
    });

    const userProfile = mapBackendUserToProfile(res.data.user);
    const token = res.data.tokens?.accessToken || res.data.token;
    const refreshToken = res.data.tokens?.refreshToken || res.data.refreshToken;

    return {
      success: true,
      message: res.message || "Login successful",
      data: {
        user: userProfile,
        token,
        tokens: res.data.tokens,
        refreshToken,
        expiresIn: res.data.tokens?.expiresIn || 900,
      },
    };
  },

  /**
   * Register new user account with Name, Mobile, Email, and Password
   */
  async registerUser(data: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    role?: "CUSTOMER" | "WHOLESALE_PARTNER";
  }): Promise<ApiResponse<AuthResponseData>> {
    const cleanPhone = data.phone.replace(/\D/g, "").slice(-10);
    const res = await apiClient.post<any>("/auth/register", {
      name: data.name,
      phone: cleanPhone,
      email: data.email?.trim() || undefined,
      password: data.password || undefined,
      role: data.role || "CUSTOMER",
    });

    const userProfile = mapBackendUserToProfile(res.data?.user || res.data);
    const token = res.data?.tokens?.accessToken || res.data?.token || "mock_token";
    const refreshToken = res.data?.tokens?.refreshToken || res.data?.refreshToken;

    return {
      success: true,
      message: res.message || "Registration successful",
      data: {
        user: userProfile,
        token,
        tokens: res.data?.tokens,
        refreshToken,
        expiresIn: res.data?.tokens?.expiresIn || 900,
      },
    };
  },

  /**
   * Google OAuth Login
   */
  async googleLogin(idToken: string): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiClient.post<any>("/auth/google", { idToken });
    const userProfile = mapBackendUserToProfile(res.data.user);
    const token = res.data.tokens?.accessToken || res.data.token;
    const refreshToken = res.data.tokens?.refreshToken || res.data.refreshToken;

    return {
      success: true,
      message: res.message || "Google login successful",
      data: {
        user: userProfile,
        token,
        tokens: res.data.tokens,
        refreshToken,
      },
    };
  },

  /**
   * Log out active session
   */
  async logoutUser(refreshToken?: string): Promise<ApiResponse<{ loggedOut: boolean }>> {
    try {
      await apiClient.post("/auth/logout", { refreshToken });
    } catch {
      // client-side logout anyway
    }
    return {
      success: true,
      message: "Logged out successfully",
      data: { loggedOut: true },
    };
  },

  /**
   * Get authenticated user profile
   */
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    const res = await apiClient.get<any>("/auth/me");
    const userProfile = mapBackendUserToProfile(res.data.user || res.data);
    return {
      success: true,
      data: userProfile,
      message: "Profile retrieved successfully",
    };
  },

  /**
   * Refresh session token
   */
  async refreshSession(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
    const res = await apiClient.post<any>("/auth/refresh-token", { refreshToken });
    return {
      success: true,
      data: { accessToken: res.data.accessToken || res.data.tokens?.accessToken },
    };
  },
};
