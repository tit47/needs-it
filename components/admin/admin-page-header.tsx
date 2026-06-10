import { type ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm opacity-80">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
