import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../db/schema";
import { env } from "./env";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Neon serverless SQL client (WebSocket transport for transaction support)
const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });
export const sql = pool.query.bind(pool) as any;
