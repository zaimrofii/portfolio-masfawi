import { useEffect, useRef } from "react";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Button } from "./Button";

export interface ConfirmDialogProps {
  open: boolean;
  judul: string;
  pesan?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  loading?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  judul,
  pesan,
  confirmLabel = "Ya",
  cancelLabel = "Batal",
  variant = "primary",
  loading = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={judul}
      onCancel={(event) => {
        event.preventDefault();
        if (!loading) onCancel();
      }}
      className="fixed inset-0 h-full w-full max-w-none bg-transparent p-0 text-foreground backdrop:bg-transparent"
    >
      <div
        className="flex min-h-full items-center justify-center bg-foreground/40 p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget && !loading) onCancel();
        }}
      >
        <div
          role="document"
          className={cn(
            "glass-card w-full max-w-md rounded-card border border-border p-6 shadow-soft-card",
          )}
        >
          <h2 className="text-lg xl:text-xl font-semibold text-foreground">
            {judul}
          </h2>

          {pesan ? (
            <p className="mt-2 text-sm xl:text-base text-muted-foreground">
              {pesan}
            </p>
          ) : null}

          {children ? <div className="mt-3">{children}</div> : null}

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
              autoFocus
            >
              {cancelLabel}
            </Button>
            <Button variant={variant} onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
