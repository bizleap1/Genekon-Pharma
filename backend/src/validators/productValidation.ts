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
    manufacturer: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    description: z.string().optional(),
    composition: z.string().optional(),
    dosageForm: z.string().optional().default("10 Tablets / Strip"),
    usage: z.string().optional(),
    precautions: z.string().optional(),
    storageInstructions: z
      .string()
      .optional()
      .default("Store below 25°C in a cool and dry place"),
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
    image: z.string().optional(),
    images: z
      .union([
        z.string(),
        z.array(
          z.union([
            z.string(),
            z.object({
              imageUrl: z.string().optional(),
              url: z.string().optional(),
              publicId: z.string().optional(),
              altText: z.string().optional().default(""),
              isPrimary: z.boolean().optional().default(false),
              displayOrder: z.number().int().optional().default(0),
            })
          ])
        )
      ])
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
    manufacturer: z.string().optional(),
    categoryId: z.string().optional(),
    description: z.string().optional(),
    composition: z.string().optional(),
    dosageForm: z.string().optional(),
    usage: z.string().optional(),
    precautions: z.string().optional(),
    storageInstructions: z.string().optional(),
    mrp: z.coerce.number().positive().optional(),
    sellingPrice: z.coerce.number().positive().optional(),
    discount: z.coerce.number().min(0).max(100).optional(),
    gst: z.coerce.number().min(0).max(100).optional(),
    sku: z.string().min(2).optional(),
    stockQuantity: z.coerce.number().int().min(0).optional(),
    prescriptionRequired: z.coerce.boolean().optional(),
    status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED", "OUT_OF_STOCK"]).optional(),
    image: z.string().optional(),
    images: z
      .union([
        z.string(),
        z.array(
          z.union([
            z.string(),
            z.object({
              imageUrl: z.string().optional(),
              url: z.string().optional(),
              publicId: z.string().optional(),
              altText: z.string().optional().default(""),
              isPrimary: z.boolean().optional().default(false),
              displayOrder: z.number().int().optional().default(0),
            })
          ])
        )
      ])
      .optional(),
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
