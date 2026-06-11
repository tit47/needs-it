import { cn } from "@/utils/cn";
import { Spinner } from "@/components/ui/spinner";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Chargement…",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 py-8 text-[var(--color-muted)]",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner />
      <span className="text-sm">{message}</span>
    </div>
  );
}
