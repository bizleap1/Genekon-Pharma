import { Pool } from "@neondatabase/serverless";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = ws;

async function runMigration() {
  logger.info("Applying Prescription schema migrations to Neon PostgreSQL...");
  const pool = new Pool({ connectionString: env.DATABASE_URL });

  // Add NEEDS_REUPLOAD to rx_status_enum
  await pool.query(`
    DO $$ BEGIN
      ALTER TYPE "public"."rx_status_enum" ADD VALUE 'NEEDS_REUPLOAD';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Add USED_FOR_ORDER to rx_status_enum
  await pool.query(`
    DO $$ BEGIN
      ALTER TYPE "public"."rx_status_enum" ADD VALUE 'USED_FOR_ORDER';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Add new columns to prescriptions table
  await pool.query(`
    ALTER TABLE "prescriptions"
    ADD COLUMN IF NOT EXISTS "customer_note" text,
    ADD COLUMN IF NOT EXISTS "address_id" uuid;
  `);

  // Add foreign key for address_id if it doesn't exist
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'prescriptions_address_id_user_addresses_id_fk'
      ) THEN
        ALTER TABLE "prescriptions"
        ADD CONSTRAINT "prescriptions_address_id_user_addresses_id_fk"
        FOREIGN KEY ("address_id") REFERENCES "public"."user_addresses"("id")
        ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;
  `);

  logger.info("✅ Successfully applied Prescription migrations to Neon PostgreSQL!");
  process.exit(0);
}

runMigration().catch((err) => {
  logger.error("Migration error:", err);
  process.exit(1);
});
