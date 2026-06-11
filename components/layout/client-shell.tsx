"use client";

import { Navbar } from "@/components/layout/navbar";
import { SkipLink } from "@/components/layout/skip-link";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Navbar logoVariant="on-brand" />
      <div id="main-content" className="flex-1 px-4 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
