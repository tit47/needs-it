import { type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "warning" | "danger";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        {
          "bg-[var(--color-card-foreground)] text-[var(--color-card)]":
            variant === "default",
          "bg-[var(--color-accent)] text-[var(--color-card-foreground)]":
            variant === "accent",
          "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300":
            variant === "success",
          "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300":
            variant === "warning",
          "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300":
            variant === "danger",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
