import {
  renderDemandAvailableEmail,
  renderMissionConfirmedEmail,
  renderMissionTakenEmail,
  renderNewRequestEmail,
  renderReminder30MinEmail,
} from "@/emails/templates";
import { getPublicPhotoUrl } from "@/lib/supabase/storage";
import { claimsService } from "@/services/claims.service";
import { sendEmail } from "@/services/email.service";
import { eventsService } from "@/services/events.service";
import { invoicesService } from "@/services/invoices.service";
import { matchingService } from "@/services/matching.service";
import {
  proLinksService,
  type ProLinkWithRelations,
} from "@/services/pro-links.service";
import { professionalsService } from "@/services/professionals.service";
import { requestsService } from "@/services/requests.service";
import type { Category, RequestStatus } from "@/types";
import { missionCodesMatch } from "@/utils/mission-code";
import { buildProLinkUrl, generateSecureToken } from "@/utils/secure-token";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

function getPhotoUrls(
  photos: { photo_url: string }[] | null | undefined
): string[] {
  return (photos ?? []).map((photo) => getPublicPhotoUrl(photo.photo_url));
}

export async function dispatchRequestToProfessionals(
  client: AdminClient,
  requestId: string,
  category: Category,
  latitude: number,
  longitude: number
): Promise<{ matchedCount: number }> {
  const matches = await matchingService.findMatchingProfessionals(
    client,
    category.name,
    latitude,
    longitude
  );

  await requestsService.updateMatchingMetadata(client, requestId, {
    first_pro_distance: matches[0]?.distanceKm ?? null,
    professional_count: matches.length,
  });

  if (!matches.length) {
    return { matchedCount: 0 };
  }

  const { data: request } = await requestsService.getById(client, requestId);
  if (!request) {
    return { matchedCount: 0 };
  }

  const photoUrls = getPhotoUrls(request.request_photos);

  const linksPayload = matches.map(({ professional, distanceKm }) => ({
    request_id: requestId,
    professional_id: professional.id,
    token: generateSecureToken(),
    distance_km: distanceKm,
  }));

  const { data: links, error } = await proLinksService.createMany(
    client,
    linksPayload
  );

  if (error || !links?.length) {
    console.error("[pro-workflow] link creation failed:", error);
    return { matchedCount: matches.length };
  }

  for (const link of links) {
    const match = matches.find(
      (item) => item.professional.id === link.professional_id
    );
    if (!match) continue;

    const proLinkUrl = buildProLinkUrl(link.token);
    const template = renderNewRequestEmail({
      categoryName: category.name,
      distanceKm: match.distanceKm,
      description: request.description,
      photoUrls,
      proLinkUrl,
    });

    const result = await sendEmail({
      to: match.professional.email,
      subject: template.subject,
      html: template.html,
    });

    if (result.ok) {
      await proLinksService.markEmailSent(client, link.id);
      await eventsService.log(client, requestId, "email_sent", {
        professional_id: match.professional.id,
        template: "new-request",
      });
    }
  }

  return { matchedCount: matches.length };
}

export async function recordProLinkOpened(
  client: AdminClient,
  link: ProLinkWithRelations
): Promise<void> {
  if (!link.link_opened_at) {
    await proLinksService.markLinkOpened(client, link.id);
    await eventsService.log(client, link.request_id, "link_opened", {
      professional_id: link.professional_id,
    });
  }
}

export type ProPageView =
  | { kind: "not_found" }
  | { kind: "mission_taken"; categoryName: string }
  | { kind: "unavailable"; message: string }
  | {
      kind: "pending";
      link: ProLinkWithRelations;
      categoryName: string;
      distanceKm: number;
      description: string;
      photoUrls: string[];
      clientName: string;
      clientPhone: string;
    }
  | {
      kind: "claimed_by_you";
      link: ProLinkWithRelations;
      categoryName: string;
      distanceKm: number;
      description: string;
      photoUrls: string[];
      clientName: string;
      clientPhone: string;
      clientAddress: string;
      city: string;
    };

