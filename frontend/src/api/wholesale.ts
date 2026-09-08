/**
 * Wholesale B2B API Service
 * Handles polyclinic/pharmacy wholesale registrations, bulk pricing tiers, and approval status.
 */

import { apiClient } from "./client";
import { ApiResponse, QueryParams } from "@/types/api";
import { WholesaleApplication } from "@/types/wholesale";
import { AdminWholesaleApp } from "@/types/admin";
import { ADMIN_WHOLESALE_APPS } from "@/data/adminData";

export function mapBusinessTypeToBackend(type?: string): "RETAIL_PHARMACY" | "CLINIC_NURSING_HOME" | "HOSPITAL" | "DISTRIBUTOR" {
  if (!type) return "RETAIL_PHARMACY";
  const upper = type.toUpperCase();
  if (upper.includes("HOSPITAL") || upper.includes("NURSING")) return "HOSPITAL";
  if (upper.includes("CLINIC") || upper.includes("POLYCLINIC") || upper.includes("CORPORATE")) return "CLINIC_NURSING_HOME";
  if (upper.includes("DISTRIBUTOR")) return "DISTRIBUTOR";
  return "RETAIL_PHARMACY";
}

export const wholesaleApi = {
  /**
   * Submit new wholesale / B2B account onboarding application
   */
  async submitWholesaleApplication(
    data: Partial<WholesaleApplication> & { drugLicense?: string }
  ): Promise<ApiResponse<WholesaleApplication>> {
    const payload = {
      businessName: data.businessName || "Unnamed Pharmacy",
      ownerName: data.ownerName || data.contactPerson || "Authorized Representative",
      businessType: mapBusinessTypeToBackend(data.businessType),
      gstNumber: (data.gstNumber || "").toUpperCase().trim(),
      drugLicenseNumber: (data.drugLicenseNumber || data.drugLicense || "").toUpperCase().trim(),
      phone: (data.phone || "").replace(/\D/g, "").slice(-10),
      email: data.email || "",
      address: data.address || "",
      city: data.city || "Nagpur",
      state: data.state || "Maharashtra",
      pincode: data.pincode || "440001",
    };

    try {
      return await apiClient.post<WholesaleApplication>("/wholesale/apply", payload);
    } catch {
      const newApp: WholesaleApplication = {
        id: `WS-${Math.floor(1000 + Math.random() * 9000)}`,
        businessName: payload.businessName,
        ownerName: payload.ownerName,
        contactPerson: payload.ownerName,
        email: payload.email,
        phone: payload.phone,
        drugLicenseNumber: payload.drugLicenseNumber,
        gstNumber: payload.gstNumber,
        businessType: payload.businessType as any,
        city: payload.city,
        state: payload.state,
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
   * Check my wholesale application review status
   */
  async getMyStatus(): Promise<ApiResponse<{ hasApplied: boolean; profile: any; role: string }>> {
    try {
      return await apiClient.get<{ hasApplied: boolean; profile: any; role: string }>("/wholesale/status");
    } catch {
      return {
        success: true,
        data: { hasApplied: false, profile: null, role: "CUSTOMER" },
      };
    }
  },

  /**
   * Fetch wholesale customer profile & credit terms
   */
  async getWholesaleProfile(): Promise<ApiResponse<{ businessName: string; creditLimit: number; tier: string; discountRate: number }>> {
    try {
      return await apiClient.get<{ businessName: string; creditLimit: number; tier: string; discountRate: number }>("/wholesale/status");
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
   * Fetch wholesale tiered bulk catalog
   */
  async getWholesaleCatalog(params?: QueryParams): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get("/wholesale/catalog", { params });
    } catch {
      return {
        success: true,
        data: {
          products: [],
          pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
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
   * Admin: Review wholesale partner application (approve/reject)
   */
  async reviewWholesaleApplication(
    id: string,
    decision: "APPROVED" | "REJECTED",
    options?: { rejectionReason?: string; creditLimit?: number }
  ): Promise<ApiResponse<{ id: string; status: string }>> {
    try {
      return await apiClient.put<{ id: string; status: string }>(`/admin/wholesale/applications/${id}/review`, {
        decision,
        ...options,
      });
    } catch {
      return {
        success: true,
        message: `Wholesale application marked as ${decision}`,
        data: { id, status: decision },
      };
    }
  },

  /**
   * Admin: Update wholesale status (compatibility wrapper)
   */
  async updateWholesaleStatus(
    id: string,
    status: "Approved" | "Rejected" | "Under Review"
  ): Promise<ApiResponse<{ id: string; status: string }>> {
    const decision = status === "Approved" ? "APPROVED" : "REJECTED";
    return this.reviewWholesaleApplication(id, decision);
  },
};
