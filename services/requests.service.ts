import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, RequestStatus } from "@/types";

type Client = SupabaseClient<Database>;

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
      .select("*, categories(name)")
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
      .single();
  },

  async updateStatus(client: Client, id: string, status: RequestStatus) {
    return client
      .from("requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
  },
};
