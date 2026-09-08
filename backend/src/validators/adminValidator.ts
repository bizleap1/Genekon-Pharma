import { z } from "zod";

export const createBatchSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  batchNumber: z.string().min(2, "Batch number must be at least 2 characters"),
  manufacturingDate: z.string().optional(),
  expiryDate: z.string().min(1, "Expiry date is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  mrp: z.number().positive("MRP must be positive").optional(),
  costPrice: z.number().positive("Cost price must be positive").optional(),
});

export const adjustStockSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  batchId: z.string().uuid("Invalid batch ID").optional(),
  changeType: z.enum([
    "PURCHASE_RECEIPT",
    "SALE_DEDUCTION",
    "MANUAL_ADJUSTMENT",
    "DAMAGE_EXPIRY",
    "RETURN_RESTOCK",
  ]),
  quantityChanged: z
    .number()
    .int()
    .refine((v) => v !== 0, "Quantity changed cannot be zero"),
  reason: z.string().min(3, "Reason for adjustment is required"),
});

export const toggleUserBlockSchema = z.object({
  isBlocked: z.boolean(),
  reason: z.string().optional(),
});

export const reviewWholesaleApplicationSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional(),
  creditLimit: z.number().positive("Credit limit must be positive").optional(),
});

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(50)
    .regex(/^[A-Z0-9_-]+$/i, "Coupon code must be alphanumeric"),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minOrderValue: z.number().nonnegative().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  startDate: z.string().optional(),
  expiryDate: z.string().min(1, "Expiry date is required"),
});

export const createBannerSchema = z.object({
  title: z.string().min(2, "Banner title must be at least 2 characters"),
  subtitle: z.string().optional(),
  imageUrl: z.string().min(5, "Image URL is required"),
  targetUrl: z.string().optional(),
  section: z.string().optional(),
  displayOrder: z.number().int().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const registerWholesaleSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  ownerName: z.string().min(2, "Owner/Proprietor name is required"),
  businessType: z.enum(["RETAIL_PHARMACY", "CLINIC_NURSING_HOME", "HOSPITAL", "DISTRIBUTOR"]),
  gstNumber: z.string().min(10, "Valid GSTIN is required"),
  drugLicenseNumber: z.string().min(3, "Drug license number is required"),
  drugLicenseExpiry: z.string().optional(),
  phone: z.string().min(10, "Valid 10-digit phone number is required"),
  email: z.string().email("Valid email address is required"),
  address: z.string().min(5, "Complete business address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

