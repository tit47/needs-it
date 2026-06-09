import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, Database } from "@/types";

type Client = SupabaseClient<Database>;

export const categoriesService = {
  async list(client: Client, activeOnly = true) {
    let query = client.from("categories").select("*").order("name");

    if (activeOnly) {
      query = query.eq("active", true);
    }

    return query;
  },

  async getById(client: Client, id: string) {
    return client.from("categories").select("*").eq("id", id).single();
  },

  async search(client: Client, term: string) {
    return client
      .from("categories")
      .select("*")
      .eq("active", true)
      .ilike("name", `%${term}%`)
      .order("name");
  },
};
