let idCounter = 0;

/**
 * Identifiant unique compatible desktop et mobile.
 * crypto.randomUUID n'est pas disponible sur tous les navigateurs mobiles
 * (contexte non sécurisé, WebView, versions anciennes).
 */
export function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  idCounter += 1;
  return `photo-${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 9)}`;
}
