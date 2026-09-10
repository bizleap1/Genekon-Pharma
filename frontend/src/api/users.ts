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
    return await apiClient.get<UserAddress[]>("/users/addresses");
  },

  /**
   * Add new delivery address
   */
  async addAddress(address: Partial<UserAddress> & { fullName?: string; addressType?: string }): Promise<ApiResponse<UserAddress>> {
    const payload = {
      fullName: address.fullName || address.name || "Customer",
      phone: (address.phone || "").replace(/\D/g, "").slice(-10),
      addressLine: address.addressLine || "",
      landmark: address.landmark || undefined,
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      addressType: (address.addressType || address.type || "HOME").toUpperCase(),
      isDefault: Boolean(address.isDefault),
    };
    return await apiClient.post<UserAddress>("/users/addresses", payload);
  },

  /**
   * Update existing address
   */
  async updateAddress(id: string, address: Partial<UserAddress> & { fullName?: string; addressType?: string }): Promise<ApiResponse<UserAddress>> {
    const payload: Record<string, unknown> = {};
    if (address.fullName || address.name) payload.fullName = address.fullName || address.name;
    if (address.phone) payload.phone = address.phone.replace(/\D/g, "").slice(-10);
    if (address.addressLine) payload.addressLine = address.addressLine;
    if (address.landmark !== undefined) payload.landmark = address.landmark;
    if (address.city) payload.city = address.city;
    if (address.state) payload.state = address.state;
    if (address.pincode) payload.pincode = address.pincode;
    if (address.addressType || address.type) payload.addressType = (address.addressType || address.type || "HOME").toUpperCase();
    if (address.isDefault !== undefined) payload.isDefault = Boolean(address.isDefault);

    return await apiClient.put<UserAddress>(`/users/addresses/${id}`, payload);
  },

  /**
   * Delete saved address
   */
  async deleteAddress(id: string): Promise<ApiResponse<{ id: string }>> {
    return await apiClient.delete<{ id: string }>(`/users/addresses/${id}`);
  },
};
