import { apiClient } from "@/api/client";

export interface UploadedPrescriptionRecord {
  id: string;
  fileName: string;
  fileSize: number | string;
  fileUrl?: string;
  uploadedAt?: string;
  createdAt?: string;
  patientName?: string;
  doctorName?: string;
  clinicName?: string;
  customerNote?: string;
  rejectionReason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REUPLOAD" | "USED_FOR_ORDER" | string;
}

export const prescriptionService = {
  validateFile(file: File): { valid: boolean; error?: string } {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!validTypes.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: "Invalid file format. Please upload a clear JPG, PNG, or PDF prescription.",
      };
    }

    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeInBytes) {
      return {
        valid: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(
          1
        )} MB) exceeds the 10 MB limit. Please upload a smaller file.`,
      };
    }

    return { valid: true };
  },

  formatFileSize(bytes: number | string): string {
    const numBytes = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
    if (isNaN(numBytes)) return "0 B";
    if (numBytes < 1024) return `${numBytes} B`;
    if (numBytes < 1024 * 1024) return `${(numBytes / 1024).toFixed(1)} KB`;
    return `${(numBytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  async uploadPrescription(
    file: File,
    metadata: { patientName?: string; customerNote?: string; doctorName?: string; addressId?: string },
    onProgress?: (percent: number) => void
  ): Promise<UploadedPrescriptionRecord> {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata.patientName) formData.append("patientName", metadata.patientName);
    if (metadata.doctorName) formData.append("doctorName", metadata.doctorName);
    if (metadata.customerNote) formData.append("customerNote", metadata.customerNote);
    if (metadata.addressId) formData.append("addressId", metadata.addressId);

    // Simulate progress if onProgress is provided, as fetch doesn't natively support upload progress easily without XHR
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (progress > 90) progress = 90;
        onProgress(progress);
      }, 200);
      
      try {
        const response = await apiClient.post<UploadedPrescriptionRecord>("/orders/prescriptions/upload", formData);
        clearInterval(interval);
        onProgress(100);
        return response.data;
      } catch (err) {
        clearInterval(interval);
        throw err;
      }
    } else {
      const response = await apiClient.post<UploadedPrescriptionRecord>("/orders/prescriptions/upload", formData);
      return response.data;
    }
  },

  async getUserPrescriptions(): Promise<UploadedPrescriptionRecord[]> {
    const response = await apiClient.get<UploadedPrescriptionRecord[]>("/orders/prescriptions/mine");
    return response.data;
  },
  
  async getAllAdminPrescriptions(): Promise<UploadedPrescriptionRecord[]> {
    const response = await apiClient.get<UploadedPrescriptionRecord[]>("/orders/admin/prescriptions");
    return response.data;
  },

  async reviewPrescription(id: string, status: string, rejectionReason?: string): Promise<UploadedPrescriptionRecord> {
    const response = await apiClient.patch<UploadedPrescriptionRecord>(`/orders/admin/prescriptions/${id}/review`, {
      status,
      rejectionReason
    });
    return response.data;
  }
};
