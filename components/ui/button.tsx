import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold",
          "rounded-[var(--radius-button)]",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2",
          "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
          {
            "bg-[var(--color-button)] text-[var(--color-button-foreground)] shadow-[var(--shadow-button)] hover:bg-[var(--color-button-hover)] hover:shadow-lg":
              variant === "primary",
            "bg-[var(--color-card)] text-[var(--color-card-foreground)] border border-[var(--color-border)] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]":
              variant === "secondary",
            "bg-transparent text-[var(--color-foreground)] hover:bg-white/10 dark:hover:bg-white/5":
              variant === "ghost",
            "bg-red-600 text-white shadow-sm hover:bg-red-700": variant === "danger",
            "h-10 px-5 text-sm": size === "sm",
            "h-12 px-6 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
