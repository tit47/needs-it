import type { AlertLevel } from "@/types";
import { ALERT_LEVEL_LABELS } from "@/utils/admin-labels";

const BRAND_COLOR = "#0c2f3d";
const ACCENT_COLOR = "#7cc9d4";
const CARD_COLOR = "#f8f6ee";

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${ACCENT_COLOR};font-family:Inter,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${ACCENT_COLOR};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${CARD_COLOR};border-radius:24px;padding:32px 24px;color:${BRAND_COLOR};">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="font-size:22px;font-weight:700;letter-spacing:0.04em;">Need&apos;s it</div>
            </td>
          </tr>
          ${body}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type CoverageAlertEmailData = {
  city: string;
  category: string;
  level: AlertLevel;
  message: string;
  adminUrl: string;
};

export function renderCoverageAlertEmail(data: CoverageAlertEmailData): {
  subject: string;
  html: string;
} {
  const levelLabel = ALERT_LEVEL_LABELS[data.level];
  const subject = `Alerte couverture ${levelLabel} — ${data.city} / ${data.category}`;

  const body = `
    <tr><td><h1 style="margin:0 0 8px;font-size:24px;">Alerte couverture</h1></td></tr>
    <tr><td style="font-size:15px;line-height:1.6;">
      <p style="margin:0 0 12px;"><strong>Niveau :</strong> ${levelLabel}</p>
      <p style="margin:0 0 12px;"><strong>Ville :</strong> ${data.city}</p>
      <p style="margin:0 0 12px;"><strong>Catégorie :</strong> ${data.category}</p>
      <p style="margin:0;">${data.message}</p>
    </td></tr>
    <tr>
      <td align="center" style="padding-top:24px;">
        <a href="${data.adminUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#f8f6ee;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;">
          Voir dans l'admin
        </a>
      </td>
    </tr>`;

  return { subject, html: layout(subject, body) };
}
