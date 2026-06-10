import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
type Client = SupabaseClient<Database>;

export const invoicesService = {
  async list(client: Client) {
    return client
      .from("invoices")
      .select("*, professionals(full_name, email)")
      .order("month", { ascending: false });
  },

  async getByProfessionalAndMonth(
    client: Client,
    professionalId: string,
    month: string
  ) {
    return client
      .from("invoices")
      .select("*")
      .eq("professional_id", professionalId)
      .eq("month", month)
      .maybeSingle();
  },

  async prepareMissionBilling(client: Client, professionalId: string) {
    const month = new Date().toISOString().slice(0, 7);
    const { data: existing } = await this.getByProfessionalAndMonth(
      client,
      professionalId,
      month
    );

    if (existing) {
      return client
        .from("invoices")
        .update({
          mission_count: existing.mission_count + 1,
        })
        .eq("id", existing.id)
        .select("*")
        .single();
    }

    return client
      .from("invoices")
      .insert({
        professional_id: professionalId,
        month,
        mission_count: 1,
        amount: 0,
      })
      .select("*")
      .single();
  },
};
