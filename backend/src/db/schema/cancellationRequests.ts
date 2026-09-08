import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { orders } from "./orders";
import { cancellationStatusEnum } from "./enums";

export const cancellationRequests = pgTable(
  "cancellation_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    reason: varchar("reason", { length: 255 }).notNull(),
    details: text("details"),
    status: cancellationStatusEnum("status").default("PENDING").notNull(),
    adminComment: text("admin_comment"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_cancel_requests_order_id").on(table.orderId),
    index("idx_cancel_requests_user_id").on(table.userId),
    index("idx_cancel_requests_status").on(table.status),
    index("idx_cancel_requests_created_at").on(table.createdAt),
  ]
);

export type CancellationRequest = typeof cancellationRequests.$inferSelect;
export type NewCancellationRequest = typeof cancellationRequests.$inferInsert;
