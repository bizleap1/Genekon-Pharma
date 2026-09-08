import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { env } from "./env";

// Neon serverless SQL client (HTTP transport over connection pooler)
export const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
