import { AdminPageHeader, CandidatesPanel } from "@/components/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { candidatesService } from "@/services";

export default async function CandidatsPage() {
  const client = createAdminClient();
  const { data: candidates } = await candidatesService.list(client);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Professionnels candidats"
        description="Validation des nouvelles candidatures."
      />

      <CandidatesPanel candidates={candidates ?? []} />
    </div>
  );
}
