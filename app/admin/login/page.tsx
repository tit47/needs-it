import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AppLogo } from "@/components/layout/app-logo";
import { SkipLink } from "@/components/layout/skip-link";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <div
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center px-4 py-8"
      >
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Link href="/" aria-label="Need's it — Accueil">
            <AppLogo variant="on-brand" size="md" />
          </Link>
          <p className="text-sm font-medium text-[var(--color-foreground)] opacity-90">
            Administration
          </p>
        </div>

        <div className="w-full max-w-md">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
