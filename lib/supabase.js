import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "missing-key";

// Browser client (keeps the admin login session)
export const supabase = createClient(url, key);

// Server client (no session, used by the public page)
export function getServerClient() {
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
