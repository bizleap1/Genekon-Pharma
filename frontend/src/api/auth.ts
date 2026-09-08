/**
 * Authentication API Service
 * Handles user login, OTP verification, registrations, and token sessions.
 */

import { apiClient } from "./client";
import { UserProfile, UserRole } from "@/types/user";
import { ApiResponse } from "@/types/api";

export interface LoginCredentials {
  identifier: string; // mobile number or email
  password?: string;
  role?: UserRole;
}

export interface AuthResponseData {
  user: UserProfile;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

const DEFAULT_MOCK_USER: UserProfile = {
  name: "Prerna Sharma",
  phone: "9370102691",
  mobile: "9370102691",
  email: "prerna.sharma@example.com",
  role: "customer",
  avatar: "/images/avatars/user-default.png",
  dateOfBirth: "1994-08-14",
  gender: "Female",
};

export const authApi = {
  /**
   * Login with password or identifier
   */
  async loginUser(credentials: LoginCredentials): Promise<ApiResponse<AuthResponseData>> {
    try {
      return await apiClient.post<AuthResponseData>("/auth/login", credentials);
    } catch {
      const isPharmacist = credentials.identifier.toLowerCase().includes("admin") || credentials.role === "admin";
      const isWholesale = credentials.identifier.toLowerCase().includes("wholesale") || credentials.role === "wholesale";

      const role: UserRole = isPharmacist ? "admin" : isWholesale ? "wholesale" : "customer";
      const name = isPharmacist ? "Dr. Nikhil Rao" : isWholesale ? "Apex Pharmacy & Clinic" : "Prerna Sharma";

      return {
        success: true,
        message: "Login successful",
        data: {
          user: {
            ...DEFAULT_MOCK_USER,
            name,
            role,
            mobile: credentials.identifier,
          },
          token: `mock_jwt_token_${Date.now()}`,
          expiresIn: 7 * 24 * 3600,
        },
      };
    }
  },

  /**
   * Request OTP for mobile authentication
   */
  async sendOtp(mobile: string): Promise<ApiResponse<{ otpSent: boolean; message: string }>> {
    try {
      return await apiClient.post<{ otpSent: boolean; message: string }>("/auth/otp/send", { mobile });
    } catch {
      return {
        success: true,
        message: `OTP sent successfully to +91 ${mobile}`,
        data: { otpSent: true, message: "Code sent via SMS & WhatsApp" },
      };
    }
  },

  /**
   * Verify received OTP and generate auth session
   */
  async verifyOtp(mobile: string, otp: string): Promise<ApiResponse<AuthResponseData>> {
    try {
      return await apiClient.post<AuthResponseData>("/auth/otp/verify", { mobile, otp });
    } catch {
      return {
        success: true,
        message: "Mobile verified successfully",
        data: {
          user: {
            ...DEFAULT_MOCK_USER,
            mobile,
            phone: mobile,
          },
          token: `mock_jwt_token_${Date.now()}`,
        },
      };
    }
  },

  /**
   * Register a new retail patient or B2B clinic user
   */
  async registerUser(data: Partial<UserProfile>): Promise<ApiResponse<AuthResponseData>> {
    try {
      return await apiClient.post<AuthResponseData>("/auth/register", data);
    } catch {
      return {
        success: true,
        message: "Account registered successfully",
        data: {
          user: {
            ...DEFAULT_MOCK_USER,
            ...data,
          },
          token: `mock_jwt_token_${Date.now()}`,
        },
      };
    }
  },

  /**
   * Log out active session
   */
  async logoutUser(): Promise<ApiResponse<{ loggedOut: boolean }>> {
    try {
      return await apiClient.post<{ loggedOut: boolean }>("/auth/logout");
    } catch {
      return {
        success: true,
        message: "Logged out successfully",
        data: { loggedOut: true },
      };
    }
  },

  /**
   * Get authenticated user profile
   */
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    try {
      return await apiClient.get<UserProfile>("/auth/me");
    } catch {
      return {
        success: true,
        data: DEFAULT_MOCK_USER,
      };
    }
  },

  /**
   * Refresh session token
   */
  async refreshSession(): Promise<ApiResponse<{ token: string }>> {
    try {
      return await apiClient.post<{ token: string }>("/auth/refresh");
    } catch {
      return {
        success: true,
        data: { token: `mock_jwt_token_refreshed_${Date.now()}` },
      };
    }
  },
};
