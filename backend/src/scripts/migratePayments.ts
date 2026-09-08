import { sql } from "../config/database";
import { logger } from "../utils/logger";

export async function runPaymentsMigration() {
  logger.info("Applying Payments database migrations to Neon PostgreSQL...");

  // 1. Add 'SUCCESS' to payment_status_enum if not already added
  await sql`
    DO $$ BEGIN
      ALTER TYPE "public"."payment_status_enum" ADD VALUE IF NOT EXISTS 'SUCCESS';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  // 2. Create payments table
  await sql`
    CREATE TABLE IF NOT EXISTS "payments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "order_id" uuid NOT NULL,
      "razorpay_order_id" varchar(100),
      "razorpay_payment_id" varchar(100),
      "razorpay_signature" varchar(255),
      "amount" numeric(10, 2) NOT NULL,
      "currency" varchar(10) DEFAULT 'INR' NOT NULL,
      "payment_method" "public"."payment_method_enum" DEFAULT 'ONLINE' NOT NULL,
      "status" "public"."payment_status_enum" DEFAULT 'PENDING' NOT NULL,
      "refund_id" varchar(100),
      "refund_amount" numeric(10, 2),
      "failure_reason" text,
      "metadata" jsonb,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  // 3. Add foreign key to orders table
  await sql`
    DO $$ BEGIN
      ALTER TABLE "payments"
      ADD CONSTRAINT "payments_order_id_orders_id_fk"
      FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  // 4. Create indexes
  await sql`CREATE INDEX IF NOT EXISTS "idx_payments_order_id" ON "payments" ("order_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_payments_razorpay_order_id" ON "payments" ("razorpay_order_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_payments_razorpay_payment_id" ON "payments" ("razorpay_payment_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_payments_status" ON "payments" ("status");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_payments_created_at" ON "payments" ("created_at");`;

  logger.info("✅ Payments table, enums, constraints, and indexes successfully applied to Neon PostgreSQL!");
}

if (require.main === module) {
  runPaymentsMigration()
    .then(() => {
      logger.info("Payments migration script finished.");
      process.exit(0);
    })
    .catch((err) => {
      logger.error("Payments migration failed:", err);
      process.exit(1);
    });
}
