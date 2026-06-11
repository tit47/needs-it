import { forwardRef, type TextareaHTMLAttributes } from "react";
import { FieldError, fieldErrorId } from "@/components/ui/field-error";
import { cn } from "@/utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const errorId = textareaId ? fieldErrorId(textareaId) : undefined;

    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[var(--color-card-foreground)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "input-field min-h-[120px] py-3",
            error && "input-field-error",
            className
          )}
          {...props}
        />
        {error && errorId && <FieldError id={errorId} error={error} />}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
