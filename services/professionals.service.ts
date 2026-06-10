import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
type Client = SupabaseClient<Database>;

export const professionalsService = {
  async list(client: Client) {
    return client
      .from("professionals")
      .select("*")
      .order("full_name");
  },

  async getById(client: Client, id: string) {
    return client.from("professionals").select("*").eq("id", id).single();
  },

  async getBySiren(client: Client, siren: string) {
    return client
      .from("professionals")
      .select("*")
      .eq("siren", siren)
      .maybeSingle();
  },

  async updateStatus(client: Client, id: string, active: boolean) {
    return client.from("professionals").update({ active }).eq("id", id);
  },

  async incrementCompletedJobs(client: Client, id: string) {
    const { data: professional } = await client
      .from("professionals")
      .select("completed_jobs")
      .eq("id", id)
      .single();

    if (!professional) {
      return { data: null, error: { message: "Professionnel introuvable." } };
    }

    return client
      .from("professionals")
      .update({ completed_jobs: professional.completed_jobs + 1 })
      .eq("id", id);
  },
};
