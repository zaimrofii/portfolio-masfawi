import { forwardRef } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, hint, options, children, className, id, name, ...props },
    ref,
  ) {
    const selectId = id ?? name;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label
            htmlFor={selectId}
            className="block text-sm xl:text-base font-medium text-foreground"
          >
            {label}
          </label>
        ) : null}

        <select
          ref={ref}
          id={selectId}
          name={name}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-12 w-full rounded-lg border border-input bg-card px-4 text-sm xl:text-base text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40",
            error && "border-danger focus:border-danger focus:ring-danger/30",
            className,
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {!error && hint ? (
          <p className="text-sm text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    );
  },
);
