import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { users } from "./users";

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    notes: text("notes"),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_order_status_history_order_id").on(table.orderId),
    index("idx_order_status_history_created_at").on(table.createdAt),
  ]
);

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistory = typeof orderStatusHistory.$inferInsert;
