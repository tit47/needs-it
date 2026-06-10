import type { Alert, AlertLevel, RequestEvent, SupabaseDbClient } from "@/types";
import { formatEventLabel } from "@/utils/admin-labels";
import { startOfTodayIso } from "@/utils/datetime";

type Client = SupabaseDbClient;

export type DashboardStats = {
  requestsToday: number;
  missionsClaimedToday: number;
  claimRatePercent: number | null;
  activeProfessionals: number;
};

export type ActivityItem = {
  id: string;
  createdAt: string;
  label: string;
  kind: "event" | "alert" | "candidate";
};

export type ImportantAlertItem = {
  id: string;
  city: string;
  category: string;
  level: AlertLevel;
  message: string;
  source: "alert" | "coverage";
};

type EventRow = {
  id: string;
  event_type: RequestEvent["event_type"];
  created_at: string;
  requests: {
    city: string;
    categories: { name: string } | { name: string }[] | null;
  } | {
    city: string;
    categories: { name: string } | { name: string }[] | null;
  }[] | null;
};

function getCategoryName(
  categories: EventRow["requests"] extends infer R ? R : never
): string | undefined {
  if (!categories || typeof categories !== "object") return undefined;
  if (Array.isArray(categories)) {
    const firstCategory = categories[0]?.categories;
    if (Array.isArray(firstCategory)) return firstCategory[0]?.name;
    return firstCategory?.name;
  }
  if (Array.isArray(categories.categories)) {
    return categories.categories[0]?.name;
  }
  return categories.categories?.name;
}

function getEventCity(requests: EventRow["requests"]): string | undefined {
  if (!requests) return undefined;
  if (Array.isArray(requests)) return requests[0]?.city;
  return requests.city;
}

export const dashboardService = {
  async getStats(client: Client): Promise<DashboardStats> {
    const todayIso = startOfTodayIso();

    const [
      { count: requestsToday },
      { count: missionsClaimedToday },
      { count: activeProfessionals },
    ] = await Promise.all([
      client
        .from("requests")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayIso),
      client
        .from("claims")
        .select("*", { count: "exact", head: true })
        .eq("status", "claimed")
        .gte("claimed_at", todayIso),
      client
        .from("professionals")
        .select("*", { count: "exact", head: true })
        .eq("active", true),
    ]);

    const todayRequests = requestsToday ?? 0;
    const todayClaims = missionsClaimedToday ?? 0;

    return {
      requestsToday: todayRequests,
      missionsClaimedToday: todayClaims,
      claimRatePercent:
        todayRequests > 0
          ? Math.round((todayClaims / todayRequests) * 100)
          : null,
      activeProfessionals: activeProfessionals ?? 0,
    };
  },

  async getRecentActivity(client: Client, limit = 12): Promise<ActivityItem[]> {
    const items: ActivityItem[] = [];

    const { data: events } = await client
      .from("request_events")
      .select("id, event_type, created_at, requests(city, categories(name))")
      .in("event_type", [
        "request_created",
        "mission_claimed",
        "mission_released",
        "mission_completed",
      ])
      .order("created_at", { ascending: false })
      .limit(limit);

    for (const event of (events ?? []) as EventRow[]) {
      items.push({
        id: `event-${event.id}`,
        createdAt: event.created_at,
        label: formatEventLabel(
          event.event_type,
          getCategoryName(event.requests),
          getEventCity(event.requests)
        ),
        kind: "event",
      });
    }

    const { data: alerts } = await client
      .from("alerts")
      .select("id, city, category, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    for (const alert of alerts ?? []) {
      items.push({
        id: `alert-${alert.id}`,
        createdAt: alert.created_at,
        label: `Alerte couverture ${alert.city}`,
        kind: "alert",
      });
    }

    const { data: candidates } = await client
      .from("candidate_professionals")
      .select("id, full_name, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5);

    for (const candidate of candidates ?? []) {
      items.push({
        id: `candidate-${candidate.id}`,
        createdAt: candidate.created_at,
        label: `Nouveau professionnel candidat — ${candidate.full_name}`,
        kind: "candidate",
      });
    }

    return items
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
  },

  async getImportantAlerts(client: Client): Promise<ImportantAlertItem[]> {
    const { data: alerts } = await client
      .from("alerts")
      .select("*")
      .eq("resolved", false)
      .in("level", ["red", "orange"])
      .order("created_at", { ascending: false })
      .limit(8);

    const { data: coverageAlerts } = await client
      .from("coverage_alerts")
      .select("*")
      .eq("resolved", false)
      .in("level", ["red", "orange"])
      .order("last_seen", { ascending: false })
      .limit(8);

    const alertItems: ImportantAlertItem[] = (alerts ?? []).map(
      (alert: Alert) => ({
        id: alert.id,
        city: alert.city,
        category: alert.category,
        level: alert.level,
        message: alert.message,
        source: "alert" as const,
      })
    );

    const coverageItems: ImportantAlertItem[] = (coverageAlerts ?? []).map(
      (alert) => ({
        id: alert.id,
        city: alert.city,
        category: alert.category,
        level: alert.level,
        message: `${alert.request_count} demandes — ${alert.success_count} satisfaites`,
        source: "coverage" as const,
      })
    );

    return [...alertItems, ...coverageItems]
      .sort((a, b) => {
        const levelOrder = { red: 0, orange: 1, green: 2 };
        return levelOrder[a.level] - levelOrder[b.level];
      })
      .slice(0, 8);
  },
};
