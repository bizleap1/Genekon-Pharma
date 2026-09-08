import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const adminActivityLogs = pgTable(
  "admin_activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: uuid("admin_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    action: varchar("action", { length: 100 }).notNull(), // PRODUCT_CREATED, PRODUCT_UPDATED, INVENTORY_ADJUSTED, ORDER_STATUS_CHANGED, etc.
    module: varchar("module", { length: 50 }).notNull(), // PRODUCTS, INVENTORY, ORDERS, PRESCRIPTIONS, CUSTOMERS, WHOLESALE, COUPONS, CMS
    targetId: varchar("target_id", { length: 100 }),
    details: jsonb("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_activity_logs_admin_id").on(table.adminId),
    index("idx_activity_logs_module").on(table.module),
    index("idx_activity_logs_action").on(table.action),
    index("idx_activity_logs_created_at").on(table.createdAt),
  ]
);

export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type NewAdminActivityLog = typeof adminActivityLogs.$inferInsert;
