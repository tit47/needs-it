import { AdminPageHeader, SettingsPanel } from "@/components/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  categoriesService,
  DEFAULT_MISSION_PRICE_EUR,
  settingsService,
  SETTINGS_KEYS,
} from "@/services";

export default async function ParametresPage() {
  const client = createAdminClient();

  const [{ data: categories }] = await Promise.all([
    categoriesService.list(client, false),
  ]);

  const settingsMap = await settingsService.getSettingsMap(client);

  const missionPriceEur = Number(settingsMap[SETTINGS_KEYS.missionPriceEur]);
  const senderEmail =
    settingsMap[SETTINGS_KEYS.senderEmail] ??
    process.env.RESEND_FROM_EMAIL ??
    "Need's it <noreply@needs-it.fr>";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Paramètres"
        description="Configuration de la plateforme Need's it."
      />

      <SettingsPanel
        missionPriceEur={
          Number.isFinite(missionPriceEur) && missionPriceEur > 0
            ? missionPriceEur
            : DEFAULT_MISSION_PRICE_EUR
        }
        senderEmail={senderEmail}
        telegramNotificationsEnabled={
          settingsMap[SETTINGS_KEYS.telegramNotificationsEnabled] === "true"
        }
        telegramConfigured={Boolean(
          process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
        )}
        appUrl={process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}
        categories={categories ?? []}
      />
    </div>
  );
}
