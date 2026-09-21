import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("Starting Search Schema migration...");
    await client.query("BEGIN");

    // 1. Add product_type_enum if it doesn't exist
    const enumCheck = await client.query(`
      SELECT 1 FROM pg_type WHERE typname = 'product_type_enum';
    `);

    if (enumCheck.rows.length === 0) {
      console.log("Creating product_type_enum...");
      await client.query(`
        CREATE TYPE product_type_enum AS ENUM ('GENERIC', 'BRANDED', 'OTHER');
      `);
    }

    // 2. Add columns to products table if they don't exist
    console.log("Checking products table columns...");
    
    // product_type
    const productTypeCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='product_type';
    `);
    
    if (productTypeCheck.rows.length === 0) {
      console.log("Adding product_type to products...");
      await client.query(`
        ALTER TABLE "products" ADD COLUMN "product_type" product_type_enum DEFAULT 'OTHER' NOT NULL;
      `);
    }

    // strength
    const strengthCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='strength';
    `);
    
    if (strengthCheck.rows.length === 0) {
      console.log("Adding strength to products...");
      await client.query(`
        ALTER TABLE "products" ADD COLUMN "strength" varchar(100);
      `);
    }

    // route
    const routeCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='route';
    `);
    
    if (routeCheck.rows.length === 0) {
      console.log("Adding route to products...");
      await client.query(`
        ALTER TABLE "products" ADD COLUMN "route" varchar(100);
      `);
    }

    // 3. Create medicine_comparisons table if not exists
    console.log("Creating medicine_comparisons table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "medicine_comparisons" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "branded_product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "generic_product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    // Unique index
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_medicine_comparisons_unique" 
      ON "medicine_comparisons" ("branded_product_id", "generic_product_id");
    `);

    await client.query("COMMIT");
    console.log("Migration completed successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
