import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

type Client = SupabaseClient<Database>;

export const alertsService = {
  async listUnresolved(client: Client) {
    return client
      .from("alerts")
      .select("*")
      .eq("resolved", false)
      .order("created_at", { ascending: false });
  },

  async resolve(client: Client, id: string) {
    return client.from("alerts").update({ resolved: true }).eq("id", id);
  },
};

export const coverageAlertsService = {
  async list(client: Client, resolved = false) {
    return client
      .from("coverage_alerts")
      .select("*")
      .eq("resolved", resolved)
      .order("request_count", { ascending: false });
  },
};
