import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load environment variables: check backend/.env first, fallback to root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const DEFAULT_SECRETS: Record<string, string> = {
  JWT_ACCESS_SECRET: "genekon_pharmacy_jwt_access_secret_key_2026_super_secure_hash",
  JWT_REFRESH_SECRET: "genekon_pharmacy_jwt_refresh_secret_key_2026_super_secure_hash",
  CLOUDINARY_API_SECRET: "H53kwGjBTkMnWPKk4fWRvEmqO6k",
  RAZORPAY_KEY_ID: "rzp_test_TZVi7dlYcaCcmf",
  RAZORPAY_KEY_SECRET: "JvrjYk4Rp2cv6YeaLHKRqqJP",
  RAZORPAY_WEBHOOK_SECRET: "genekon_razorpay_webhook_secret_2026",
};

const envSchema = z
  .object({
    PORT: z.string().default("5000").transform((v) => parseInt(v, 10)),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    DATABASE_URL_UNPOOLED: z.string().optional(),
    FRONTEND_URL: z.string().default("http://localhost:3000"),
    JWT_ACCESS_SECRET: z.string().default(DEFAULT_SECRETS.JWT_ACCESS_SECRET),
    JWT_REFRESH_SECRET: z.string().default(DEFAULT_SECRETS.JWT_REFRESH_SECRET),
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
    CLOUDINARY_API_SECRET: z.string().default(DEFAULT_SECRETS.CLOUDINARY_API_SECRET),
    RAZORPAY_KEY_ID: z.string().default(DEFAULT_SECRETS.RAZORPAY_KEY_ID),
    RAZORPAY_KEY_SECRET: z.string().default(DEFAULT_SECRETS.RAZORPAY_KEY_SECRET),
    RAZORPAY_WEBHOOK_SECRET: z.string().default(DEFAULT_SECRETS.RAZORPAY_WEBHOOK_SECRET),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
      for (const [key, defaultVal] of Object.entries(DEFAULT_SECRETS)) {
        if ((data as any)[key] === defaultVal) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Production security violation: Insecure committed default for '${key}' is forbidden. Set a secure secret in production environment.`,
            path: [key],
          });
        }
      }
    }
  });

export const env = envSchema.parse(process.env);
