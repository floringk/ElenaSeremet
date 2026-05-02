import "server-only";
import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/server-env";

export function getSupabaseServerClient() {
  return createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { persistSession: false }
  });
}
