import type { ReactNode } from "react";

import { Inbox } from "lucide-react";

import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  ikon?: ReactNode;
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
  className?: string;
}

export function EmptyState({
  ikon = <Inbox size={32} className="shrink-0" aria-hidden="true" />,
  judul,
  deskripsi,
  aksi,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="text-muted-foreground" aria-hidden="true">
        {ikon}
      </div>
      <p className="text-base xl:text-lg font-semibold text-foreground">
        {judul}
      </p>
      {deskripsi ? (
        <p className="max-w-md text-sm xl:text-base text-muted-foreground">
          {deskripsi}
        </p>
      ) : null}
      {aksi ? <div className="mt-2">{aksi}</div> : null}
    </div>
  );
}
