import { AdminPageHeader, RequestsPanel } from "@/components/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { requestsService } from "@/services";

export default async function DemandesPage() {
  const client = createAdminClient();
  const { data: requests } = await requestsService.list(client);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Demandes"
        description="Suivi de toutes les demandes clients."
      />

      <RequestsPanel requests={requests ?? []} />
    </div>
  );
}
