import type { AppSetting, SupabaseDbClient } from "@/types";

type Client = SupabaseDbClient;

export const SETTINGS_KEYS = {
  missionPriceEur: "mission_price_eur",
  senderEmail: "sender_email",
  telegramNotificationsEnabled: "telegram_notifications_enabled",
} as const;

export const DEFAULT_MISSION_PRICE_EUR = 5;

export const settingsService = {
  async getAll(client: Client) {
    return client.from("app_settings").select("*");
  },

  async get(client: Client, key: string) {
    return client.from("app_settings").select("*").eq("key", key).maybeSingle();
  },

  async getMissionPriceEur(client: Client): Promise<number> {
    const { data } = await this.get(client, SETTINGS_KEYS.missionPriceEur);
    const parsed = Number(data?.value);

    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : DEFAULT_MISSION_PRICE_EUR;
  },

  async set(client: Client, key: string, value: string) {
    return client
      .from("app_settings")
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();
  },

  async getSettingsMap(client: Client): Promise<Record<string, string>> {
    const { data } = await this.getAll(client);
    const settings = (data ?? []) as AppSetting[];

    return Object.fromEntries(settings.map((item) => [item.key, item.value]));
  },
};
