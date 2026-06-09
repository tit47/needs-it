"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

interface LandingHeroProps {
  onScrollToForm: () => void;
}

export function LandingHero({ onScrollToForm }: LandingHeroProps) {
  return (
    <header className="flex flex-col items-center gap-5 text-center">
      <Image
        src="/logo.svg"
        alt="Need's it"
        width={72}
        height={72}
        priority
        className="h-[72px] w-[72px]"
      />

      <div>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          La solution, tout de suite !
        </h1>
        <p className="mt-3 text-base opacity-90">
          Décrivez votre problème, un professionnel vous contactera.
        </p>
      </div>

      <Button size="lg" className="w-full sm:w-auto" onClick={onScrollToForm}>
        Trouver un professionnel
      </Button>
    </header>
  );
}
