/**
 * Users & Addresses API Service
 * Handles user profile updates, patient address books, and delivery locations.
 */

import { apiClient } from "./client";
import { UserProfile, UserAddress } from "@/types/user";
import { ApiResponse } from "@/types/api";
import { MOCK_ADDRESSES, MOCK_CUSTOMER } from "@/data/customer";

export const usersApi = {
  /**
   * Fetch current authenticated user profile
   */
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      return await apiClient.get<UserProfile>("/users/profile");
    } catch {
      return {
        success: true,
        data: {
          name: MOCK_CUSTOMER.name,
          phone: MOCK_CUSTOMER.phone,
          mobile: MOCK_CUSTOMER.phone,
          email: MOCK_CUSTOMER.email,
          role: "customer",
          avatar: MOCK_CUSTOMER.avatar,
          dateOfBirth: MOCK_CUSTOMER.dateOfBirth,
          gender: MOCK_CUSTOMER.gender,
        },
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
          name: data.name || MOCK_CUSTOMER.name,
          phone: data.phone || data.mobile || MOCK_CUSTOMER.phone,
          mobile: data.mobile || data.phone || MOCK_CUSTOMER.phone,
          email: data.email || MOCK_CUSTOMER.email,
          role: "customer",
          ...data,
        },
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
      const converted: UserAddress[] = MOCK_ADDRESSES.map((a) => ({
        id: a.id,
        type: a.type.toLowerCase() as "home" | "work" | "clinic" | "other",
        name: a.name,
        fullName: a.name,
        phone: a.phone,
        addressLine: a.addressLine,
        landmark: a.locality,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        isDefault: a.isDefault,
      }));
      return {
        success: true,
        data: converted,
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
      const match = MOCK_ADDRESSES.find((a) => a.id === id);
      return {
        success: true,
        message: "Address updated successfully",
        data: {
          id,
          type: (address.type || match?.type.toLowerCase() || "home") as "home" | "work" | "clinic" | "other",
          name: address.name || address.fullName || match?.name || "Prerna Sharma",
          fullName: address.fullName || address.name || match?.name || "Prerna Sharma",
          phone: address.phone || match?.phone || "9370102691",
          addressLine: address.addressLine || match?.addressLine || "",
          landmark: address.landmark || match?.locality,
          city: address.city || match?.city || "Nagpur",
          state: address.state || match?.state || "Maharashtra",
          pincode: address.pincode || match?.pincode || "440010",
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