export async function resolveProPageView(
  client: AdminClient,
  token: string
): Promise<ProPageView> {
  const { data: link } = await proLinksService.getByToken(client, token);

  if (!link?.requests) {
    return { kind: "not_found" };
  }

  await recordProLinkOpened(client, link);

  const request = link.requests;
  const categoryName = request.categories?.name ?? "Demande";
  const photoUrls = getPhotoUrls(request.request_photos);
  const baseDetails = {
    link,
    categoryName,
    distanceKm: link.distance_km,
    description: request.description,
    photoUrls,
    clientName: request.client_name,
    clientPhone: request.client_phone,
  };

  if (request.status === "claimed" && request.claimed_by === link.professional_id) {
    return {
      kind: "claimed_by_you",
      ...baseDetails,
      clientAddress: request.client_address,
      city: request.city,
    };
  }

  if (
    request.status === "claimed" &&
    request.claimed_by !== link.professional_id
  ) {
    return { kind: "mission_taken", categoryName };
  }

  if (request.status !== "pending") {
    return {
      kind: "unavailable",
      message: "Cette demande n'est plus disponible.",
    };
  }

  if (!link.active) {
    return { kind: "mission_taken", categoryName };
  }

  return {
    kind: "pending",
    ...baseDetails,
  };
}

export type ClaimMissionResult =
  | { success: true }
  | { success: false; error: string };

export async function claimMission(
  client: AdminClient,
  token: string,
  missionCodeInput: string
): Promise<ClaimMissionResult> {
  const { data: link } = await proLinksService.getByToken(client, token);

  if (!link?.requests) {
    return { success: false, error: "Lien invalide ou expiré." };
  }

  const request = link.requests;

  if (request.status === "claimed") {
    if (request.claimed_by === link.professional_id) {
      return { success: true };
    }
    return { success: false, error: "Cette mission a déjà été prise." };
  }

  if (request.status !== "pending" || !link.active) {
    return { success: false, error: "Cette demande n'est plus disponible." };
  }

  if (!missionCodesMatch(missionCodeInput, request.mission_code)) {
    return { success: false, error: "Code mission incorrect." };
  }

  const { data: updatedRequest, error: claimError } =
    await requestsService.claimRequest(
      client,
      request.id,
      link.professional_id
    );

  if (claimError || !updatedRequest?.length) {
    return { success: false, error: "Impossible de confirmer la mission." };
  }

  await claimsService.createClaim(
    client,
    request.id,
    link.professional_id
  );
  await proLinksService.deactivateOthers(
    client,
    request.id,
    link.professional_id
  );
  await professionalsService.incrementCompletedJobs(
    client,
    link.professional_id
  );
  await invoicesService.prepareMissionBilling(client, link.professional_id);

  await eventsService.log(client, request.id, "mission_claimed", {
    professional_id: link.professional_id,
  });

  const photoUrls = getPhotoUrls(request.request_photos);
  const confirmedTemplate = renderMissionConfirmedEmail({
    clientName: request.client_name,
    clientPhone: request.client_phone,
    clientAddress: request.client_address,
    city: request.city,
    description: request.description,
    photoUrls,
  });

  await sendEmail({
    to: link.professionals.email,
    subject: confirmedTemplate.subject,
    html: confirmedTemplate.html,
  });

  await eventsService.log(client, request.id, "email_sent", {
    professional_id: link.professional_id,
    template: "mission-confirmed",
  });

  const { data: otherLinks } = await proLinksService.listByRequest(
    client,
    request.id
  );

  const categoryName = request.categories?.name ?? "Demande";

  for (const otherLink of otherLinks ?? []) {
    if (otherLink.professional_id === link.professional_id) continue;

    const professional = otherLink.professionals as {
      email?: string;
    } | null;

    if (!professional?.email) continue;

    const takenTemplate = renderMissionTakenEmail({
      categoryName,
      proLinkUrl: buildProLinkUrl(otherLink.token),
    });

    const result = await sendEmail({
      to: professional.email,
      subject: takenTemplate.subject,
      html: takenTemplate.html,
    });

    if (result.ok) {
      await eventsService.log(client, request.id, "email_sent", {
        professional_id: otherLink.professional_id,
        template: "mission-taken",
      });
    }
  }

  return { success: true };
}

