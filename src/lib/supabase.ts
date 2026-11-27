import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://xhrobyrxirikddzjhacw.supabase.co"
).trim();

const supabaseKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_ydMKw_5m9TBpzyFPOKmtbg_UG_JdgaV"
).trim();

export const supabase = createClient(supabaseUrl, supabaseKey);