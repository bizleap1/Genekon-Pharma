import { pgTable, uuid, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";

/**
 * User wishlist table
 */
export const wishlists = pgTable(
  "wishlist",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_wishlist_user_id").on(table.userId),
    index("idx_wishlist_product_id").on(table.productId),
    uniqueIndex("idx_wishlist_user_product").on(table.userId, table.productId),
  ]
);

export type WishlistItem = typeof wishlists.$inferSelect;
export type NewWishlistItem = typeof wishlists.$inferInsert;
