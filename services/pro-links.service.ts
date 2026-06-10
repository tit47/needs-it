import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, RequestProfessionalLink } from "@/types";

type Client = SupabaseClient<Database>;

export type ProLinkWithRelations = RequestProfessionalLink & {
  requests: {
    id: string;
    category_id: string;
    description: string;
    client_name: string;
    client_phone: string;
    client_address: string;
    city: string;
    mission_code: string;
    status: string;
    claimed_by: string | null;
    created_at: string;
    categories: { name: string } | null;
    request_photos: { id: string; photo_url: string }[];
  };
  professionals: {
    id: string;
    full_name: string;
    email: string;
  };
};

export const proLinksService = {
  async getByToken(client: Client, token: string) {
    return client
      .from("request_professional_links")
      .select(
        `
        *,
        requests(
          id,
          category_id,
          description,
          client_name,
          client_phone,
          client_address,
          city,
          mission_code,
          status,
          claimed_by,
          created_at,
          categories(name),
          request_photos(id, photo_url)
        ),
        professionals(id, full_name, email)
      `
      )
      .eq("token", token)
      .maybeSingle<ProLinkWithRelations>();
  },

  async listByRequest(client: Client, requestId: string) {
    return client
      .from("request_professional_links")
      .select("*, professionals(id, full_name, email)")
      .eq("request_id", requestId)
      .order("distance_km");
  },

  async createMany(
    client: Client,
    links: Array<{
      request_id: string;
      professional_id: string;
      token: string;
      distance_km: number;
    }>
  ) {
    if (!links.length) {
      return { data: [], error: null };
    }

    return client.from("request_professional_links").insert(links).select("*");
  },

  async markEmailSent(client: Client, linkId: string) {
    return client
      .from("request_professional_links")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", linkId);
  },

  async markLinkOpened(client: Client, linkId: string) {
    return client
      .from("request_professional_links")
      .update({ link_opened_at: new Date().toISOString() })
      .eq("id", linkId)
      .is("link_opened_at", null);
  },

  async markReminderSent(client: Client, linkId: string) {
    return client
      .from("request_professional_links")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", linkId);
  },

  async deactivateOthers(
    client: Client,
    requestId: string,
    keepProfessionalId: string
  ) {
    return client
      .from("request_professional_links")
      .update({ active: false })
      .eq("request_id", requestId)
      .neq("professional_id", keepProfessionalId);
  },

  async reactivateAll(client: Client, requestId: string) {
    return client
      .from("request_professional_links")
      .update({ active: true })
      .eq("request_id", requestId);
  },

  async listPendingReminders(client: Client, olderThanMinutes = 30) {
    const cutoff = new Date(
      Date.now() - olderThanMinutes * 60 * 1000
    ).toISOString();

    const { data: pendingRequests } = await client
      .from("requests")
      .select("id")
      .eq("status", "pending")
      .lt("created_at", cutoff);

    if (!pendingRequests?.length) {
      return { data: [], error: null };
    }

    const requestIds = pendingRequests.map((request) => request.id);

    return client
      .from("request_professional_links")
      .select(
        `
        *,
        requests(id, status, created_at, description, categories(name)),
        professionals(id, full_name, email)
      `
      )
      .in("request_id", requestIds)
      .eq("active", true)
      .is("reminder_sent_at", null)
      .not("email_sent_at", "is", null);
  },
};
