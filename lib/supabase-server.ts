import "server-only";
import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/server-env";

function isPlaceholderKey(value: string): boolean {
  const key = value.trim();
  return !key || key.includes("placeholder") || key.length < 80;
}

/** Service role in production; anon key locally when the service role is not configured. */
export function getSupabaseServerClient() {
  const anon =
    process.env.SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
  const key =
    isPlaceholderKey(serverEnv.supabaseServiceRoleKey) && anon
      ? anon
      : serverEnv.supabaseServiceRoleKey;
  return createClient(serverEnv.supabaseUrl, key, {
    auth: { persistSession: false }
  });
}
