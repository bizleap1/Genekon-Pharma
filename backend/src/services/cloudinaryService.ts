import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary";
import { logger } from "../utils/logger";

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
}

export const cloudinaryService = {
  /**
   * Upload image buffer directly to Cloudinary
   */
  async uploadImage(
    buffer: Buffer,
    folder = "genekon/products",
    publicId?: string
  ): Promise<CloudinaryUploadResult> {
    try {
      return await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: publicId,
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result: UploadApiResponse | undefined) => {
            if (error || !result) {
              return reject(error || new Error("Cloudinary upload failed"));
            }
            resolve({
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height,
            });
          }
        );

        uploadStream.end(buffer);
      });
    } catch (error: any) {
      logger.error(`Cloudinary upload failed: ${error.message}`);
      throw new Error(`Failed to upload product image: ${error.message}`);
    }
  },

  /**
   * Upload prescription document (JPG, PNG, PDF) to Cloudinary
   */
  async uploadPrescriptionDocument(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    folder = "genekon/prescriptions"
  ): Promise<CloudinaryUploadResult> {
    const isPdf = mimeType.toLowerCase().includes("pdf") || fileName.toLowerCase().endsWith(".pdf");
    try {
      return await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: isPdf ? "raw" : "image",
          },
          (error, result: UploadApiResponse | undefined) => {
            if (error || !result) {
              return reject(error || new Error("Prescription upload failed"));
            }
            resolve({
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format || (isPdf ? "pdf" : "jpg"),
            });
          }
        );
        uploadStream.end(buffer);
      });
    } catch (error: any) {
      logger.error(`Cloudinary prescription upload failed: ${error.message}`);
      throw new Error(`Failed to upload prescription document: ${error.message}`);
    }
  },

  /**
   * Delete image from Cloudinary by public ID
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      if (!publicId || publicId.startsWith("genekon_mock_")) {
        return true;
      }
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === "ok";
    } catch (error: any) {
      logger.error("Failed to delete Cloudinary asset", error);
      return false;
    }
  },
};
