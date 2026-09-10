import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product identifier is required"),
  quantity: z.coerce.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1").default(1),
  name: z.string().optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int("Quantity must be an integer").min(1, "Quantity cannot be zero or negative"),
});

export const mergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product identifier is required"),
        quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
        name: z.string().optional(),
      })
    )
    .min(1, "At least one item must be provided for merge"),
});

export const syncCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, "Product identifier is required"),
      quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
      name: z.string().optional(),
    })
  ),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type MergeCartInput = z.infer<typeof mergeCartSchema>;
export type SyncCartInput = z.infer<typeof syncCartSchema>;
