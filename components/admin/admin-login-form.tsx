"use client";

import { useState } from "react";
import { signInAdminAction } from "@/app/actions/auth";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signInAdminAction(email, password);
    setIsSubmitting(false);

    if (result?.success === false) {
      setError(result.error);
    }
  };

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle>Connexion administrateur</CardTitle>
        <CardDescription className="max-w-sm">
          Accès réservé aux administrateurs Need&apos;s it.
        </CardDescription>
      </CardHeader>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="admin@example.com"
          autoComplete="email"
          required
        />

        <Input
          name="password"
          type="password"
          label="Mot de passe"
          autoComplete="current-password"
          required
        />

        {error && <AlertBanner variant="error">{error}</AlertBanner>}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner />
              Connexion…
            </>
          ) : (
            "Se connecter"
          )}
        </Button>
      </form>
    </Card>
  );
}
