import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProPageProps {
  params: Promise<{ token: string }>;
}

export default async function ProPage({ params }: ProPageProps) {
  const { token } = await params;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <header className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide opacity-80">
            Need&apos;s it
          </p>
          <h1 className="mt-2 text-2xl font-bold">Nouvelle demande</h1>
          <p className="mt-2 text-sm opacity-80">
            Page professionnelle sécurisée — contenu à implémenter.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Détails de la demande</CardTitle>
            <CardDescription>
              Catégorie, distance, description et photos — à implémenter.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prise de mission</CardTitle>
            <CardDescription>
              Saisissez le code mission communiqué par le client.
            </CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input label="Code mission" placeholder="XXXX" disabled />
            <Button className="w-full" disabled>
              J&apos;ai pris la mission
            </Button>
          </div>
        </Card>

        <p className="text-center text-xs text-[var(--color-muted)]">
          Lien sécurisé : {token.slice(0, 8)}…
        </p>
      </div>
    </main>
  );
}
