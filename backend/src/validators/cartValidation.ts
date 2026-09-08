import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
  quantity: z.coerce.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1").default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int("Quantity must be an integer").min(1, "Quantity cannot be zero or negative"),
});

export const mergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product ID format"),
        quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item must be provided for merge"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type MergeCartInput = z.infer<typeof mergeCartSchema>;
