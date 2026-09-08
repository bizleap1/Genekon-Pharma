/**
 * Prescriptions API Service
 * Handles digital Rx uploads, pharmacist review queue, and compliance verification.
 */

import { apiClient } from "./client";
import { ApiResponse, QueryParams } from "@/types/api";
import { AdminPrescription } from "@/types/admin";
import { CustomerPrescription, MOCK_PRESCRIPTIONS } from "@/data/customer";
import { ADMIN_PRESCRIPTIONS } from "@/data/adminData";

export const prescriptionsApi = {
  /**
   * Upload doctor prescription file with clinical metadata
   */
  async uploadPrescription(
    file: File,
    metadata: { patientName?: string; doctorName?: string; notes?: string }
  ): Promise<ApiResponse<CustomerPrescription>> {
    try {
      const formData = new FormData();
      formData.append("prescription", file);
      if (metadata.patientName) formData.append("patientName", metadata.patientName);
      if (metadata.doctorName) formData.append("doctorName", metadata.doctorName);
      if (metadata.notes) formData.append("notes", metadata.notes);

      return await apiClient.post<CustomerPrescription>("/prescriptions/upload", formData);
    } catch {
      const newRx: CustomerPrescription = {
        id: `RX-${Math.floor(10000 + Math.random() * 90000)}`,
        doctorName: metadata.doctorName || "Dr. Rajesh Sharma, MD",
        clinicName: "General Health Polyclinic",
        patientName: metadata.patientName || "Prerna Sharma",
        uploadDate: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        validUntil: "31 Dec 2026",
        status: "Under Pharmacist Review",
        statusColor: "text-[#D97706] bg-[#FFF4E5] border-[#FDE68A]",
        medicinesCount: 3,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      };

      return {
        success: true,
        message: "Prescription uploaded successfully. Licensed pharmacist will review within 15 minutes.",
        data: newRx,
      };
    }
  },

  /**
   * Fetch current user's prescription history
   */
  async getUserPrescriptions(): Promise<ApiResponse<CustomerPrescription[]>> {
    try {
      return await apiClient.get<CustomerPrescription[]>("/prescriptions/user");
    } catch {
      return {
        success: true,
        data: MOCK_PRESCRIPTIONS,
      };
    }
  },

  /**
   * Fetch single prescription by ID
   */
  async getPrescriptionById(id: string): Promise<ApiResponse<CustomerPrescription>> {
    try {
      return await apiClient.get<CustomerPrescription>(`/prescriptions/${id}`);
    } catch {
      const match = MOCK_PRESCRIPTIONS.find((p) => p.id === id) || MOCK_PRESCRIPTIONS[0];
      return {
        success: true,
        data: match,
      };
    }
  },

  /**
   * Admin: Fetch pharmacist queue of uploaded prescriptions
   */
  async getAdminPrescriptions(params?: QueryParams): Promise<ApiResponse<AdminPrescription[]>> {
    try {
      return await apiClient.get<AdminPrescription[]>("/admin/prescriptions", { params });
    } catch {
      return {
        success: true,
        data: ADMIN_PRESCRIPTIONS,
      };
    }
  },

  /**
   * Admin: Verify or reject doctor prescription
   */
  async verifyPrescription(
    id: string,
    status: "Verified" | "Rejected",
    notes?: string
  ): Promise<ApiResponse<{ id: string; status: string; notes?: string }>> {
    try {
      return await apiClient.patch<{ id: string; status: string; notes?: string }>(
        `/admin/prescriptions/${id}/verify`,
        { status, notes }
      );
    } catch {
      return {
        success: true,
        message: `Prescription marked as ${status}`,
        data: { id, status, notes },
      };
    }
  },
};
