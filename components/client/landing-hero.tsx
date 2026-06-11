"use client";

import { Button } from "@/components/ui/button";

interface LandingHeroProps {
  onScrollToForm: () => void;
}

export function LandingHero({ onScrollToForm }: LandingHeroProps) {
  return (
    <header className="flex flex-col items-center gap-6 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          La solution, tout de suite !
        </h1>
        <p className="mx-auto max-w-sm text-base leading-relaxed opacity-90">
          Décrivez votre problème, un professionnel vous contactera.
        </p>
      </div>

      <Button size="lg" className="w-full sm:w-auto" onClick={onScrollToForm}>
        Trouver un professionnel
      </Button>
    </header>
  );
}
