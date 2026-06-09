import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const settingsSections = [
  {
    title: "Catégories",
    description: "Gestion des catégories de services proposées.",
  },
  {
    title: "Prix de la mise en relation",
    description: "Montant facturé par mission validée (5 € par défaut).",
  },
  {
    title: "Email expéditeur",
    description: "Adresse utilisée pour l'envoi des emails professionnels.",
  },
  {
    title: "Notifications Telegram",
    description: "Configuration des alertes automatiques Telegram.",
  },
  {
    title: "Paramètres généraux",
    description: "Options globales de la plateforme.",
  },
];

export default function ParametresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          Paramètres
        </h1>
        <p className="mt-1 text-sm opacity-80">
          Configuration de la plateforme — à implémenter.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
