import { createClient } from "@supabase/supabase-js";
import type { SupabaseDbClient } from "@/types";

/**
 * Client Supabase avec clé service role — réservé aux opérations serveur
 * (API routes, jobs, actions admin). Ne jamais exposer côté client.
 */
export function createAdminClient(): SupabaseDbClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  ) as SupabaseDbClient;
}
