import type { RequestStatus, SupabaseDbClient } from "@/types";

type Client = SupabaseDbClient;

export type CreateRequestInput = {
  category_id: string;
  description: string;
  client_name: string;
  client_phone: string;
  client_address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  mission_code: string;
};

export const requestsService = {
  async list(client: Client) {
    return client
      .from("requests")
      .select(
        "*, categories(name), professionals!requests_claimed_by_fkey(full_name)"
      )
      .order("created_at", { ascending: false });
  },

  async getById(client: Client, id: string) {
    return client
      .from("requests")
      .select("*, categories(name), request_photos(*), request_events(*)")
      .eq("id", id)
      .single();
  },

  async getByMissionCode(client: Client, missionCode: string) {
    return client
      .from("requests")
      .select("id")
      .eq("mission_code", missionCode)
      .maybeSingle();
  },

  async create(client: Client, input: CreateRequestInput) {
    return client
      .from("requests")
      .insert({
        ...input,
        status: "pending",
        search_extended: false,
      })
      .select("id, mission_code")
      .single<{ id: string; mission_code: string }>();
  },

  async updateStatus(client: Client, id: string, status: RequestStatus) {
    return client
      .from("requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
  },

  async updateMatchingMetadata(
    client: Client,
    id: string,
    metadata: {
      first_pro_distance: number | null;
      professional_count: number;
    }
  ) {
    return client
      .from("requests")
      .update({
        ...metadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  },

  async claimRequest(
    client: Client,
    id: string,
    professionalId: string
  ) {
    return client
      .from("requests")
      .update({
        status: "claimed",
        claimed_by: professionalId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "pending")
      .select("id");
  },

  async releaseRequest(client: Client, id: string) {
    return client
      .from("requests")
      .update({
        status: "pending",
        claimed_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "claimed")
      .select("id");
  },
};
