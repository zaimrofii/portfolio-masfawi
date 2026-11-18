import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, name, ...props },
  ref,
) {
  const inputId = id ?? name;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="block text-sm xl:text-base font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}

      <input
        ref={ref}
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-12 w-full rounded-lg border border-input bg-card px-4 text-sm xl:text-base text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40",
          error && "border-danger focus:border-danger focus:ring-danger/30",
          className,
        )}
        {...props}
      />

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {!error && hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
});
