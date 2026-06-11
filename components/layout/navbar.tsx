"use client";

import Link from "next/link";
import { Menu, Moon, Sun } from "lucide-react";
import { AppLogo, type AppLogoVariant } from "@/components/layout/app-logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/utils/cn";

export interface NavbarProps {
  title?: string;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  logoVariant?: AppLogoVariant;
  showLogo?: boolean;
  className?: string;
}

export function Navbar({
  title,
  showMenuButton = false,
  onMenuClick,
  logoVariant = "on-surface",
  showLogo = true,
  className,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const isOnBrand = logoVariant === "on-brand";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center justify-between gap-4 px-4 backdrop-blur-md",
        isOnBrand
          ? "border-b border-white/15 bg-[var(--color-background)]/90"
          : "border-b border-[var(--color-border)] bg-[var(--color-card)]/95 text-[var(--color-card-foreground)]",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="sm"
            className={cn("lg:hidden", !isOnBrand && "text-[var(--color-card-foreground)]")}
            onClick={onMenuClick}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {showLogo ? (
          <Link href="/" className="shrink-0" aria-label="Need's it — Accueil">
            <AppLogo variant={logoVariant} size="sm" />
          </Link>
        ) : (
          title && (
            <Link
              href="/"
              className="truncate text-lg font-bold tracking-tight"
            >
              {title}
            </Link>
          )
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className={cn(!isOnBrand && "text-[var(--color-card-foreground)]")}
        onClick={toggleTheme}
        aria-label={
          theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"
        }
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>
    </header>
  );
}
