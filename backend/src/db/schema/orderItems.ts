import { pgTable, uuid, varchar, integer, numeric, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { products } from "./products";

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "restrict" })
      .notNull(),
    productNameSnapshot: varchar("product_name_snapshot", { length: 255 }).notNull(),
    skuSnapshot: varchar("sku_snapshot", { length: 60 }).notNull(),
    dosageFormSnapshot: varchar("dosage_form_snapshot", { length: 100 }),
    quantity: integer("quantity").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Unit price
    mrp: numeric("mrp", { precision: 10, scale: 2 }).notNull(), // Printed retail price
    gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).default("12.00").notNull(),
    prescriptionRequired: boolean("prescription_required").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_order_items_order_id").on(table.orderId),
    index("idx_order_items_product_id").on(table.productId),
  ]
);

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
