import { AppLogo } from "@/components/layout/app-logo";

interface ProPageHeaderProps {
  title: string;
}

export function ProPageHeader({ title }: ProPageHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <AppLogo variant="on-brand" size="md" priority />
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
          Espace professionnel
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h1>
      </div>
    </header>
  );
}
