import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, hint, className, id, name, rows = 3, ...props },
    ref,
  ) {
    const textareaId = id ?? name;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label
            htmlFor={textareaId}
            className="block text-sm xl:text-base font-medium text-foreground"
          >
            {label}
          </label>
        ) : null}

        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          rows={rows}
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full rounded-lg border border-input bg-card px-4 py-3 text-sm xl:text-base text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40",
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
  },
);
