import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';
import { warnaBadge } from '@/lib/status';
import type { WarnaStatus } from '@/lib/status';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  warna?: WarnaStatus;
}

export function Badge({ warna = 'muted', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill border px-3 py-1 text-sm font-medium',
        warnaBadge(warna),
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}