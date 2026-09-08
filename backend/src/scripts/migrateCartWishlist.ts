import { sql } from "../config/database";
import { logger } from "../utils/logger";

async function runCartWishlistMigration() {
  logger.info("Applying Cart & Wishlist database migrations to Neon PostgreSQL...");

  // 1. Create cart table
  await sql`
    CREATE TABLE IF NOT EXISTS "cart" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "cart_user_id_unique" UNIQUE("user_id")
    );
  `;

  // Foreign key for cart.user_id
  await sql`
    DO $$ BEGIN
      ALTER TABLE "cart"
      ADD CONSTRAINT "cart_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "idx_cart_user_id" ON "cart" ("user_id");
  `;

  // 2. Create cart_items table
  await sql`
    CREATE TABLE IF NOT EXISTS "cart_items" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "cart_id" uuid NOT NULL,
      "product_id" uuid NOT NULL,
      "quantity" integer DEFAULT 1 NOT NULL,
      "price" numeric(10, 2) NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  // Foreign keys for cart_items
  await sql`
    DO $$ BEGIN
      ALTER TABLE "cart_items"
      ADD CONSTRAINT "cart_items_cart_id_cart_id_fk"
      FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "cart_items"
      ADD CONSTRAINT "cart_items_product_id_products_id_fk"
      FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "idx_cart_items_cart_id" ON "cart_items" ("cart_id");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "idx_cart_items_product_id" ON "cart_items" ("product_id");
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "idx_cart_items_cart_product" ON "cart_items" ("cart_id", "product_id");
  `;

  // 3. Create wishlist table
  await sql`
    CREATE TABLE IF NOT EXISTS "wishlist" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "product_id" uuid NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  // Foreign keys for wishlist
  await sql`
    DO $$ BEGIN
      ALTER TABLE "wishlist"
      ADD CONSTRAINT "wishlist_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE "wishlist"
      ADD CONSTRAINT "wishlist_product_id_products_id_fk"
      FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "idx_wishlist_user_id" ON "wishlist" ("user_id");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "idx_wishlist_product_id" ON "wishlist" ("product_id");
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "idx_wishlist_user_product" ON "wishlist" ("user_id", "product_id");
  `;

  logger.info("✅ Cart & Wishlist tables, foreign keys, and indexes successfully applied to Neon!");
}

runCartWishlistMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    logger.error("Migration failed:", err);
    process.exit(1);
  });
