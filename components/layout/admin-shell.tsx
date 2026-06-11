"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { SkipLink } from "@/components/layout/skip-link";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] lg:flex-row">
      <SkipLink />
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar
          showMenuButton
          logoVariant="on-surface"
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
