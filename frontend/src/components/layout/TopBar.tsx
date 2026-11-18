import { useState } from "react";

import { Database } from "lucide-react";

import { useLocation } from "react-router-dom";

import { backupDatabase } from "@/api/backup";
import { Button } from "@/components/ui";
import { formatTanggal } from "@/lib/format";

const JUDUL: Record<string, string> = {
  "/": "Dashboard",
  "/pesanan/baru": "Pesanan Baru",
  "/pesanan": "Daftar Pesanan",
  "/antrian": "Antrian Produksi",
  "/arsip": "Arsip",
  "/master/kain": "Master Kain",
  "/master/customer": "Master Customer",
};

function judulUntuk(pathname: string): string {
  if (JUDUL[pathname]) return JUDUL[pathname];
  if (/^\/pesanan\/[^/]+$/.test(pathname)) return "Detail Pesanan";
  return "Halaman Tidak Ditemukan";
}

export function TopBar() {
  const { pathname } = useLocation();
  const [status, setStatus] = useState<"idle" | "loading" | "sukses" | "error">(
    "idle",
  );

  const jalankanBackup = async () => {
    setStatus("loading");
    try {
      await backupDatabase();
      setStatus("sukses");
    } catch {
      setStatus("error");
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4 no-print">
      <h1 className="text-lg font-semibold text-foreground">
        {judulUntuk(pathname)}
      </h1>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {formatTanggal(new Date().toISOString())}
        </span>

        <Button
          variant="secondary"
          onClick={jalankanBackup}
          loading={status === "loading"}
        >
          <Database size={16} className="shrink-0" aria-hidden="true" />
          Backup Database
        </Button>

        {status === "sukses" ? (
          <span className="text-sm text-success">Backup dummy berhasil</span>
        ) : null}
        {status === "error" ? (
          <span className="text-sm text-danger">Backup gagal</span>
        ) : null}
      </div>
    </header>
  );
}
