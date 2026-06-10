import { randomBytes } from "crypto";

/** Token opaque pour les liens professionnels sécurisés. */
export function generateSecureToken(): string {
  return randomBytes(24).toString("base64url");
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function buildProLinkUrl(token: string): string {
  return `${getAppBaseUrl()}/pro/${token}`;
}
