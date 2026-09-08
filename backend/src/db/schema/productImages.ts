import { pgTable, uuid, varchar, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";
import { products } from "./products";

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    imageUrl: varchar("image_url", { length: 500 }).notNull(),
    publicId: varchar("public_id", { length: 255 }), // Cloudinary public identifier
    altText: varchar("alt_text", { length: 255 }).default("").notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_product_images_product_id").on(table.productId),
    index("idx_product_images_display_order").on(table.displayOrder),
  ]
);

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
