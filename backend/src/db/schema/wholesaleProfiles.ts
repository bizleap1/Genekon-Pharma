import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { wholesaleStatusEnum, wholesaleBusinessTypeEnum } from "./enums";

export const wholesaleProfiles = pgTable(
  "wholesale_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    businessName: varchar("business_name", { length: 255 }).notNull(),
    ownerName: varchar("owner_name", { length: 150 }).notNull(),
    businessType: wholesaleBusinessTypeEnum("business_type").notNull(),
    gstNumber: varchar("gst_number", { length: 15 }).notNull(),
    drugLicenseNumber: varchar("drug_license_number", { length: 100 }).notNull(),
    drugLicenseExpiry: timestamp("drug_license_expiry", { withTimezone: true }),
    phone: varchar("phone", { length: 20 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    pincode: varchar("pincode", { length: 20 }),
    status: wholesaleStatusEnum("status").default("PENDING_VERIFICATION").notNull(),
    rejectionReason: text("rejection_reason"),
    creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }).default("0.00").notNull(),
    outstandingAmount: numeric("outstanding_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_wholesale_profiles_user_id").on(table.userId),
    index("idx_wholesale_profiles_gst_number").on(table.gstNumber),
    index("idx_wholesale_profiles_status").on(table.status),
  ]
);

export type WholesaleProfile = typeof wholesaleProfiles.$inferSelect;
export type NewWholesaleProfile = typeof wholesaleProfiles.$inferInsert;
