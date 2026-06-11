import Link from "next/link";
import { LEGAL_DOCUMENT_LINKS } from "@/lib/legal-documents";

export function ClientFooter() {
  return (
    <footer className="border-t border-white/15 px-4 py-6 sm:py-8">
      <nav
        aria-label="Informations légales"
        className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4"
      >
        <ul className="flex w-full flex-col gap-3 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2">
          {LEGAL_DOCUMENT_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-[var(--color-foreground)] underline-offset-4 transition-opacity hover:underline hover:opacity-90"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-xs text-[var(--color-foreground)]/70">
          © {new Date().getFullYear()} Need&apos;s it
        </p>
      </nav>
    </footer>
  );
}
