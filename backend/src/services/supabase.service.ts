import { createClient } from "@supabase/supabase-js";
import { config } from "../config/env.js";

const supabaseKey = config.supabase.serviceRoleKey || config.supabase.anonKey;

if (!config.supabase.url || !supabaseKey) {
  console.warn(
    "[Supabase Service] Warning: SUPABASE_URL or key is missing. Database operations may fail.",
  );
}

export const supabase = createClient(config.supabase.url, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
