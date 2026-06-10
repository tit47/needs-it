import {
  ActivityFeed,
  AdminPageHeader,
  ImportantAlertsList,
  StatCards,
} from "@/components/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { dashboardService } from "@/services";

export default async function AdminDashboardPage() {
  const client = createAdminClient();

  const [stats, activity, importantAlerts] = await Promise.all([
    dashboardService.getStats(client),
    dashboardService.getRecentActivity(client),
    dashboardService.getImportantAlerts(client),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Vue d'ensemble de l'activité Need's it."
      />

      <StatCards stats={stats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityFeed items={activity} />
        <ImportantAlertsList alerts={importantAlerts} />
      </div>
    </div>
  );
}
