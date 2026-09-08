import { sql } from "../config/database";
import { logger } from "../utils/logger";

export async function runAdminMigration() {
  logger.info("Applying Admin, Inventory, CMS, Coupons & Activity Log migrations to Neon PostgreSQL...");

  // 1. Inventory Batches table
  await sql`
    CREATE TABLE IF NOT EXISTS "inventory_batches" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "product_id" uuid NOT NULL,
      "batch_number" varchar(100) NOT NULL,
      "manufacturing_date" timestamp with time zone,
      "expiry_date" timestamp with time zone NOT NULL,
      "quantity" integer NOT NULL,
      "initial_quantity" integer NOT NULL,
      "mrp" numeric(10, 2),
      "cost_price" numeric(10, 2),
      "status" varchar(30) DEFAULT 'IN_STOCK' NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "inventory_batches"
      ADD CONSTRAINT "inventory_batches_product_id_products_id_fk"
      FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`CREATE INDEX IF NOT EXISTS "idx_inventory_batches_product_id" ON "inventory_batches" ("product_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_inventory_batches_batch_number" ON "inventory_batches" ("batch_number");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_inventory_batches_expiry_date" ON "inventory_batches" ("expiry_date");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_inventory_batches_status" ON "inventory_batches" ("status");`;

  // 2. Inventory Logs table
  await sql`
    CREATE TABLE IF NOT EXISTS "inventory_logs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "product_id" uuid NOT NULL,
      "batch_id" uuid,
      "change_type" varchar(50) NOT NULL,
      "previous_quantity" integer NOT NULL,
      "quantity_changed" integer NOT NULL,
      "new_quantity" integer NOT NULL,
      "reason" text,
      "updated_by" uuid,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "inventory_logs"
      ADD CONSTRAINT "inventory_logs_product_id_products_id_fk"
      FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "inventory_logs"
      ADD CONSTRAINT "inventory_logs_batch_id_batches_id_fk"
      FOREIGN KEY ("batch_id") REFERENCES "public"."inventory_batches"("id")
      ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "inventory_logs"
      ADD CONSTRAINT "inventory_logs_updated_by_users_id_fk"
      FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
      ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`CREATE INDEX IF NOT EXISTS "idx_inventory_logs_product_id" ON "inventory_logs" ("product_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_inventory_logs_change_type" ON "inventory_logs" ("change_type");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_inventory_logs_updated_by" ON "inventory_logs" ("updated_by");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_inventory_logs_created_at" ON "inventory_logs" ("created_at");`;

  // 3. Coupons table
  await sql`
    CREATE TABLE IF NOT EXISTS "coupons" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "code" varchar(50) UNIQUE NOT NULL,
      "description" text,
      "discount_type" varchar(20) NOT NULL,
      "discount_value" numeric(10, 2) NOT NULL,
      "min_order_value" numeric(10, 2) DEFAULT '0.00' NOT NULL,
      "max_discount" numeric(10, 2),
      "usage_limit" integer,
      "usage_count" integer DEFAULT 0 NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "start_date" timestamp with time zone DEFAULT now(),
      "expiry_date" timestamp with time zone NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS "idx_coupons_code" ON "coupons" ("code");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_coupons_is_active" ON "coupons" ("is_active");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_coupons_expiry_date" ON "coupons" ("expiry_date");`;

  // 4. CMS Banners table
  await sql`
    CREATE TABLE IF NOT EXISTS "cms_banners" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "title" varchar(255) NOT NULL,
      "subtitle" varchar(255),
      "image_url" varchar(500) NOT NULL,
      "target_url" varchar(500),
      "section" varchar(100) DEFAULT 'HOMEPAGE_HERO' NOT NULL,
      "display_order" integer DEFAULT 0 NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "start_date" timestamp with time zone DEFAULT now(),
      "end_date" timestamp with time zone,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS "idx_cms_banners_section" ON "cms_banners" ("section");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_cms_banners_is_active" ON "cms_banners" ("is_active");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_cms_banners_display_order" ON "cms_banners" ("display_order");`;

  // 5. Admin Activity Logs table
  await sql`
    CREATE TABLE IF NOT EXISTS "admin_activity_logs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "admin_id" uuid NOT NULL,
      "action" varchar(100) NOT NULL,
      "module" varchar(50) NOT NULL,
      "target_id" varchar(100),
      "details" jsonb,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "admin_activity_logs"
      ADD CONSTRAINT "admin_activity_logs_admin_id_users_id_fk"
      FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`CREATE INDEX IF NOT EXISTS "idx_activity_logs_admin_id" ON "admin_activity_logs" ("admin_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_activity_logs_module" ON "admin_activity_logs" ("module");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_activity_logs_action" ON "admin_activity_logs" ("action");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_activity_logs_created_at" ON "admin_activity_logs" ("created_at");`;

  // 6. Wholesale Profiles table
  await sql`
    CREATE TABLE IF NOT EXISTS "wholesale_profiles" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid UNIQUE NOT NULL,
      "business_name" varchar(255) NOT NULL,
      "owner_name" varchar(150) NOT NULL,
      "business_type" "public"."wholesale_business_type_enum" NOT NULL,
      "gst_number" varchar(15) NOT NULL,
      "drug_license_number" varchar(100) NOT NULL,
      "drug_license_expiry" timestamp with time zone,
      "phone" varchar(20) NOT NULL,
      "email" varchar(255) NOT NULL,
      "address" text NOT NULL,
      "city" varchar(100),
      "state" varchar(100),
      "pincode" varchar(20),
      "status" "public"."wholesale_status_enum" DEFAULT 'PENDING_VERIFICATION' NOT NULL,
      "rejection_reason" text,
      "credit_limit" numeric(12, 2) DEFAULT '0.00' NOT NULL,
      "outstanding_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
      "approved_by" uuid,
      "approved_at" timestamp with time zone,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "wholesale_profiles"
      ADD CONSTRAINT "wholesale_profiles_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "wholesale_profiles"
      ADD CONSTRAINT "wholesale_profiles_approved_by_users_id_fk"
      FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id")
      ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`CREATE INDEX IF NOT EXISTS "idx_wholesale_profiles_user_id" ON "wholesale_profiles" ("user_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_wholesale_profiles_gst_number" ON "wholesale_profiles" ("gst_number");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_wholesale_profiles_status" ON "wholesale_profiles" ("status");`;

  logger.info("✅ Admin tables, constraints, and performance indexes successfully applied to Neon PostgreSQL!");
}

if (require.main === module) {
  runAdminMigration()
    .then(() => {
      logger.info("Admin migration script finished.");
      process.exit(0);
    })
    .catch((err) => {
      logger.error("Admin migration failed:", err);
      process.exit(1);
    });
}
