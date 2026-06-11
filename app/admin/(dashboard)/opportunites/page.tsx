import {
  AdminPageHeader,
  CategoryCoverageGrid,
  OpportunitiesPanel,
} from "@/components/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { coverageService } from "@/services";

export default async function OpportunitesPage() {
  const client = createAdminClient();

  const [opportunities, categoryCoverage] = await Promise.all([
    coverageService.listOpportunities(client),
    coverageService.getCategoryCoverage(client),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Opportunités"
        description="Où recruter, quelles villes et catégories renforcer."
      />

      <CategoryCoverageGrid items={categoryCoverage} />

      <OpportunitiesPanel opportunities={opportunities} />
    </div>
  );
}
