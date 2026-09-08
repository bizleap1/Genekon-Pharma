import { pgTable, uuid, varchar, numeric, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { paymentStatusEnum, paymentMethodEnum } from "./enums";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    razorpayOrderId: varchar("razorpay_order_id", { length: 100 }),
    razorpayPaymentId: varchar("razorpay_payment_id", { length: 100 }),
    razorpaySignature: varchar("razorpay_signature", { length: 255 }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).default("INR").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").default("ONLINE").notNull(),
    status: paymentStatusEnum("status").default("PENDING").notNull(),
    refundId: varchar("refund_id", { length: 100 }),
    refundAmount: numeric("refund_amount", { precision: 10, scale: 2 }),
    failureReason: text("failure_reason"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_payments_order_id").on(table.orderId),
    index("idx_payments_razorpay_order_id").on(table.razorpayOrderId),
    index("idx_payments_razorpay_payment_id").on(table.razorpayPaymentId),
    index("idx_payments_status").on(table.status),
    index("idx_payments_created_at").on(table.createdAt),
  ]
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
