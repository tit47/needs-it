"use client";

import { Check } from "lucide-react";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { releaseMissionAction } from "@/app/actions/pro-workflow";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProMissionActiveProps {
  token: string;
}

export function ProMissionActive({ token }: ProMissionActiveProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRelease = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await releaseMissionAction(token);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    } catch {
      setError("Impossible de libérer la mission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="h-7 w-7 text-green-700 dark:text-green-300" />
        </div>
        <CardTitle>Mission confirmée</CardTitle>
        <CardDescription>
          Vous pouvez vous rendre chez le client. Un email récapitulatif vous a
          été envoyé.
        </CardDescription>
      </CardHeader>

      {error && (
        <AlertBanner variant="error" className="mb-4">
          {error}
        </AlertBanner>
      )}

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={isSubmitting}
        onClick={() => void handleRelease()}
      >
        {isSubmitting ? (
          <>
            <Spinner />
            Libération…
          </>
        ) : (
          "Libérer la mission"
        )}
      </Button>
    </Card>
  );
}
