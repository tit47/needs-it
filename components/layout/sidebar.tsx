"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MapPin,
  Settings,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { AppLogo } from "@/components/layout/app-logo";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/demandes", label: "Demandes", icon: ClipboardList },
  { href: "/admin/professionnels", label: "Professionnels", icon: Users },
  {
    href: "/admin/candidats",
    label: "Professionnels candidats",
    icon: UserCheck,
  },
  { href: "/admin/alertes", label: "Alertes", icon: AlertTriangle },
  { href: "/admin/opportunites", label: "Opportunités", icon: MapPin },
  { href: "/admin/facturation", label: "Facturation", icon: FileText },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <>
      <div className="hidden border-b border-[var(--color-border)] px-4 py-5 lg:block">
        <Link href="/admin" className="inline-block">
          <AppLogo variant="on-surface" size="sm" />
        </Link>
        <p className="mt-2 text-xs font-medium text-[var(--color-muted)]">
          Administration
        </p>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] lg:hidden">
          Administration
        </p>
        {adminNavItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-150",
                isActive
                  ? "nav-item-active shadow-sm"
                  : "text-[var(--color-card-foreground)] hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-card)] lg:block">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            style={{ animation: "backdrop-enter 200ms ease-out" }}
            aria-label="Fermer le menu"
            onClick={onMobileClose}
          />
          <aside
            className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-[var(--color-card)] shadow-xl"
            style={{ animation: "modal-enter 250ms ease-out" }}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
              <AppLogo variant="on-surface" size="sm" />
              <Button variant="ghost" size="sm" onClick={onMobileClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

export { adminNavItems };
