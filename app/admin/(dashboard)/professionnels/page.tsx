import { AdminPageHeader, ProfessionalsPanel } from "@/components/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { categoriesService, professionalsService } from "@/services";

export default async function ProfessionnelsPage() {
  const client = createAdminClient();
  const [{ data: professionals }, { data: activeCategories }] =
    await Promise.all([
      professionalsService.list(client),
      categoriesService.list(client),
    ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Professionnels"
        description="Gestion du réseau de professionnels actifs."
      />

      <ProfessionalsPanel
        professionals={professionals ?? []}
        activeCategories={activeCategories ?? []}
      />
    </div>
  );
}
