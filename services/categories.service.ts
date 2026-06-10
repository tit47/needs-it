import type { Category, SupabaseDbClient } from "@/types";

type Client = SupabaseDbClient;

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

  async create(client: Client, name: string) {
    return client
      .from("categories")
      .insert({ name, active: true })
      .select("*")
      .single();
  },

  async setActive(client: Client, id: string, active: boolean) {
    return client.from("categories").update({ active }).eq("id", id);
  },

  async updateName(client: Client, id: string, name: string) {
    return client.from("categories").update({ name }).eq("id", id);
  },
};
