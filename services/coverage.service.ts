import { renderCoverageAlertEmail } from "@/emails/templates/coverage-alert";
import { sendTelegramMessage } from "@/lib/telegram";
import { alertsService } from "@/services/alerts.service";
import { sendEmail } from "@/services/email.service";
import { requestsService } from "@/services/requests.service";
import { settingsService, SETTINGS_KEYS } from "@/services/settings.service";
import type { Alert, AlertLevel, CoverageAlert, SupabaseDbClient } from "@/types";
import { ALERT_LEVEL_LABELS } from "@/utils/admin-labels";
import {
  buildCoverageAlertMessage,
  buildNoResponseAlertMessage,
  computeCoveragePriority,
  computeSuccessRatePercent,
  getCoverageLevel,
  type CoveragePriority,
} from "@/utils/coverage";

type Client = SupabaseDbClient;

export type OpportunityRow = CoverageAlert & {
  successRatePercent: number | null;
  priority: CoveragePriority;
};

export type CategoryCoverageItem = {
  category: string;
  professionalCount: number;
  level: AlertLevel;
};

type ProcessNewRequestInput = {
  requestId: string;
  city: string;
  categoryName: string;
  professionalCount: number;
};

type ProcessNoResponseInput = {
  requestId: string;
  city: string;
  categoryName: string;
};

function getAdminAlertesUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/admin/alertes`;
}

function getAdminOpportunitesUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/admin/opportunites`;
}

function toOpportunityRow(alert: CoverageAlert): OpportunityRow {
  const successRatePercent = computeSuccessRatePercent(
    alert.request_count,
    alert.success_count
  );

  return {
    ...alert,
    successRatePercent,
    priority: computeCoveragePriority(
      alert.level,
      alert.request_count,
      successRatePercent
    ),
  };
}

async function upsertCoverageAlert(
  client: Client,
  city: string,
  category: string,
  professionalCount: number
): Promise<void> {
  const level = getCoverageLevel(professionalCount);
  const now = new Date().toISOString();

  const { data: existing } = await client
    .from("coverage_alerts")
    .select("*")
    .eq("city", city)
    .eq("category", category)
    .order("last_seen", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    await client
      .from("coverage_alerts")
      .update({
        request_count: existing.request_count + 1,
        level,
        resolved: false,
        last_seen: now,
      })
      .eq("id", existing.id);
    return;
  }

  await client.from("coverage_alerts").insert({
    city,
    category,
    request_count: 1,
    success_count: 0,
    level,
    resolved: false,
    first_seen: now,
    last_seen: now,
  });
}

async function incrementCoverageSuccess(
  client: Client,
  city: string,
  category: string
): Promise<void> {
  const { data: existing } = await client
    .from("coverage_alerts")
    .select("*")
    .eq("city", city)
    .eq("category", category)
    .order("last_seen", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existing) return;

  await client
    .from("coverage_alerts")
    .update({
      success_count: existing.success_count + 1,
      last_seen: new Date().toISOString(),
    })
    .eq("id", existing.id);
}

async function sendCoverageNotifications(
  client: Client,
  alert: Pick<Alert, "city" | "category" | "level" | "message">
): Promise<void> {
  if (alert.level === "green") return;

  const settingsMap = await settingsService.getSettingsMap(client);
  const telegramEnabled =
    settingsMap[SETTINGS_KEYS.telegramNotificationsEnabled] === "true";

  const telegramText = [
    `🚨 Alerte couverture ${ALERT_LEVEL_LABELS[alert.level]}`,
    `${alert.city} — ${alert.category}`,
    alert.message,
    getAdminAlertesUrl(),
  ].join("\n");

  if (telegramEnabled) {
    const result = await sendTelegramMessage(telegramText);
    if (!result.ok) {
      console.warn("[coverage] Telegram notification skipped:", result.error);
    }
  }

  const adminEmail = settingsMap[SETTINGS_KEYS.senderEmail]?.trim();
  if (!adminEmail) return;

  const template = renderCoverageAlertEmail({
    city: alert.city,
    category: alert.category,
    level: alert.level,
    message: alert.message,
    adminUrl: getAdminOpportunitesUrl(),
  });

  const result = await sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html,
  });

  if (!result.ok && !result.skipped) {
    console.warn("[coverage] Email notification failed:", result.error);
  }
}

export const coverageService = {
  async processNewRequest(
    client: Client,
    input: ProcessNewRequestInput
  ): Promise<void> {
    const { requestId, city, categoryName, professionalCount } = input;
    const level = getCoverageLevel(professionalCount);

    await upsertCoverageAlert(client, city, categoryName, professionalCount);

    if (professionalCount <= 0) {
      await requestsService.updateStatus(client, requestId, "no_match");
    }

    if (level === "red" || level === "orange") {
      const message = buildCoverageAlertMessage(
        city,
        categoryName,
        professionalCount
      );

      const { data: alert } = await alertsService.create(client, {
        request_id: requestId,
        city,
        category: categoryName,
        level,
        message,
      });

      if (alert) {
        await sendCoverageNotifications(client, alert);
      }
    }
  },

  async processMissionClaimed(
    client: Client,
    city: string,
    categoryName: string
  ): Promise<void> {
    await incrementCoverageSuccess(client, city, categoryName);
  },

  async processNoResponse(
    client: Client,
    input: ProcessNoResponseInput
  ): Promise<void> {
    const { requestId, city, categoryName } = input;

    const { data: existing } = await client
      .from("alerts")
      .select("id")
      .eq("request_id", requestId)
      .ilike("message", "Aucune réponse%")
      .maybeSingle();

    if (existing) return;

    const message = buildNoResponseAlertMessage(city, categoryName);

    const { data: alert } = await alertsService.create(client, {
      request_id: requestId,
      city,
      category: categoryName,
      level: "orange",
      message,
    });

    if (alert) {
      await sendCoverageNotifications(client, alert);
    }
  },

  async listOpportunities(client: Client): Promise<OpportunityRow[]> {
    const { data } = await client
      .from("coverage_alerts")
      .select("*")
      .order("request_count", { ascending: false });

    return (data ?? []).map((row) => toOpportunityRow(row as CoverageAlert));
  },

  async getCategoryCoverage(client: Client): Promise<CategoryCoverageItem[]> {
    const [{ data: categories }, { data: professionals }] = await Promise.all([
      client.from("categories").select("name").eq("active", true).order("name"),
      client.from("professionals").select("categories").eq("active", true),
    ]);

    return (categories ?? []).map((category) => {
      const professionalCount = (professionals ?? []).filter((professional) =>
        professional.categories.includes(category.name)
      ).length;

      return {
        category: category.name,
        professionalCount,
        level: getCoverageLevel(professionalCount),
      };
    });
  },

};
