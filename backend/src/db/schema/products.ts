import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  boolean,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { productStatusEnum } from "./enums";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 280 }).unique().notNull(),
    brand: varchar("brand", { length: 150 }).notNull(),
    manufacturer: varchar("manufacturer", { length: 200 }).notNull(),
    categoryId: uuid("category_id")
      .references(() => categories.id, { onDelete: "restrict" })
      .notNull(),
    description: text("description").notNull(),
    composition: text("composition").notNull(), // Active molecules (e.g. Paracetamol 500mg)
    dosageForm: varchar("dosage_form", { length: 100 }).default("10 Tablets").notNull(),
    usage: text("usage").notNull(), // Directions for use
    precautions: text("precautions").notNull(), // Safety warnings
    storageInstructions: varchar("storage_instructions", { length: 255 })
      .default("Store below 25°C in a dry place")
      .notNull(),
    mrp: numeric("mrp", { precision: 10, scale: 2 }).notNull(),
    sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 5, scale: 2 }).default("0.00").notNull(),
    gst: numeric("gst", { precision: 5, scale: 2 }).default("12.00").notNull(),
    sku: varchar("sku", { length: 60 }).unique().notNull(),
    stockQuantity: integer("stock_quantity").default(50).notNull(),
    prescriptionRequired: boolean("prescription_required").default(false).notNull(),
    status: productStatusEnum("status").default("ACTIVE").notNull(),
    rating: numeric("rating", { precision: 3, scale: 2 }).default("4.50").notNull(),
    reviewCount: integer("review_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_products_category_id").on(table.categoryId),
    index("idx_products_brand").on(table.brand),
    index("idx_products_sku").on(table.sku),
    index("idx_products_slug").on(table.slug),
    index("idx_products_status").on(table.status),
    index("idx_products_name").on(table.name),
  ]
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
