import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

type Client = SupabaseClient<Database>;

export const claimsService = {
  async getByRequest(client: Client, requestId: string) {
    return client
      .from("claims")
      .select("*, professionals(full_name, email, phone)")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });
  },

  async getActiveByRequest(client: Client, requestId: string) {
    return client
      .from("claims")
      .select("*")
      .eq("request_id", requestId)
      .eq("status", "claimed")
      .maybeSingle();
  },
};
