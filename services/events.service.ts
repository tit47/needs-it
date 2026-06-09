import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, RequestEventType } from "@/types";

type Client = SupabaseClient<Database>;

export const eventsService = {
  async log(
    client: Client,
    requestId: string,
    eventType: RequestEventType,
    details?: Record<string, unknown>
  ) {
    return client.from("request_events").insert({
      request_id: requestId,
      event_type: eventType,
      details: details ?? null,
    });
  },

  async getByRequest(client: Client, requestId: string) {
    return client
      .from("request_events")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });
  },
};
