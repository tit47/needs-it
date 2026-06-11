"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { copyToClipboard } from "@/utils/clipboard";

interface RequestConfirmationProps {
  missionCode: string;
}

export function RequestConfirmation({ missionCode }: RequestConfirmationProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = useCallback(async () => {
    const success = await copyToClipboard(missionCode);
    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
    return success;
  }, [missionCode]);

  useEffect(() => {
    void copyCode();
  }, [copyCode]);

  const handleCopyClick = () => {
    void copyCode();
  };

  return (
    <Card className="text-center">
      <CardHeader className="items-center">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="h-7 w-7 text-green-700 dark:text-green-300" />
        </div>
        <CardTitle className="text-2xl">Demande envoyée</CardTitle>
        <CardDescription className="max-w-sm text-base">
          Nous recherchons actuellement un professionnel correspondant à votre
          besoin.
        </CardDescription>
      </CardHeader>

      <div className="space-y-4 px-2 pb-2">
        <div>
          <p className="text-sm text-[var(--color-muted)]">Votre code mission</p>
          <Badge variant="accent" className="mt-2 px-4 py-2 text-2xl tracking-[0.3em]">
            {missionCode}
          </Badge>
        </div>

        <p className="text-sm text-[var(--color-card-foreground)]">
          Le professionnel qui vous appellera vous demandera ce code afin de
          confirmer la mission.
        </p>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleCopyClick}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Code copié
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copier le code
            </>
          )}
        </Button>

        <AlertBanner variant="info">
          Gardez votre téléphone à proximité.
          <br />
          Vous pouvez fermer cette page.
        </AlertBanner>
      </div>
    </Card>
  );
}
