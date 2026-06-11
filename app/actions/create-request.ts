"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { categoriesService } from "@/services/categories.service";
import { eventsService } from "@/services/events.service";
import { photosService } from "@/services/photos.service";
import { dispatchRequestToProfessionals } from "@/services/pro-workflow.service";
import { requestsService } from "@/services/requests.service";
import { verifyBanAddress } from "@/utils/geocoding";
import { generateMissionCode } from "@/utils/mission-code";
import {
  hasFormErrors,
  MAX_PHOTOS,
  sanitizeClientForm,
  validateClientForm,
  type ClientFormValues,
} from "@/utils/validation";

export type CreateRequestResult =
  | { success: true; missionCode: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function generateUniqueMissionCode(
  client: ReturnType<typeof createAdminClient>,
  maxAttempts = 10
): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateMissionCode();
    const { data } = await requestsService.getByMissionCode(client, code);
    if (!data) return code;
  }
  return null;
}

export async function createRequestAction(
  formData: FormData
): Promise<CreateRequestResult> {
  const values: ClientFormValues = {
    categoryId: String(formData.get("categoryId") ?? ""),
    description: String(formData.get("description") ?? ""),
    clientName: String(formData.get("clientName") ?? ""),
    clientPhone: String(formData.get("clientPhone") ?? ""),
    clientAddress: String(formData.get("clientAddress") ?? ""),
  };

  const clientAddressId = String(formData.get("clientAddressId") ?? "");

  const photoFiles = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const fieldErrors = validateClientForm(values, photoFiles.length, {
    addressSelected: Boolean(clientAddressId),
  });
  if (hasFormErrors(fieldErrors)) {
    return {
      success: false,
      error: "Veuillez corriger les champs indiqués.",
      fieldErrors: fieldErrors as Record<string, string>,
    };
  }

  if (!clientAddressId || !values.clientAddress) {
    return {
      success: false,
      error: "Veuillez sélectionner une adresse dans la liste.",
      fieldErrors: {
        clientAddress:
          "Veuillez sélectionner une adresse dans la liste de suggestions.",
      },
    };
  }

  const verifiedAddress = await verifyBanAddress(
    clientAddressId,
    values.clientAddress
  );

  if (!verifiedAddress) {
    return {
      success: false,
      error: "Adresse invalide. Veuillez la sélectionner à nouveau.",
      fieldErrors: {
        clientAddress:
          "Adresse introuvable. Sélectionnez une proposition dans la liste.",
      },
    };
  }

  if (photoFiles.length > MAX_PHOTOS) {
    return {
      success: false,
      error: `Maximum ${MAX_PHOTOS} photos autorisées.`,
    };
  }

  const sanitized = sanitizeClientForm({
    ...values,
    clientAddress: verifiedAddress.label,
  });

  const supabase = createAdminClient();
  const missionCode = await generateUniqueMissionCode(supabase);

  if (!missionCode) {
    return {
      success: false,
      error: "Impossible de générer un code mission. Réessayez.",
    };
  }

  const { data: request, error: requestError } = await requestsService.create(
    supabase,
    {
      category_id: sanitized.categoryId,
      description: sanitized.description,
      client_name: sanitized.clientName,
      client_phone: sanitized.clientPhone,
      client_address: verifiedAddress.label,
      city: verifiedAddress.city,
      latitude: verifiedAddress.latitude,
      longitude: verifiedAddress.longitude,
      mission_code: missionCode,
    }
  );

  if (requestError || !request) {
    return {
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Réessayez.",
    };
  }

  for (const [index, file] of photoFiles.entries()) {
    const path = `${request.id}/${Date.now()}-${index}.jpg`;
    const { error: photoError } = await photosService.upload(
      supabase,
      request.id,
      file,
      path
    );

    if (photoError) {
      console.error("Photo upload failed:", photoError);
    }
  }

  await eventsService.log(supabase, request.id, "request_created", {
    city: verifiedAddress.city,
    postcode: verifiedAddress.postcode,
    photo_count: photoFiles.length,
  });

  const { data: category } = await categoriesService.getById(
    supabase,
    sanitized.categoryId
  );

  if (category) {
    await dispatchRequestToProfessionals(
      supabase,
      request.id,
      category,
      verifiedAddress.latitude,
      verifiedAddress.longitude,
      verifiedAddress.city
    );
  }

  return { success: true, missionCode: request.mission_code };
}
