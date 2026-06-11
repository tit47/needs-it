import { cn } from "@/utils/cn";

export function fieldErrorId(fieldId: string): string {
  return `${fieldId}-error`;
}

export function FieldError({
  id,
  error,
  className,
}: {
  id: string;
  error?: string;
  className?: string;
}) {
  if (!error) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn("text-sm text-red-600 dark:text-red-400", className)}
    >
      {error}
    </p>
  );
}
