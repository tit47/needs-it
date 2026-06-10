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

  async createClaim(
    client: Client,
    requestId: string,
    professionalId: string
  ) {
    return client
      .from("claims")
      .insert({
        request_id: requestId,
        professional_id: professionalId,
        status: "claimed",
        claimed_at: new Date().toISOString(),
      })
      .select("*")
      .single();
  },

  async releaseClaim(client: Client, requestId: string, professionalId: string) {
    const { data: activeClaim } = await client
      .from("claims")
      .select("id")
      .eq("request_id", requestId)
      .eq("professional_id", professionalId)
      .eq("status", "claimed")
      .maybeSingle();

    if (!activeClaim) {
      return { data: null, error: { message: "Aucune mission active." } };
    }

    return client
      .from("claims")
      .update({
        status: "released",
        released_at: new Date().toISOString(),
      })
      .eq("id", activeClaim.id)
      .select("*")
      .single();
  },
};
