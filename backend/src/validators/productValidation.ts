import { z } from "zod";

export const createProductSchema = z
  .object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    slug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
      .optional(),
    brand: z.string().min(1, "Brand name is required"),
    manufacturer: z.string().min(1, "Manufacturer name is required"),
    categoryId: z.string().uuid("Valid category ID is required"),
    description: z.string().min(5, "Product description must be at least 5 characters"),
    composition: z.string().min(2, "Active composition / salt is required"),
    dosageForm: z.string().optional().default("10 Tablets"),
    usage: z.string().min(5, "Usage instructions are required"),
    precautions: z.string().min(5, "Safety precautions are required"),
    storageInstructions: z
      .string()
      .optional()
      .default("Store below 25°C in a dry place"),
    mrp: z.coerce.number().positive("MRP must be greater than 0"),
    sellingPrice: z.coerce.number().positive("Selling price must be greater than 0"),
    discount: z.coerce.number().min(0).max(100).optional().default(0),
    gst: z.coerce.number().min(0).max(100).optional().default(12),
    sku: z.string().min(2, "SKU must be at least 2 characters"),
    stockQuantity: z.coerce.number().int().min(0).optional().default(50),
    prescriptionRequired: z.coerce.boolean().optional().default(false),
    status: z
      .enum(["ACTIVE", "DRAFT", "ARCHIVED", "OUT_OF_STOCK"])
      .optional()
      .default("ACTIVE"),
    images: z
      .array(
        z.object({
          imageUrl: z.string().url().optional(),
          url: z.string().url().optional(),
          publicId: z.string().optional(),
          altText: z.string().optional().default(""),
          isPrimary: z.boolean().optional().default(false),
          displayOrder: z.number().int().optional().default(0),
        }).refine((data) => data.imageUrl || data.url, {
          message: "Either imageUrl or url must be provided",
        })
      )
      .optional(),
  })
  .refine((data) => data.sellingPrice <= data.mrp, {
    message: "Selling price cannot exceed Maximum Retail Price (MRP)",
    path: ["sellingPrice"],
  });

export const updateProductSchema = z
  .object({
    name: z.string().min(2).optional(),
    slug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    brand: z.string().min(1).optional(),
    manufacturer: z.string().min(1).optional(),
    categoryId: z.string().uuid().optional(),
    description: z.string().min(5).optional(),
    composition: z.string().min(2).optional(),
    dosageForm: z.string().optional(),
    usage: z.string().min(5).optional(),
    precautions: z.string().min(5).optional(),
    storageInstructions: z.string().optional(),
    mrp: z.coerce.number().positive().optional(),
    sellingPrice: z.coerce.number().positive().optional(),
    discount: z.coerce.number().min(0).max(100).optional(),
    gst: z.coerce.number().min(0).max(100).optional(),
    sku: z.string().min(2).optional(),
    stockQuantity: z.coerce.number().int().min(0).optional(),
    prescriptionRequired: z.coerce.boolean().optional(),
    status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED", "OUT_OF_STOCK"]).optional(),
  })
  .refine(
    (data) => {
      if (data.sellingPrice !== undefined && data.mrp !== undefined) {
        return data.sellingPrice <= data.mrp;
      }
      return true;
    },
    {
      message: "Selling price cannot exceed Maximum Retail Price (MRP)",
      path: ["sellingPrice"],
    }
  );

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minDiscount: z.coerce.number().min(0).optional(),
  prescriptionRequired: z.enum(["true", "false"]).optional(),
  inStock: z.enum(["true", "false"]).optional(),
  sort: z
    .enum(["price-low", "price-high", "latest", "popularity"])
    .optional()
    .default("popularity"),
});
