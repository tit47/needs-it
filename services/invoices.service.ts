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
};
