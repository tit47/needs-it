import { AdminPageHeader, AlertsPanel } from "@/components/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { alertsService } from "@/services";

export default async function AlertesPage() {
  const client = createAdminClient();
  const { data: alerts } = await alertsService.list(client);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Alertes"
        description="Problèmes de couverture et signaux à traiter."
      />

      <AlertsPanel alerts={alerts ?? []} />
    </div>
  );
}
