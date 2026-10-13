import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5001,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  supabase: {
    url: process.env.SUPABASE_URL || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "",
  },
  cashfree: {
    appId: process.env.CASHFREE_APP_ID || "",
    secretKey: process.env.CASHFREE_SECRET_KEY || "",
    environment: (process.env.CASHFREE_ENVIRONMENT as "sandbox" | "production") || "sandbox",
    apiVersion: "2023-08-01",
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
  },
  cronSecret: process.env.CRON_SECRET || "",
};
