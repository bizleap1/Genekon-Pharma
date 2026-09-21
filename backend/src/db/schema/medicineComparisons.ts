import { pgTable, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { products } from "./products";

export const medicineComparisons = pgTable(
  "medicine_comparisons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    brandedProductId: uuid("branded_product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    genericProductId: uuid("generic_product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_medicine_comparisons_unique").on(table.brandedProductId, table.genericProductId)
  ]
);

export type MedicineComparison = typeof medicineComparisons.$inferSelect;
export type NewMedicineComparison = typeof medicineComparisons.$inferInsert;
