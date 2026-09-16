import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load environment variables: check backend/.env first, fallback to root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });



const envSchema = z
  .object({
    PORT: z.string().default("5000").transform((v) => parseInt(v, 10)),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    DATABASE_URL_UNPOOLED: z.string().optional(),
    FRONTEND_URL: z.string().default("http://localhost:3000"),
    JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
    JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
    JWT_ACCESS_EXPIRY: z.string().default("15m"),
    JWT_REFRESH_EXPIRY: z.string().default("7d"),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().default("Genekon Pharmacy <onboarding@resend.dev>"),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GETOTP_API_KEY: z.string().optional(),
    GETOTP_SENDER: z.string().default("OTP Dev"),
    GETOTP_TEMPLATE_ID: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().default("hsufdlap"),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    RAZORPAY_KEY_ID: z.string().min(1, "RAZORPAY_KEY_ID is required"),
    RAZORPAY_KEY_SECRET: z.string().min(1, "RAZORPAY_KEY_SECRET is required"),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1, "RAZORPAY_WEBHOOK_SECRET is required"),
  });

export const env = envSchema.parse(process.env);
