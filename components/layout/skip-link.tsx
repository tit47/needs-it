export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-input)] focus:bg-[var(--color-button)] focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-[var(--color-button-foreground)] focus:shadow-[var(--shadow-button)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2"
    >
      Aller au contenu principal
    </a>
  );
}
