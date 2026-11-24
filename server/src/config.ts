import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/ebook-store"),
  JWT_SECRET: z.string().min(32).default("development-only-secret-change-before-deploy-2026"),
  PAYPAL_CLIENT_ID: z.string().default(""),
  PAYPAL_CLIENT_SECRET: z.string().default(""),
  PAYPAL_API_BASE: z.string().url().default("https://api-m.sandbox.paypal.com"),
});

export const config = schema.parse(process.env);
