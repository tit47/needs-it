import { ClientRequestFlow } from "@/components/client/client-request-flow";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { categoriesService } from "@/services/categories.service";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: categories, error } = await categoriesService.list(supabase);

  if (error || !categories?.length) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-lg">
          <Card className="text-center">
            <p className="text-sm text-[var(--color-muted)]">
              Les catégories ne sont pas disponibles pour le moment. Réessayez
              plus tard.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <ClientRequestFlow categories={categories} />
    </main>
  );
}
