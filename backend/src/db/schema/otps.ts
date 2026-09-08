import { pgTable, uuid, varchar, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const mobileOtps = pgTable(
  "mobile_otps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: varchar("identifier", { length: 100 }).notNull(), // phone or email
    otpHash: varchar("otp_hash", { length: 255 }).notNull(), // SHA-256 hash of 6-digit OTP
    attempts: integer("attempts").default(0).notNull(), // max 3 invalid attempts before lockout
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    verified: boolean("verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_otps_identifier").on(table.identifier),
    index("idx_otps_created_at").on(table.createdAt),
  ]
);

export type MobileOtp = typeof mobileOtps.$inferSelect;
export type NewMobileOtp = typeof mobileOtps.$inferInsert;
