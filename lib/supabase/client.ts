import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getRequiredSupabaseConfig } from "@/lib/supabase/config";

export function createClient() {
  const { url, publishableKey } = getRequiredSupabaseConfig();

  return createBrowserClient<Database>(url, publishableKey);
}
