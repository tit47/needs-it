import { formatDistanceKm } from "@/utils/distance";
import { buildProLinkUrl } from "@/utils/secure-token";

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

function button(label: string, href: string): string {
  return `<tr>
    <td align="center" style="padding-top:24px;">
      <a href="${href}" style="display:inline-block;background:${BRAND_COLOR};color:#f8f6ee;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;">
        ${label}
      </a>
    </td>
  </tr>`;
}

function photosBlock(photoUrls: string[]): string {
  if (!photoUrls.length) return "";

  const items = photoUrls
    .slice(0, 5)
    .map(
      (url) =>
        `<img src="${url}" alt="Photo de la demande" width="160" height="120" style="display:inline-block;border-radius:12px;object-fit:cover;margin:4px;" />`
    )
    .join("");

  return `<tr>
    <td style="padding-top:16px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;">Photos</p>
      <div>${items}</div>
    </td>
  </tr>`;
}

export type NewRequestEmailData = {
  categoryName: string;
  distanceKm: number;
  description: string;
  photoUrls: string[];
  proLinkUrl: string;
};

export function renderNewRequestEmail(data: NewRequestEmailData): {
  subject: string;
  html: string;
} {
  const body = `
    <tr><td><h1 style="margin:0 0 8px;font-size:24px;">Nouvelle demande</h1></td></tr>
    <tr><td style="font-size:15px;line-height:1.6;">
      <p style="margin:0 0 12px;"><strong>Catégorie :</strong> ${data.categoryName}</p>
      <p style="margin:0 0 12px;"><strong>Distance estimée :</strong> ${formatDistanceKm(data.distanceKm)}</p>
      <p style="margin:0 0 12px;"><strong>Description :</strong><br />${data.description}</p>
      <p style="margin:16px 0 0;padding:16px;background:rgba(12,47,61,0.06);border-radius:16px;font-size:14px;">
        L&apos;adresse du client reste masquée jusqu&apos;à la confirmation de mission.<br />
        Le client vous communiquera son code mission par téléphone.
      </p>
    </td></tr>
    ${photosBlock(data.photoUrls)}
    ${button("Voir les coordonnées", data.proLinkUrl)}
  `;

  return {
    subject: `Nouvelle demande — ${data.categoryName}`,
    html: layout("Nouvelle demande", body),
  };
}

export type MissionConfirmedEmailData = {
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  city: string;
  description: string;
  photoUrls: string[];
};

export function renderMissionConfirmedEmail(
  data: MissionConfirmedEmailData
): { subject: string; html: string } {
  const body = `
    <tr><td><h1 style="margin:0 0 8px;font-size:24px;">Mission confirmée</h1></td></tr>
    <tr><td style="font-size:15px;line-height:1.6;">
      <p style="margin:0 0 12px;"><strong>Client :</strong> ${data.clientName}</p>
      <p style="margin:0 0 12px;"><strong>Téléphone :</strong> ${data.clientPhone}</p>
      <p style="margin:0 0 12px;"><strong>Adresse :</strong> ${data.clientAddress}, ${data.city}</p>
      <p style="margin:0 0 12px;"><strong>Description :</strong><br />${data.description}</p>
      <p style="margin:16px 0 0;font-size:15px;font-weight:600;">Bonne intervention.<br />Need&apos;s it.</p>
    </td></tr>
    ${photosBlock(data.photoUrls)}
  `;

  return {
    subject: "Mission confirmée — Need's it",
    html: layout("Mission confirmée", body),
  };
}

export type MissionTakenEmailData = {
  categoryName: string;
  proLinkUrl: string;
};

export function renderMissionTakenEmail(data: MissionTakenEmailData): {
  subject: string;
  html: string;
} {
  const body = `
    <tr><td><h1 style="margin:0 0 8px;font-size:24px;">Mission déjà attribuée</h1></td></tr>
    <tr><td style="font-size:15px;line-height:1.6;">
      <p style="margin:0 0 12px;">
        La demande <strong>${data.categoryName}</strong> vient d&apos;être prise par un autre professionnel.
      </p>
      <p style="margin:0;">Merci pour votre réactivité. D&apos;autres opportunités arriveront bientôt.</p>
    </td></tr>
    ${button("Voir le détail", data.proLinkUrl)}
  `;

  return {
    subject: "Mission déjà attribuée — Need's it",
    html: layout("Mission déjà attribuée", body),
  };
}

export type DemandAvailableEmailData = {
  categoryName: string;
  description: string;
  distanceKm: number;
  proLinkUrl: string;
};

export function renderDemandAvailableEmail(data: DemandAvailableEmailData): {
  subject: string;
  html: string;
} {
  const body = `
    <tr><td><h1 style="margin:0 0 8px;font-size:24px;">Demande toujours disponible</h1></td></tr>
    <tr><td style="font-size:15px;line-height:1.6;">
      <p style="margin:0 0 12px;">
        Une demande <strong>${data.categoryName}</strong> est de nouveau disponible près de chez vous
        (${formatDistanceKm(data.distanceKm)}).
      </p>
      <p style="margin:0 0 12px;"><strong>Description :</strong><br />${data.description}</p>
      <p style="margin:0;">Appelez le client et confirmez la mission avec le code communiqué par téléphone.</p>
    </td></tr>
    ${button("Voir les coordonnées", data.proLinkUrl)}
  `;

  return {
    subject: `Demande disponible — ${data.categoryName}`,
    html: layout("Demande toujours disponible", body),
  };
}

export type Reminder30MinEmailData = DemandAvailableEmailData;

export function renderReminder30MinEmail(data: Reminder30MinEmailData): {
  subject: string;
  html: string;
} {
  const body = `
    <tr><td><h1 style="margin:0 0 8px;font-size:24px;">Rappel — demande en attente</h1></td></tr>
    <tr><td style="font-size:15px;line-height:1.6;">
      <p style="margin:0 0 12px;">
        Une demande <strong>${data.categoryName}</strong> vous a été envoyée il y a 30 minutes
        (${formatDistanceKm(data.distanceKm)}).
      </p>
      <p style="margin:0 0 12px;"><strong>Description :</strong><br />${data.description}</p>
      <p style="margin:0;">Elle est toujours disponible. Contactez le client pour confirmer la mission.</p>
    </td></tr>
    ${button("Voir les coordonnées", data.proLinkUrl)}
  `;

  return {
    subject: `Rappel — ${data.categoryName} toujours disponible`,
    html: layout("Rappel demande", body),
  };
}

export { buildProLinkUrl };
