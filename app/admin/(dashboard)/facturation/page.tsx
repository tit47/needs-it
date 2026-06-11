import { AdminPageHeader, InvoicesPanel } from "@/components/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { invoicesService, settingsService } from "@/services";
import type { InvoiceWithProfessional } from "@/services/invoices.service";

export default async function FacturationPage() {
  const client = createAdminClient();

  const [{ data: invoices }, missionPriceEur] = await Promise.all([
    invoicesService.list(client),
    settingsService.getMissionPriceEur(client),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Facturation"
        description="Suivi mensuel des missions et paiements — facturation manuelle."
      />

      <InvoicesPanel
        invoices={(invoices ?? []) as InvoiceWithProfessional[]}
        missionPriceEur={missionPriceEur}
      />
    </div>
  );
}
