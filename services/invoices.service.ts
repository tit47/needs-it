import type { Invoice, Professional, SupabaseDbClient } from "@/types";
import { settingsService } from "./settings.service";

type Client = SupabaseDbClient;

export type InvoiceWithProfessional = Invoice & {
  professionals: Pick<Professional, "full_name" | "email"> | null;
};

export const invoicesService = {
  async list(client: Client) {
    return client
      .from("invoices")
      .select("*, professionals(full_name, email)")
      .order("month", { ascending: false });
  },

  async listByProfessional(client: Client, professionalId: string) {
    return client
      .from("invoices")
      .select("*")
      .eq("professional_id", professionalId)
      .order("month", { ascending: false });
  },

  async getByProfessionalAndMonth(
    client: Client,
    professionalId: string,
    month: string
  ) {
    return client
      .from("invoices")
      .select("*")
      .eq("professional_id", professionalId)
      .eq("month", month)
      .maybeSingle();
  },

  async getById(client: Client, id: string) {
    return client.from("invoices").select("*").eq("id", id).single();
  },

  async markInvoiceSent(client: Client, id: string, invoiceSent: boolean) {
    if (!invoiceSent) {
      const { data: invoice } = await this.getById(client, id);
      if (invoice?.paid) {
        return {
          data: null,
          error: {
            message:
              "Impossible de retirer l'envoi : la facture est déjà payée.",
          },
        };
      }
    }

    return client
      .from("invoices")
      .update({ invoice_sent: invoiceSent })
      .eq("id", id)
      .select("*")
      .single();
  },

  async markPaid(client: Client, id: string, paid: boolean) {
    const update: { paid: boolean; invoice_sent?: boolean } = { paid };
    if (paid) {
      update.invoice_sent = true;
    }

    return client
      .from("invoices")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();
  },

  async prepareMissionBilling(client: Client, professionalId: string) {
    const month = new Date().toISOString().slice(0, 7);
    const missionPrice = await settingsService.getMissionPriceEur(client);
    const { data: existing } = await this.getByProfessionalAndMonth(
      client,
      professionalId,
      month
    );

    if (existing) {
      const missionCount = existing.mission_count + 1;
      return client
        .from("invoices")
        .update({
          mission_count: missionCount,
          amount: missionCount * missionPrice,
        })
        .eq("id", existing.id)
        .select("*")
        .single();
    }

    return client
      .from("invoices")
      .insert({
        professional_id: professionalId,
        month,
        mission_count: 1,
        amount: missionPrice,
      })
      .select("*")
      .single();
  },
};
