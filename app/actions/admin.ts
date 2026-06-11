"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const client = createAdminClient();
  const { error } = await invoicesService.markPaid(client, id, paid);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function suspendProfessionalAction(id: string, active: boolean) {
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
  const client = createAdminClient();
  const { error } = await professionalsService.update(client, id, data);

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
  const client = createAdminClient();
  const { error } = await alertsService.resolve(client, id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function resolveCoverageAlertAction(id: string) {
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
  const client = createAdminClient();
  const { error } = await categoriesService.setActive(client, id, active);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateAdmin();
  return { success: true };
}

export async function createCategoryAction(name: string) {
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
  const client = createAdminClient();
  const { data, error } = await requestsService.getById(client, id);

  if (error || !data) {
    return { success: false, error: error?.message ?? "Demande introuvable." };
  }

  return { success: true, data: data as AdminRequestDetail };
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
