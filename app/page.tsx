import { ClientRequestFlow } from "@/components/client/client-request-flow";
import { ClientShell } from "@/components/layout/client-shell";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { categoriesService } from "@/services/categories.service";

interface HomePageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { category: initialCategoryName } = await searchParams;
  const supabase = await createClient();
  const { data: categories, error } = await categoriesService.list(supabase);

  if (error || !categories?.length) {
    return (
      <ClientShell>
        <div className="mx-auto max-w-lg">
          <Card className="text-center">
            <p className="text-sm text-[var(--color-muted)]">
              Les catégories ne sont pas disponibles pour le moment. Réessayez
              plus tard.
            </p>
          </Card>
        </div>
      </ClientShell>
    );
  }

  return (
    <ClientShell>
      <ClientRequestFlow
        categories={categories}
        initialCategoryName={initialCategoryName}
      />
    </ClientShell>
  );
}
