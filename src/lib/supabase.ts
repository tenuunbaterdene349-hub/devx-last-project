import { createClient } from "@supabase/supabase-js";

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
).trim();

const isValidHttpUrl = /^https?:\/\/.+/.test(rawUrl);
const supabaseUrl = isValidHttpUrl
  ? rawUrl
  : "https://placeholder.supabase.co";

export const supabase = createClient(supabaseUrl, supabaseKey || "placeholder-key");