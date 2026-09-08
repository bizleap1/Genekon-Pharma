import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load environment variables: check backend/.env first, fallback to root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const envSchema = z.object({
  PORT: z.string().default("5000").transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  JWT_ACCESS_SECRET: z.string().default("genekon_pharmacy_jwt_access_secret_key_2026_super_secure_hash"),
  JWT_REFRESH_SECRET: z.string().default("genekon_pharmacy_jwt_refresh_secret_key_2026_super_secure_hash"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  RESEND_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
