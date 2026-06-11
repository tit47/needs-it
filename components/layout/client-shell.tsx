"use client";

import { Navbar } from "@/components/layout/navbar";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar logoVariant="on-brand" />
      <div className="flex-1 px-4 py-6 sm:py-8">{children}</div>
    </div>
  );
}
