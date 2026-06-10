import type { SupabaseDbClient } from "@/types";

type Client = SupabaseDbClient;

export type AlertFilters = {
  city?: string;
  category?: string;
  from?: string;
  to?: string;
  resolved?: boolean;
};

export const alertsService = {
  async list(client: Client, filters: AlertFilters = {}) {
    let query = client
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }

    if (filters.category) {
      query = query.ilike("category", `%${filters.category}%`);
    }

    if (filters.from) {
      query = query.gte("created_at", filters.from);
    }

    if (filters.to) {
      query = query.lte("created_at", filters.to);
    }

    if (filters.resolved !== undefined) {
      query = query.eq("resolved", filters.resolved);
    }

    return query;
  },

  async listUnresolved(client: Client) {
    return this.list(client, { resolved: false });
  },

  async resolve(client: Client, id: string) {
    return client.from("alerts").update({ resolved: true }).eq("id", id);
  },
};

export const coverageAlertsService = {
  async list(client: Client, resolved = false) {
    return client
      .from("coverage_alerts")
      .select("*")
      .eq("resolved", resolved)
      .order("request_count", { ascending: false });
  },
};
