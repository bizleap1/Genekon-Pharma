import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  parentCategoryId: z.string().uuid("Invalid parent category ID").optional().nullable(),
  displayOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").optional(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")).nullable(),
  parentCategoryId: z.string().uuid("Invalid parent category ID").optional().nullable(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
