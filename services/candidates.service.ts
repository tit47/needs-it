import type { CandidateStatus, SupabaseDbClient } from "@/types";

type Client = SupabaseDbClient;

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

  async getById(client: Client, id: string) {
    return client
      .from("candidate_professionals")
      .select("*")
      .eq("id", id)
      .single();
  },

  async updateStatus(client: Client, id: string, status: CandidateStatus) {
    return client
      .from("candidate_professionals")
      .update({ status })
      .eq("id", id);
  },

  async accept(client: Client, id: string) {
    const { data: candidate, error: fetchError } = await this.getById(
      client,
      id
    );

    if (fetchError || !candidate) {
      return { data: null, error: fetchError ?? { message: "Candidat introuvable." } };
    }

    const { data: existingPro } = await client
      .from("professionals")
      .select("id")
      .eq("siren", candidate.siren)
      .maybeSingle();

    if (existingPro) {
      return {
        data: null,
        error: { message: "Un professionnel avec ce SIREN existe déjà." },
      };
    }

    const { data: professional, error: insertError } = await client
      .from("professionals")
      .insert({
        full_name: candidate.full_name,
        email: candidate.email,
        phone: candidate.phone,
        address: candidate.address,
        city: candidate.city,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        siren: candidate.siren,
        categories: candidate.categories,
        radius_km: candidate.radius_km,
        active: true,
      })
      .select("*")
      .single();

    if (insertError) {
      return { data: null, error: insertError };
    }

    const { error: updateError } = await this.updateStatus(client, id, "accepted");

    if (updateError) {
      return { data: null, error: updateError };
    }

    return { data: professional, error: null };
  },
};
