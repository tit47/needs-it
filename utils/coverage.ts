import type { AlertLevel } from "@/types";

export type CoveragePriority = "Haute" | "Moyenne" | "Basse";

export function getCoverageLevel(professionalCount: number): AlertLevel {
  if (professionalCount <= 0) return "red";
  if (professionalCount <= 2) return "orange";
  return "green";
}

export function buildCoverageAlertMessage(
  city: string,
  category: string,
  professionalCount: number
): string {
  if (professionalCount <= 0) {
    return `Aucun professionnel trouvé pour ${category} à ${city}.`;
  }

  if (professionalCount <= 2) {
    return `Seulement ${professionalCount} professionnel${professionalCount > 1 ? "s" : ""} disponible${professionalCount > 1 ? "s" : ""} pour ${category} à ${city}.`;
  }

  return `Couverture correcte pour ${category} à ${city} (${professionalCount} professionnels).`;
}

export function buildNoResponseAlertMessage(
  city: string,
  category: string
): string {
  return `Aucune réponse des professionnels pour ${category} à ${city} (demande en attente).`;
}

export function computeSuccessRatePercent(
  requestCount: number,
  successCount: number
): number | null {
  if (requestCount <= 0) return null;
  return Math.round((successCount / requestCount) * 100);
}

export function computeCoveragePriority(
  level: AlertLevel,
  requestCount: number,
  successRatePercent: number | null
): CoveragePriority {
  const lostMissions = requestCount - (successRatePercent != null
    ? Math.round((successRatePercent / 100) * requestCount)
    : 0);

  if (level === "red" && requestCount >= 5) return "Haute";
  if (level === "red") return "Haute";
  if (level === "orange" && (successRatePercent ?? 100) < 70) return "Haute";
  if (level === "orange" && requestCount >= 8) return "Haute";
  if (level === "orange") return "Moyenne";
  if (lostMissions >= 5) return "Moyenne";
  return "Basse";
}
