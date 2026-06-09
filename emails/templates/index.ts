/**
 * Templates d'emails transactionnels Need's it.
 * Les templates complets seront implémentés à l'étape emails.
 *
 * Emails prévus :
 * - new-request       → Nouvelle demande (professionnel)
 * - mission-confirmed → Mission confirmée (professionnel)
 * - reminder-30min    → Rappel après 30 minutes
 * - mission-taken     → Mission déjà attribuée
 */

export const EMAIL_TEMPLATES = {
  newRequest: "new-request",
  missionConfirmed: "mission-confirmed",
  reminder30Min: "reminder-30min",
  missionTaken: "mission-taken",
} as const;

export type EmailTemplateId =
  (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];
