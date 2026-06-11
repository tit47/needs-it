import { forwardRef, type InputHTMLAttributes } from "react";
import { FieldError, fieldErrorId } from "@/components/ui/field-error";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const errorId = inputId ? fieldErrorId(inputId) : undefined;

    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-card-foreground)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "input-field",
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

Input.displayName = "Input";

export { Input };
