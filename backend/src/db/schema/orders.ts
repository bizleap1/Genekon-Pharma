import { pgTable, uuid, varchar, text, numeric, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { userAddresses } from "./addresses";
import { prescriptions } from "./prescriptions";
import { orderStatusEnum, paymentStatusEnum, paymentMethodEnum } from "./enums";

export interface DeliveryAddressSnapshot {
  fullName: string;
  phone: string;
  addressLine: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  addressType: string;
}

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "restrict" })
      .notNull(),
    orderNumber: varchar("order_number", { length: 40 }).unique().notNull(),
    deliveryAddressId: uuid("delivery_address_id").references(() => userAddresses.id, {
      onDelete: "set null",
    }),
    deliveryAddressSnapshot: jsonb("delivery_address_snapshot")
      .$type<DeliveryAddressSnapshot>()
      .notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    discountAmount: numeric("discount_amount", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: paymentStatusEnum("payment_status").default("PENDING").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").default("COD").notNull(),
    orderStatus: orderStatusEnum("order_status").default("PLACED").notNull(),
    prescriptionRequired: boolean("prescription_required").default(false).notNull(),
    prescriptionId: uuid("prescription_id").references(() => prescriptions.id, {
      onDelete: "set null",
    }),
    stockDeducted: boolean("stock_deducted").default(false).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_orders_user_id").on(table.userId),
    index("idx_orders_order_number").on(table.orderNumber),
    index("idx_orders_order_status").on(table.orderStatus),
    index("idx_orders_payment_status").on(table.paymentStatus),
    index("idx_orders_created_at").on(table.createdAt),
  ]
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
