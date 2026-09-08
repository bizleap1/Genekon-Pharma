import { sql } from "../config/database";
import { logger } from "../utils/logger";

async function runMigration() {
  logger.info("Applying Product & Category database migrations to Neon PostgreSQL...");

  await sql`
    DO $$ BEGIN
      CREATE TYPE "public"."product_status_enum" AS ENUM('ACTIVE', 'DRAFT', 'ARCHIVED', 'OUT_OF_STOCK');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "categories" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" varchar(100) NOT NULL,
      "slug" varchar(120) NOT NULL,
      "image" varchar(500),
      "parent_category_id" uuid,
      "display_order" integer DEFAULT 0 NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "categories_slug_unique" UNIQUE("slug")
    );
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "categories" 
      ADD CONSTRAINT "categories_parent_category_id_categories_id_fk" 
      FOREIGN KEY ("parent_category_id") REFERENCES "public"."categories"("id") 
      ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "products" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" varchar(255) NOT NULL,
      "slug" varchar(280) NOT NULL,
      "brand" varchar(150) NOT NULL,
      "manufacturer" varchar(200) NOT NULL,
      "category_id" uuid NOT NULL,
      "description" text NOT NULL,
      "composition" text NOT NULL,
      "dosage_form" varchar(100) DEFAULT '10 Tablets' NOT NULL,
      "usage" text NOT NULL,
      "precautions" text NOT NULL,
      "storage_instructions" varchar(255) DEFAULT 'Store below 25°C in a dry place' NOT NULL,
      "mrp" numeric(10, 2) NOT NULL,
      "selling_price" numeric(10, 2) NOT NULL,
      "discount" numeric(5, 2) DEFAULT '0.00' NOT NULL,
      "gst" numeric(5, 2) DEFAULT '12.00' NOT NULL,
      "sku" varchar(60) NOT NULL,
      "stock_quantity" integer DEFAULT 50 NOT NULL,
      "prescription_required" boolean DEFAULT false NOT NULL,
      "status" "product_status_enum" DEFAULT 'ACTIVE' NOT NULL,
      "rating" numeric(3, 2) DEFAULT '4.50' NOT NULL,
      "review_count" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "products_slug_unique" UNIQUE("slug"),
      CONSTRAINT "products_sku_unique" UNIQUE("sku")
    );
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "products" 
      ADD CONSTRAINT "products_category_id_categories_id_fk" 
      FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") 
      ON DELETE restrict ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "product_images" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "product_id" uuid NOT NULL,
      "image_url" varchar(500) NOT NULL,
      "public_id" varchar(255),
      "alt_text" varchar(255) DEFAULT '' NOT NULL,
      "display_order" integer DEFAULT 0 NOT NULL,
      "is_primary" boolean DEFAULT false NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "product_images" 
      ADD CONSTRAINT "product_images_product_id_products_id_fk" 
      FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") 
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS "idx_categories_slug" ON "categories" ("slug");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_categories_parent_id" ON "categories" ("parent_category_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_categories_name" ON "categories" ("name");`;

  await sql`CREATE INDEX IF NOT EXISTS "idx_products_category_id" ON "products" ("category_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_products_brand" ON "products" ("brand");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_products_sku" ON "products" ("sku");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_products_slug" ON "products" ("slug");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_products_status" ON "products" ("status");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_products_name" ON "products" ("name");`;

  await sql`CREATE INDEX IF NOT EXISTS "idx_product_images_product_id" ON "product_images" ("product_id");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_product_images_display_order" ON "product_images" ("display_order");`;

  logger.info("✅ Successfully applied Product & Category migrations to Neon PostgreSQL!");
  process.exit(0);
}

runMigration().catch((err) => {
  logger.error("Migration error:", err);
  process.exit(1);
});
