import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 50 }).unique().notNull(), // e.g. "GENEKON10"
    description: text("description"),
    discountType: varchar("discount_type", { length: 20 }).notNull(), // "PERCENTAGE" | "FIXED"
    discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
    minOrderValue: numeric("min_order_value", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    maxDiscount: numeric("max_discount", { precision: 10, scale: 2 }), // Capped discount for percentage coupons
    usageLimit: integer("usage_limit"), // null for unlimited
    usageCount: integer("usage_count").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).defaultNow(),
    expiryDate: timestamp("expiry_date", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_coupons_code").on(table.code),
    index("idx_coupons_is_active").on(table.isActive),
    index("idx_coupons_expiry_date").on(table.expiryDate),
  ]
);

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
