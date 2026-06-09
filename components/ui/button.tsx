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
          "inline-flex items-center justify-center gap-2 font-semibold transition-colors",
          "rounded-[var(--radius-button)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[var(--color-button)] text-[var(--color-button-foreground)] hover:bg-[var(--color-button-hover)]":
              variant === "primary",
            "bg-[var(--color-card)] text-[var(--color-card-foreground)] border border-[var(--color-border)] hover:opacity-90":
              variant === "secondary",
            "bg-transparent text-[var(--color-foreground)] hover:bg-white/10":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
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
