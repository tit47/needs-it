"use client";

import { useState } from "react";
import { ClientFooter } from "@/components/layout/client-footer";
import { ClientNavDrawer } from "@/components/layout/client-nav-drawer";
import { Navbar } from "@/components/layout/navbar";
import { SkipLink } from "@/components/layout/skip-link";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Navbar
        logoVariant="on-brand"
        showMenuButton
        onMenuClick={() => setMenuOpen(true)}
      />
      <ClientNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div id="main-content" className="flex-1 px-4 py-6 sm:py-8">
        {children}
      </div>
      <ClientFooter />
    </div>
  );
}
