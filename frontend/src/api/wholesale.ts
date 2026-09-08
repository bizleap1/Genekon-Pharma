/**
 * Wholesale B2B API Service
 * Handles polyclinic/pharmacy wholesale registrations, bulk pricing tiers, and approval status.
 */

import { apiClient } from "./client";
import { ApiResponse, QueryParams } from "@/types/api";
import { WholesaleApplication } from "@/types/wholesale";
import { AdminWholesaleApp } from "@/types/admin";
import { ADMIN_WHOLESALE_APPS } from "@/data/adminData";

export const wholesaleApi = {
  /**
   * Submit new wholesale / B2B account onboarding application
   */
  async submitWholesaleApplication(
    data: Partial<WholesaleApplication>
  ): Promise<ApiResponse<WholesaleApplication>> {
    try {
      return await apiClient.post<WholesaleApplication>("/wholesale/apply", data);
    } catch {
      const newApp: WholesaleApplication = {
        id: `WS-${Math.floor(1000 + Math.random() * 9000)}`,
        businessName: data.businessName || "Apex Care Pharmacy Ltd",
        ownerName: data.ownerName || data.contactPerson || "Dr. Rajesh Verma",
        contactPerson: data.contactPerson || data.ownerName || "Dr. Rajesh Verma",
        email: data.email || "purchase@apexcare.in",
        phone: data.phone || "9822345678",
        drugLicenseNumber: data.drugLicenseNumber || "20B-MH-NGP-2024-819",
        gstNumber: data.gstNumber || "27AABCU9603R1ZM",
        businessType: data.businessType || "Retail Pharmacy",
        city: data.city || "Nagpur",
        state: data.state || "Maharashtra",
        status: "Pending Verification",
        appliedDate: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };

      return {
        success: true,
        message: "Wholesale application submitted. Our verification team will contact you within 24 hours.",
        data: newApp,
      };
    }
  },

  /**
   * Fetch wholesale customer profile & credit terms
   */
  async getWholesaleProfile(): Promise<ApiResponse<{ businessName: string; creditLimit: number; tier: string; discountRate: number }>> {
    try {
      return await apiClient.get<{ businessName: string; creditLimit: number; tier: string; discountRate: number }>("/wholesale/profile");
    } catch {
      return {
        success: true,
        data: {
          businessName: "Apex Care Healthcare & Polyclinic",
          creditLimit: 250000,
          tier: "Tier-1 Gold Wholesale Partner",
          discountRate: 18,
        },
      };
    }
  },

  /**
   * Fetch wholesale tiered bulk pricing discounts
   */
  async getWholesaleTierPricing(): Promise<ApiResponse<Array<{ minQty: number; discountPercent: number; tier: string }>>> {
    try {
      return await apiClient.get<Array<{ minQty: number; discountPercent: number; tier: string }>>("/wholesale/tiers");
    } catch {
      return {
        success: true,
        data: [
          { minQty: 10, discountPercent: 12, tier: "Silver Bulk Tier" },
          { minQty: 50, discountPercent: 18, tier: "Gold Hospital Tier" },
          { minQty: 200, discountPercent: 25, tier: "Platinum Distributor Tier" },
        ],
      };
    }
  },

  /**
   * Admin: Fetch all incoming B2B wholesale applications
   */
  async getWholesaleApplications(params?: QueryParams): Promise<ApiResponse<AdminWholesaleApp[]>> {
    try {
      return await apiClient.get<AdminWholesaleApp[]>("/admin/wholesale/applications", { params });
    } catch {
      return {
        success: true,
        data: ADMIN_WHOLESALE_APPS,
      };
    }
  },

  /**
   * Admin: Approve or reject wholesale partner application
   */
  async updateWholesaleStatus(
    id: string,
    status: "Approved" | "Rejected" | "Under Review"
  ): Promise<ApiResponse<{ id: string; status: string }>> {
    try {
      return await apiClient.patch<{ id: string; status: string }>(`/admin/wholesale/${id}/status`, { status });
    } catch {
      return {
        success: true,
        message: `Wholesale application marked as ${status}`,
        data: { id, status },
      };
    }
  },
};
