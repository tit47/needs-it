import type { SupabaseClient } from "@supabase/supabase-js";
import type { CandidateStatus, Database } from "@/types";

type Client = SupabaseClient<Database>;

export const candidatesService = {
  async list(client: Client, status?: CandidateStatus) {
    let query = client
      .from("candidate_professionals")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    return query;
  },

  async updateStatus(client: Client, id: string, status: CandidateStatus) {
    return client
      .from("candidate_professionals")
      .update({ status })
      .eq("id", id);
  },
};
