import { pgTable, uuid, varchar, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { rxStatusEnum } from "./enums";

export const prescriptions = pgTable(
  "prescriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    orderId: uuid("order_id"), // linked order reference
    fileUrl: varchar("file_url", { length: 500 }).notNull(),
    publicId: varchar("public_id", { length: 255 }), // Cloudinary asset ID
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    doctorName: varchar("doctor_name", { length: 150 }),
    patientName: varchar("patient_name", { length: 150 }),
    status: rxStatusEnum("status").default("PENDING").notNull(),
    rejectionReason: text("rejection_reason"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_prescriptions_user_id").on(table.userId),
    index("idx_prescriptions_order_id").on(table.orderId),
    index("idx_prescriptions_status").on(table.status),
  ]
);

export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;
