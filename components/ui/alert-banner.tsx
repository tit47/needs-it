import { cn } from "@/utils/cn";

export type AlertBannerVariant = "error" | "success" | "info";

export interface AlertBannerProps {
  variant: AlertBannerVariant;
  children: React.ReactNode;
  className?: string;
}

export function AlertBanner({
  variant,
  children,
  className,
}: AlertBannerProps) {
  return (
    <p
      role="alert"
      className={cn(
        "alert-banner",
        {
          "alert-banner-error": variant === "error",
          "alert-banner-success": variant === "success",
          "alert-banner-info": variant === "info",
        },
        className
      )}
    >
      {children}
    </p>
  );
}
