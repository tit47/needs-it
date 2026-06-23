import Link from "next/link";
import { cn } from "@/utils/cn";

export interface SeoBreadcrumbItem {
  label: string;
  href?: string;
}

interface SeoBreadcrumbsProps {
  items: SeoBreadcrumbItem[];
  className?: string;
}

export function SeoBreadcrumbs({ items, className }: SeoBreadcrumbsProps) {
  return (
    <nav aria-label="Fil d'Ariane" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-2 text-[var(--color-muted)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="font-medium text-[var(--color-card-foreground)] underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast && "font-medium text-[var(--color-card-foreground)]"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
