import { pgTable, uuid, varchar, boolean, timestamp, text, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { addressTypeEnum } from "./enums";

export const userAddresses = pgTable(
  "user_addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    fullName: varchar("full_name", { length: 150 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    addressLine: text("address_line").notNull(),
    landmark: varchar("landmark", { length: 150 }),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    pincode: varchar("pincode", { length: 10 }).notNull(),
    addressType: addressTypeEnum("address_type").default("HOME").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_addresses_user_id").on(table.userId),
    index("idx_addresses_pincode").on(table.pincode),
  ]
);

export type UserAddress = typeof userAddresses.$inferSelect;
export type NewUserAddress = typeof userAddresses.$inferInsert;
