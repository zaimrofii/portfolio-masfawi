import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl xl:text-3xl font-bold">
        404 — Halaman tidak ditemukan
      </h1>
      <p className="text-muted-foreground">
        Alamat yang Anda buka tidak tersedia di aplikasi ini.
      </p>
      <Button onClick={() => navigate("/")}>Kembali ke Dashboard</Button>
    </div>
  );
}
