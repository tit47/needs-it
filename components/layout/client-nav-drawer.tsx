"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HelpCircle, Info, Wrench, X } from "lucide-react";
import { AppLogo } from "@/components/layout/app-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const clientNavItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/comment-ca-marche", label: "Comment ça marche", icon: Info },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/metiers", label: "Métiers", icon: Wrench },
];

export interface ClientNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ClientNavDrawer({ open, onClose }: ClientNavDrawerProps) {
  const pathname = usePathname();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        style={{ animation: "backdrop-enter 200ms ease-out" }}
        aria-label="Fermer le menu"
        onClick={onClose}
      />
      <aside
        className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-[var(--color-card)] shadow-xl"
        style={{ animation: "modal-enter 250ms ease-out" }}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <AppLogo variant="on-surface" size="sm" />
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Navigation principale">
          {clientNavItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === href : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
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
      </aside>
    </div>
  );
}

export { clientNavItems };
