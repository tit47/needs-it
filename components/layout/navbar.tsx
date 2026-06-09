"use client";

import Link from "next/link";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/utils/cn";

export interface NavbarProps {
  title?: string;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

export function Navbar({
  title = "Need's it",
  showMenuButton = false,
  onMenuClick,
  className,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-white/10 px-4 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Link href="/" className="text-lg font-bold tracking-tight">
          {title}
        </Link>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
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
