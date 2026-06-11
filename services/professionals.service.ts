import type { SupabaseDbClient } from "@/types";
type Client = SupabaseDbClient;

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

  async create(
    client: Client,
    data: {
      full_name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      latitude: number | null;
      longitude: number | null;
      siren: string;
      categories: string[];
      radius_km: number;
      active: boolean;
    }
  ) {
    return client.from("professionals").insert(data).select("*").single();
  },

  async update(
    client: Client,
    id: string,
    data: {
      full_name?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      siren?: string;
      categories?: string[];
      radius_km?: number;
    }
  ) {
    return client.from("professionals").update(data).eq("id", id).select("*").single();
  },

  async getUnpaidAmount(client: Client, professionalId: string) {
    const { data } = await client
      .from("invoices")
      .select("amount")
      .eq("professional_id", professionalId)
      .eq("paid", false);

    return (data ?? []).reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  },

  async getClaimHistory(client: Client, professionalId: string) {
    return client
      .from("claims")
      .select(
        "id, status, claimed_at, released_at, created_at, requests(id, city, status, mission_code, categories(name))"
      )
      .eq("professional_id", professionalId)
      .order("created_at", { ascending: false });
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
