export interface UploadedPrescriptionRecord {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  patientName?: string;
  doctorName?: string;
  clinicName?: string;
  notes?: string;
  status: "Pending Review" | "Approved" | "Rejected";
}

const RX_STORAGE_KEY = "genekon_uploaded_prescriptions_v1";

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

    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeInBytes) {
      return {
        valid: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(
          1
        )} MB) exceeds the 5 MB limit. Please upload a smaller file.`,
      };
    }

    return { valid: true };
  },

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  async uploadPrescription(
    file: File,
    metadata: { patientName?: string; notes?: string; doctorName?: string },
    onProgress?: (percent: number) => void
  ): Promise<UploadedPrescriptionRecord> {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        if (onProgress) onProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          const newRecord: UploadedPrescriptionRecord = {
            id: `RX-${Math.floor(4500 + Math.random() * 999)}`,
            fileName: file.name,
            fileSize: prescriptionService.formatFileSize(file.size),
            uploadedAt: new Date().toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            patientName: metadata.patientName || "Prerna Sharma",
            doctorName: metadata.doctorName || "Dr. Deshmukh, MD",
            clinicName: "General Clinic",
            notes: metadata.notes || "Uploaded for home delivery refill",
            status: "Pending Review",
          };

          // Save to localStorage
          if (typeof window !== "undefined") {
            try {
              const existingStr = localStorage.getItem(RX_STORAGE_KEY);
              const existing = existingStr ? JSON.parse(existingStr) : [];
              localStorage.setItem(
                RX_STORAGE_KEY,
                JSON.stringify([newRecord, ...existing])
              );
            } catch (err) {
              console.error("Failed to save Rx record", err);
            }
          }

          resolve(newRecord);
        }
      }, 150);
    });
  },

  getStoredPrescriptions(): UploadedPrescriptionRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(RX_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
};
