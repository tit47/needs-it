"use client";

import { useState, useTransition } from "react";
import {
  createCategoryAction,
  toggleCategoryAction,
  updateMissionPriceAction,
  updateSenderEmailAction,
  updateTelegramNotificationsAction,
} from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types";

interface SettingsPanelProps {
  missionPriceEur: number;
  senderEmail: string;
  telegramNotificationsEnabled: boolean;
  telegramConfigured: boolean;
  appUrl: string;
  categories: Category[];
}

export function SettingsPanel({
  missionPriceEur,
  senderEmail,
  telegramNotificationsEnabled,
  telegramConfigured,
  appUrl,
  categories,
}: SettingsPanelProps) {
  const [price, setPrice] = useState(String(missionPriceEur));
  const [email, setEmail] = useState(senderEmail);
  const [telegramEnabled, setTelegramEnabled] = useState(
    telegramNotificationsEnabled
  );
  const [newCategory, setNewCategory] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runAction = (action: () => Promise<{ success: boolean; error?: string }>) => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Action impossible.");
        return;
      }
      setMessage("Paramètre enregistré.");
    });
  };

  return (
    <div className="space-y-6">
      {(message || error) && (
        <Card padding="sm">
          <p className={error ? "text-sm text-red-500" : "text-sm text-green-700"}>
            {error ?? message}
          </p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prix d&apos;une mise en relation</CardTitle>
            <CardDescription>
              Montant facturé par mission validée (5 € par défaut).
            </CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Prix (€)"
              type="number"
              min={1}
              step="0.5"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            <Button
              onClick={() =>
                runAction(() => updateMissionPriceAction(Number(price)))
              }
              disabled={isPending}
            >
              Enregistrer le prix
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email expéditeur</CardTitle>
            <CardDescription>
              Adresse utilisée pour les emails professionnels.
            </CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Expéditeur"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button
              onClick={() => runAction(() => updateSenderEmailAction(email))}
              disabled={isPending}
            >
              Enregistrer l&apos;email
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration Telegram</CardTitle>
            <CardDescription>
              Active les notifications Telegram pour les alertes importantes.
            </CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-muted)]">
              Bot configuré : {telegramConfigured ? "Oui" : "Non (variables .env)"}
            </p>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={(event) => setTelegramEnabled(event.target.checked)}
                className="h-5 w-5 rounded"
              />
              Activer les notifications Telegram
            </label>
            <Button
              onClick={() =>
                runAction(() =>
                  updateTelegramNotificationsAction(telegramEnabled)
                )
              }
              disabled={isPending}
            >
              Enregistrer Telegram
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres généraux</CardTitle>
            <CardDescription>Informations globales de la plateforme.</CardDescription>
          </CardHeader>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">URL de l&apos;application :</span>{" "}
              {appUrl}
            </p>
            <p className="text-[var(--color-muted)]">
              Les secrets (Supabase, Resend, Telegram) restent configurés dans
              le fichier d&apos;environnement du serveur.
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catégories</CardTitle>
          <CardDescription>
            Activez ou désactivez les catégories proposées aux clients.
          </CardDescription>
        </CardHeader>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <Input
            label="Nouvelle catégorie"
            placeholder="Ex. Vitrier"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            className="flex-1"
          />
          <Button
            className="sm:self-end"
            onClick={() =>
              runAction(async () => {
                const result = await createCategoryAction(newCategory);
                if (result.success) setNewCategory("");
                return result;
              })
            }
            disabled={isPending}
          >
            Ajouter
          </Button>
        </div>

        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{category.name}</span>
                <Badge variant={category.active ? "success" : "default"}>
                  {category.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Button
                size="sm"
                variant={category.active ? "secondary" : "primary"}
                onClick={() =>
                  runAction(() =>
                    toggleCategoryAction(category.id, !category.active)
                  )
                }
                disabled={isPending}
              >
                {category.active ? "Désactiver" : "Activer"}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
