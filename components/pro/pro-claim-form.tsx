"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { claimMissionAction } from "@/app/actions/pro-workflow";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  isValidMissionCodeFormat,
  normalizeMissionCodeInput,
} from "@/utils/mission-code";

interface ProClaimFormProps {
  token: string;
}

export function ProClaimForm({ token }: ProClaimFormProps) {
  const router = useRouter();
  const [missionCode, setMissionCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const normalized = normalizeMissionCodeInput(missionCode);
    if (!isValidMissionCodeFormat(normalized)) {
      setError("Le code mission comporte 4 caractères.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await claimMissionAction(token, normalized);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    } catch {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prise de mission</CardTitle>
        <CardDescription>
          Appelez le client, puis saisissez le code qu&apos;il vous communique
          par téléphone.
        </CardDescription>
      </CardHeader>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <Input
          label="Code mission"
          placeholder="XXXX"
          value={missionCode}
          onChange={(event) =>
            setMissionCode(normalizeMissionCodeInput(event.target.value))
          }
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={4}
          error={error ?? undefined}
          className="text-center text-2xl tracking-[0.35em] uppercase"
        />

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Confirmation…
            </>
          ) : (
            "J'ai pris la mission"
          )}
        </Button>
      </form>
    </Card>
  );
}
