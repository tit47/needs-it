interface TelegramMessageOptions {
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  disableNotification?: boolean;
}

/**
 * Envoie une notification Telegram via l'API Bot.
 * Utilisé pour les alertes importantes (couverture, opportunités).
 */
export async function sendTelegramMessage(
  message: string,
  options: TelegramMessageOptions = {}
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { ok: false, error: "Telegram is not configured." };
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: options.parseMode,
        disable_notification: options.disableNotification,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    return { ok: false, error: body };
  }

  return { ok: true };
}