export type ReleaseMissionResult =
  | { success: true }
  | { success: false; error: string };

export async function releaseMission(
  client: AdminClient,
  token: string
): Promise<ReleaseMissionResult> {
  const { data: link } = await proLinksService.getByToken(client, token);

  if (!link?.requests) {
    return { success: false, error: "Lien invalide ou expiré." };
  }

  const request = link.requests;

  if (
    request.status !== "claimed" ||
    request.claimed_by !== link.professional_id
  ) {
    return { success: false, error: "Vous ne pouvez pas libérer cette mission." };
  }

  const { error: releaseClaimError } = await claimsService.releaseClaim(
    client,
    request.id,
    link.professional_id
  );

  if (releaseClaimError) {
    return { success: false, error: "Impossible de libérer la mission." };
  }

  const { data: releasedRequest, error: releaseError } =
    await requestsService.releaseRequest(client, request.id);

  if (releaseError || !releasedRequest?.length) {
    return { success: false, error: "Impossible de libérer la mission." };
  }

  await proLinksService.reactivateAll(client, request.id);

  await eventsService.log(client, request.id, "mission_released", {
    professional_id: link.professional_id,
  });

  const categoryName = request.categories?.name ?? "Demande";
  const { data: allLinks } = await proLinksService.listByRequest(
    client,
    request.id
  );

  for (const otherLink of allLinks ?? []) {
    if (otherLink.professional_id === link.professional_id) continue;

    const professional = otherLink.professionals as {
      email?: string;
    } | null;

    if (!professional?.email) continue;

    const availableTemplate = renderDemandAvailableEmail({
      categoryName,
      description: request.description,
      distanceKm: otherLink.distance_km,
      proLinkUrl: buildProLinkUrl(otherLink.token),
    });

    const result = await sendEmail({
      to: professional.email,
      subject: availableTemplate.subject,
      html: availableTemplate.html,
    });

    if (result.ok) {
      await eventsService.log(client, request.id, "email_sent", {
        professional_id: otherLink.professional_id,
        template: "demand-available",
      });
    }
  }

  return { success: true };
}

export async function sendPendingReminders(
  client: AdminClient,
  olderThanMinutes = 30
): Promise<{ sent: number }> {
  const { data: links } = await proLinksService.listPendingReminders(
    client,
    olderThanMinutes
  );

  let sent = 0;

  for (const link of links ?? []) {
    const request = link.requests as {
      description: string;
      categories: { name: string } | null;
    };
    const professional = link.professionals as {
      email: string;
    };

    const categoryName = request.categories?.name ?? "Demande";
    const template = renderReminder30MinEmail({
      categoryName,
      description: request.description,
      distanceKm: link.distance_km,
      proLinkUrl: buildProLinkUrl(link.token),
    });

    const result = await sendEmail({
      to: professional.email,
      subject: template.subject,
      html: template.html,
    });

    if (result.ok) {
      await proLinksService.markReminderSent(client, link.id);
      await eventsService.log(client, link.request_id, "email_sent", {
        professional_id: link.professional_id,
        template: "reminder-30min",
      });
      sent += 1;
    }
  }

  return { sent };
}

export function getStatusLabel(status: RequestStatus): string {
  switch (status) {
    case "pending":
      return "En attente";
    case "claimed":
      return "Prise en charge";
    case "completed":
      return "Terminée";
    case "cancelled":
      return "Annulée";
    case "no_match":
      return "Aucun professionnel";
    default:
      return status;
  }
}
