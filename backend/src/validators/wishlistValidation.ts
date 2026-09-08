import { z } from "zod";

export const addToWishlistSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
});

export const syncWishlistSchema = z.object({
  productIds: z.array(z.string().uuid("Invalid product ID format")),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
export type SyncWishlistInput = z.infer<typeof syncWishlistSchema>;
