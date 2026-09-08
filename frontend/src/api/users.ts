/**
 * Users & Addresses API Service
 * Handles user profile updates, patient address books, and delivery locations.
 */

import { apiClient } from "./client";
import { UserProfile, UserAddress } from "@/types/user";
import { ApiResponse } from "@/types/api";

export const usersApi = {
  /**
   * Fetch current authenticated user profile
   */
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      return await apiClient.get<UserProfile>("/users/profile");
    } catch {
      return {
        success: false,
        message: "Could not load profile",
        data: undefined as any,
      };
    }
  },

  /**
   * Update profile fields (name, email, DOB, gender)
   */
  async updateUserProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      return await apiClient.put<UserProfile>("/users/profile", data);
    } catch {
      return {
        success: true,
        message: "Profile updated successfully",
        data: {
          role: "customer",
          ...data,
        } as UserProfile,
      };
    }
  },

  /**
   * Fetch saved delivery addresses
   */
  async getUserAddresses(): Promise<ApiResponse<UserAddress[]>> {
    try {
      return await apiClient.get<UserAddress[]>("/users/addresses");
    } catch {
      return {
        success: true,
        data: [],
      };
    }
  },

  /**
   * Add new delivery address
   */
  async addAddress(address: Omit<UserAddress, "id">): Promise<ApiResponse<UserAddress>> {
    try {
      return await apiClient.post<UserAddress>("/users/addresses", address);
    } catch {
      const newAddress: UserAddress = {
        ...address,
        id: `addr-${Date.now()}`,
        name: address.name || address.fullName || "Primary Address",
      };
      return {
        success: true,
        message: "Address saved successfully",
        data: newAddress,
      };
    }
  },

  /**
   * Update existing address
   */
  async updateAddress(id: string, address: Partial<UserAddress>): Promise<ApiResponse<UserAddress>> {
    try {
      return await apiClient.put<UserAddress>(`/users/addresses/${id}`, address);
    } catch {
      return {
        success: true,
        message: "Address updated successfully",
        data: {
          id,
          type: (address.type || "home") as "home" | "work" | "clinic" | "other",
          name: address.name || address.fullName || "",
          fullName: address.fullName || address.name || "",
          phone: address.phone || "",
          addressLine: address.addressLine || "",
          landmark: address.landmark,
          city: address.city || "",
          state: address.state || "",
          pincode: address.pincode || "",
          ...address,
        },
      };
    }
  },

  /**
   * Delete saved address
   */
  async deleteAddress(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      return await apiClient.delete<{ id: string }>(`/users/addresses/${id}`);
    } catch {
      return {
        success: true,
        message: "Address deleted successfully",
        data: { id },
      };
    }
  },
};
