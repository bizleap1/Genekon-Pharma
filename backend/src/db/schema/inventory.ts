import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { users } from "./users";

export const inventoryBatches = pgTable(
  "inventory_batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    batchNumber: varchar("batch_number", { length: 100 }).notNull(),
    manufacturingDate: timestamp("manufacturing_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }).notNull(),
    quantity: integer("quantity").notNull(),
    initialQuantity: integer("initial_quantity").notNull(),
    mrp: numeric("mrp", { precision: 10, scale: 2 }),
    costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
    status: varchar("status", { length: 30 }).default("IN_STOCK").notNull(), // IN_STOCK, LOW_STOCK, OUT_OF_STOCK, EXPIRED
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_inventory_batches_product_id").on(table.productId),
    index("idx_inventory_batches_batch_number").on(table.batchNumber),
    index("idx_inventory_batches_expiry_date").on(table.expiryDate),
    index("idx_inventory_batches_status").on(table.status),
  ]
);

export const inventoryLogs = pgTable(
  "inventory_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    batchId: uuid("batch_id").references(() => inventoryBatches.id, {
      onDelete: "set null",
    }),
    changeType: varchar("change_type", { length: 50 }).notNull(), // PURCHASE_RECEIPT, SALE_DEDUCTION, MANUAL_ADJUSTMENT, DAMAGE_EXPIRY, RETURN_RESTOCK
    previousQuantity: integer("previous_quantity").notNull(),
    quantityChanged: integer("quantity_changed").notNull(),
    newQuantity: integer("new_quantity").notNull(),
    reason: text("reason"),
    updatedBy: uuid("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_inventory_logs_product_id").on(table.productId),
    index("idx_inventory_logs_change_type").on(table.changeType),
    index("idx_inventory_logs_updated_by").on(table.updatedBy),
    index("idx_inventory_logs_created_at").on(table.createdAt),
  ]
);

export type InventoryBatch = typeof inventoryBatches.$inferSelect;
export type NewInventoryBatch = typeof inventoryBatches.$inferInsert;
export type InventoryLog = typeof inventoryLogs.$inferSelect;
export type NewInventoryLog = typeof inventoryLogs.$inferInsert;
