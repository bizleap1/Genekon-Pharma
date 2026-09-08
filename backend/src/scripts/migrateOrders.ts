import { sql } from "../config/database";
import { logger } from "../utils/logger";

async function runOrderMigration() {
  logger.info("Applying Orders & Prescriptions database migrations to Neon PostgreSQL...");

  // 1. Create enum types if not exists
  await sql`
    DO $$ BEGIN
      CREATE TYPE "public"."order_status_enum" AS ENUM(
        'PENDING_VERIFICATION', 'PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE "public"."payment_status_enum" AS ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE "public"."payment_method_enum" AS ENUM('COD', 'ONLINE', 'UPI', 'CARD', 'NETBANKING');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  // 2. Create prescriptions table
  await sql`
    CREATE TABLE IF NOT EXISTS "prescriptions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "order_id" uuid,
      "file_url" varchar(500) NOT NULL,
      "public_id" varchar(255),
      "file_name" varchar(255) NOT NULL,
      "file_size" integer NOT NULL,
      "mime_type" varchar(100) NOT NULL,
      "doctor_name" varchar(150),
      "patient_name" varchar(150),
      "status" "public"."rx_status_enum" DEFAULT 'PENDING' NOT NULL,
      "rejection_reason" text,
      "reviewed_by" uuid,
      "reviewed_at" timestamp with time zone,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "prescriptions"
      ADD CONSTRAINT "prescriptions_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "prescriptions"
      ADD CONSTRAINT "prescriptions_reviewed_by_users_id_fk"
      FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id")
      ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`CREATE INDEX IF NOT EXISTS "idx_prescriptions_user_id" ON "prescriptions" ("user_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_prescriptions_order_id" ON "prescriptions" ("order_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_prescriptions_status" ON "prescriptions" ("status");`;

  // 3. Create orders table
  await sql`
    CREATE TABLE IF NOT EXISTS "orders" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "order_number" varchar(40) NOT NULL,
      "delivery_address_id" uuid,
      "delivery_address_snapshot" jsonb NOT NULL,
      "subtotal" numeric(10, 2) NOT NULL,
      "discount_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
      "delivery_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
      "total_amount" numeric(10, 2) NOT NULL,
      "payment_status" "public"."payment_status_enum" DEFAULT 'PENDING' NOT NULL,
      "payment_method" "public"."payment_method_enum" DEFAULT 'COD' NOT NULL,
      "order_status" "public"."order_status_enum" DEFAULT 'PLACED' NOT NULL,
      "prescription_required" boolean DEFAULT false NOT NULL,
      "prescription_id" uuid,
      "stock_deducted" boolean DEFAULT false NOT NULL,
      "notes" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
    );
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "orders"
      ADD CONSTRAINT "orders_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE restrict ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "orders"
      ADD CONSTRAINT "orders_delivery_address_id_user_addresses_id_fk"
      FOREIGN KEY ("delivery_address_id") REFERENCES "public"."user_addresses"("id")
      ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "orders"
      ADD CONSTRAINT "orders_prescription_id_prescriptions_id_fk"
      FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id")
      ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "orders" ("user_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_orders_order_number" ON "orders" ("order_number");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_orders_order_status" ON "orders" ("order_status");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_orders_payment_status" ON "orders" ("payment_status");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders" ("created_at");`;

  // 4. Create order_items table
  await sql`
    CREATE TABLE IF NOT EXISTS "order_items" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "order_id" uuid NOT NULL,
      "product_id" uuid NOT NULL,
      "product_name_snapshot" varchar(255) NOT NULL,
      "sku_snapshot" varchar(60) NOT NULL,
      "dosage_form_snapshot" varchar(100),
      "quantity" integer NOT NULL,
      "price" numeric(10, 2) NOT NULL,
      "mrp" numeric(10, 2) NOT NULL,
      "gst_rate" numeric(5, 2) DEFAULT '12.00' NOT NULL,
      "prescription_required" boolean DEFAULT false NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "order_items"
      ADD CONSTRAINT "order_items_order_id_orders_id_fk"
      FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "order_items"
      ADD CONSTRAINT "order_items_product_id_products_id_fk"
      FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
      ON DELETE restrict ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`CREATE INDEX IF NOT EXISTS "idx_order_items_order_id" ON "order_items" ("order_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_order_items_product_id" ON "order_items" ("product_id");`;

  // 5. Create order_status_history table
  await sql`
    CREATE TABLE IF NOT EXISTS "order_status_history" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "order_id" uuid NOT NULL,
      "status" varchar(50) NOT NULL,
      "notes" text,
      "updated_by" uuid,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "order_status_history"
      ADD CONSTRAINT "order_status_history_order_id_orders_id_fk"
      FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "order_status_history"
      ADD CONSTRAINT "order_status_history_updated_by_users_id_fk"
      FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
      ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`CREATE INDEX IF NOT EXISTS "idx_order_status_history_order_id" ON "order_status_history" ("order_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_order_status_history_created_at" ON "order_status_history" ("created_at");`;

  logger.info("✅ Orders, OrderItems, Prescriptions, and StatusHistory tables successfully applied to Neon!");
}

runOrderMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    logger.error("Order migration failed:", err);
    process.exit(1);
  });
