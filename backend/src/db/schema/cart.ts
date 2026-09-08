import { pgTable, uuid, integer, numeric, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";

/**
 * User shopping cart table (1-to-1 with users)
 */
export const carts = pgTable(
  "cart",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cart_user_id").on(table.userId),
  ]
);

/**
 * Shopping cart items table
 */
export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .references(() => carts.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    quantity: integer("quantity").default(1).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Unit price snapshot
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cart_items_cart_id").on(table.cartId),
    index("idx_cart_items_product_id").on(table.productId),
    uniqueIndex("idx_cart_items_cart_product").on(table.cartId, table.productId),
  ]
);

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
