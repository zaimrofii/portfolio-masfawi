import { CheckCircle2, Info, XCircle } from "lucide-react";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ToastType = "sukses" | "error" | "info";

export interface ToastApi {
  sukses: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

const ToastContext = createContext<ToastApi | null>(null);

const MAKS_TOAST = 3;
const DURASI_MS = 3000;
let nomorToast = 1;

const GAYA: Record<ToastType, string> = {
  sukses: "bg-success/15 text-success-foreground border-success/40",
  error: "bg-danger/10 text-danger border-danger/30",
  info: "bg-info/15 text-info-foreground border-info/40",
};

const IKON: Record<ToastType, ReactNode> = {
  sukses: <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" />,
  error: <XCircle size={16} className="shrink-0" aria-hidden="true" />,
  info: <Info size={16} className="shrink-0" aria-hidden="true" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hapus = useCallback((id: number) => {
    setToasts((daftar) => daftar.filter((toast) => toast.id !== id));
  }, []);

  const tambah = useCallback(
    (type: ToastType, message: string) => {
      const id = nomorToast;
      nomorToast += 1;

      setToasts((daftar) =>
        [...daftar, { id, type, message }].slice(-MAKS_TOAST),
      );
      setTimeout(() => hapus(id), DURASI_MS);
    },
    [hapus],
  );

  const api = useMemo<ToastApi>(
    () => ({
      sukses: (message: string) => tambah("sukses", message),
      error: (message: string) => tambah("error", message),
      info: (message: string) => tambah("info", message),
    }),
    [tambah],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-2 rounded-lg border px-4 py-3 text-sm xl:text-base shadow-soft-card transition-all",
              GAYA[toast.type],
            )}
          >
            {IKON[toast.type]}
            <span className="min-w-0 break-words">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  }

  return context;
}
