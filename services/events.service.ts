import type { RequestEventType, SupabaseDbClient } from "@/types";

type Client = SupabaseDbClient;

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

  async listRecent(client: Client, limit = 20) {
    return client
      .from("request_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
  },
};
