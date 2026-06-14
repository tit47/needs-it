"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { withSignedPhotoUrls } from "@/lib/supabase/storage";
import {
  alertsService,
  candidatesService,
  categoriesService,
  coverageAlertsService,
  invoicesService,
  professionalsService,
  requestsService,
  settingsService,
  SETTINGS_KEYS,
} from "@/services";
import type {
  Alert,
  CandidateStatus,
  Request,
  RequestEvent,
  RequestPhoto,
} from "@/types";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { verifyBanAddress } from "@/utils/geocoding";
import { isValidFrenchPhone, normalizePhone } from "@/utils/phone";
import { isValidEmail } from "@/utils/validation";

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/demandes");
  revalidatePath("/admin/professionnels");
  revalidatePath("/admin/candidats");
  revalidatePath("/admin/alertes");
  revalidatePath("/admin/opportunites");
  revalidatePath("/admin/parametres");
  revalidatePath("/admin/facturation");
}

export async function markInvoiceSentAction(id: string, invoiceSent: boolean) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const client = createAdminClient();
  const { error } = await invoicesService.markInvoiceSent(
    client,
    id,
    invoiceSent
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function markInvoicePaidAction(id: string, paid: boolean) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const client = createAdminClient();
  const { error } = await invoicesService.markPaid(client, id, paid);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function suspendProfessionalAction(id: string, active: boolean) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const client = createAdminClient();
  const { error } = await professionalsService.updateStatus(client, id, active);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function updateProfessionalAction(
  id: string,
  data: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    siren: string;
    categories: string[];
    radius_km: number;
  }
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const client = createAdminClient();
  const { error } = await professionalsService.update(client, id, data);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function createProfessionalAction(data: {
  full_name: string;
  email: string;
  phone: string;
  siren: string;
  addressId: string;
  addressLabel: string;
  categories: string[];
  radius_km: number;
  active: boolean;
}) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const fullName = data.full_name.trim();
  const email = data.email.trim();
  const phone = normalizePhone(data.phone.trim());
  const siren = data.siren.trim();
  const categories = data.categories.map((item) => item.trim()).filter(Boolean);
  const radiusKm = Number(data.radius_km);

  if (!fullName) {
    return { success: false, error: "Le nom est requis." };
  }

  if (!email) {
    return { success: false, error: "L'email est requis." };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: "Format d'email invalide." };
  }

  if (!phone) {
    return { success: false, error: "Le téléphone est requis." };
  }

  if (!isValidFrenchPhone(phone)) {
    return { success: false, error: "Numéro de téléphone invalide." };
  }

  if (!siren) {
    return { success: false, error: "Le SIREN est requis." };
  }

  if (!data.addressId || !data.addressLabel.trim()) {
    return {
      success: false,
      error: "Veuillez sélectionner une adresse dans la liste.",
    };
  }

  if (categories.length === 0) {
    return {
      success: false,
      error: "Au moins une catégorie est requise.",
    };
  }

  if (!Number.isFinite(radiusKm) || radiusKm < 1) {
    return {
      success: false,
      error: "Le rayon d'intervention doit être d'au moins 1 km.",
    };
  }

  const verifiedAddress = await verifyBanAddress(
    data.addressId,
    data.addressLabel.trim()
  );

  if (!verifiedAddress) {
    return {
      success: false,
      error: "Adresse invalide. Veuillez la sélectionner à nouveau.",
    };
  }

  const client = createAdminClient();

  const { data: activeCategories } = await categoriesService.list(client);
  const activeNames = new Set((activeCategories ?? []).map((category) => category.name));
  const invalidCategories = categories.filter((name) => !activeNames.has(name));

  if (invalidCategories.length > 0) {
    return {
      success: false,
      error: "Une ou plusieurs catégories sélectionnées ne sont pas valides.",
    };
  }

  const { data: existingPro } = await professionalsService.getBySiren(
    client,
    siren
  );

  if (existingPro) {
    return {
      success: false,
      error: "Un professionnel avec ce SIREN existe déjà.",
    };
  }

  const { error } = await professionalsService.create(client, {
    full_name: fullName,
    email,
    phone,
    address: verifiedAddress.label,
    city: verifiedAddress.city,
    latitude: verifiedAddress.latitude,
    longitude: verifiedAddress.longitude,
    siren,
    categories,
    radius_km: Math.round(radiusKm),
    active: data.active,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function updateCandidateStatusAction(
  id: string,
  status: CandidateStatus
) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const client = createAdminClient();

  if (status === "accepted") {
    const { error } = await candidatesService.accept(client, id);
    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await candidatesService.updateStatus(client, id, status);
    if (error) {
      return { success: false, error: error.message };
    }
  }

  revalidateAdmin();
  return { success: true };
}

export async function resolveAlertAction(id: string) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const client = createAdminClient();
  const { error } = await alertsService.resolve(client, id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function resolveCoverageAlertAction(id: string) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const client = createAdminClient();
  const { error } = await coverageAlertsService.resolve(client, id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export type AlertDetail = Alert & {
  request: Pick<
    Request,
    | "id"
    | "mission_code"
    | "status"
    | "client_name"
    | "client_phone"
    | "city"
    | "professional_count"
    | "created_at"
  > | null;
};

export async function getAlertDetailAction(id: string): Promise<
  | { success: true; data: AlertDetail }
  | { success: false; error: string }
> {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const client = createAdminClient();
  const { data: alert, error } = await alertsService.getById(client, id);

  if (error || !alert) {
    return { success: false, error: error?.message ?? "Alerte introuvable." };
  }

  if (!alert.request_id) {
    return { success: true, data: { ...alert, request: null } };
  }

  const { data: request } = await requestsService.getById(
    client,
    alert.request_id
  );

  return {
    success: true,
    data: {
      ...alert,
      request: request
        ? {
            id: request.id,
            mission_code: request.mission_code,
            status: request.status,
            client_name: request.client_name,
            client_phone: request.client_phone,
            city: request.city,
            professional_count: request.professional_count,
            created_at: request.created_at,
          }
        : null,
    },
  };
}

export async function updateMissionPriceAction(priceEur: number) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  if (!Number.isFinite(priceEur) || priceEur <= 0) {
    return { success: false, error: "Le prix doit être supérieur à 0." };
  }

  const client = createAdminClient();
  const { error } = await settingsService.set(
    client,
    SETTINGS_KEYS.missionPriceEur,
    String(priceEur)
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function updateSenderEmailAction(senderEmail: string) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const trimmed = senderEmail.trim();

  if (!trimmed) {
    return { success: false, error: "L'email expéditeur est requis." };
  }

  if (!isValidEmail(trimmed)) {
    return { success: false, error: "Format d'email invalide." };
  }

  const client = createAdminClient();
  const { error } = await settingsService.set(
    client,
    SETTINGS_KEYS.senderEmail,
    trimmed
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function updateTelegramNotificationsAction(enabled: boolean) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const client = createAdminClient();
  const { error } = await settingsService.set(
    client,
    SETTINGS_KEYS.telegramNotificationsEnabled,
    enabled ? "true" : "false"
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function toggleCategoryAction(id: string, active: boolean) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const client = createAdminClient();
  const { error } = await categoriesService.setActive(client, id, active);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function createCategoryAction(name: string) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const trimmed = name.trim();

  if (!trimmed) {
    return { success: false, error: "Le nom de la catégorie est requis." };
  }

  const client = createAdminClient();
  const { error } = await categoriesService.create(client, trimmed);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}


export type AdminRequestDetail = Request & {
  categories: { name: string } | null;
  request_photos: RequestPhoto[];
  request_events: RequestEvent[];
};

export async function getRequestDetailAction(id: string): Promise<
  | { success: true; data: AdminRequestDetail }
  | { success: false; error: string }
> {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const client = createAdminClient();
  const { data, error } = await requestsService.getById(client, id);

  if (error || !data) {
    return { success: false, error: error?.message ?? "Demande introuvable." };
  }

  const request_photos = await withSignedPhotoUrls(client, data.request_photos ?? []);

  return {
    success: true,
    data: { ...data, request_photos } as AdminRequestDetail,
  };
}

export async function getProfessionalDetailAction(id: string): Promise<
  | {
      success: true;
      data: {
        professional: NonNullable<
          Awaited<ReturnType<typeof professionalsService.getById>>["data"]
        >;
        unpaidAmount: number;
        history: NonNullable<
          Awaited<ReturnType<typeof professionalsService.getClaimHistory>>["data"]
        >;
        paymentHistory: NonNullable<
          Awaited<ReturnType<typeof invoicesService.listByProfessional>>["data"]
        >;
      };
    }
  | { success: false; error: string }
> {
  const authError = await requireAdminSession();
  if (authError) return authError;

  const client = createAdminClient();
  const { data: professional, error } = await professionalsService.getById(
    client,
    id
  );

  if (error || !professional) {
    return {
      success: false,
      error: error?.message ?? "Professionnel introuvable.",
    };
  }

  const [unpaidAmount, { data: history }, { data: paymentHistory }] =
    await Promise.all([
      professionalsService.getUnpaidAmount(client, id),
      professionalsService.getClaimHistory(client, id),
      invoicesService.listByProfessional(client, id),
    ]);

  return {
    success: true,
    data: {
      professional,
      unpaidAmount,
      history: history ?? [],
      paymentHistory: paymentHistory ?? [],
    },
  };
}
