import { TriangleAlert } from "lucide-react";

import { useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { AksiPanel } from "@/components/pesanan/AksiPanel";
import { KendalaForm } from "@/components/pesanan/KendalaForm";
import { PembayaranCard } from "@/components/pesanan/PembayaranCard";
import { RiwayatStatus } from "@/components/pesanan/RiwayatStatus";
import { SpkCard } from "@/components/pesanan/SpkCard";
import { resolveSpk } from "@/lib/resolveSpk";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { usePesananDetail } from "@/hooks/usePesananDetail";
import {
  formatRupiah,
  formatTanggal,
  formatTanggalWaktu,
  labelSisaHari,
  sisaHari,
} from "@/lib/format";
import { STATUS_MAP } from "@/lib/status";

export function DetailPesanan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pesananId = Number(id);

  const { data, isLoading, isError, error, refetch } =
    usePesananDetail(pesananId);
  const [kendalaTerbuka, setKendalaTerbuka] = useState(false);

  if (isLoading) {
    return <p className="text-base text-muted-foreground">Memuat…</p>;
  }

  const kodeError = (error as { response?: { status?: number } } | null)
    ?.response?.status;

  if (kodeError === 404) {
    return (
      <EmptyState
        judul="Pesanan tidak ditemukan"
        deskripsi="Pesanan mungkin sudah dihapus atau nomor tidak valid."
        aksi={<Button onClick={() => navigate("/pesanan")}>Kembali</Button>}
      />
    );
  }

  if (isError) {
    return (
      <EmptyState
        judul="Gagal memuat pesanan"
        deskripsi="Periksa kembali koneksi ke server lalu coba lagi."
        aksi={<Button onClick={() => void refetch()}>Coba lagi</Button>}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        judul="Pesanan tidak ditemukan"
        deskripsi="Pesanan mungkin sudah dihapus atau nomor tidak valid."
        aksi={<Button onClick={() => navigate("/pesanan")}>Kembali</Button>}
      />
    );
  }

  const sisa = labelSisaHari(sisaHari(data.deadline));
  const statusMeta = STATUS_MAP[data.status];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{data.nomor}</h1>
            <Badge warna={statusMeta.warna}>{statusMeta.label}</Badge>
            <Badge warna="muted">{data.spk.length} SPK</Badge>
          </div>

          <p className="text-base font-medium text-foreground">
            {data.customer.nama}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.customer.no_wa}
            {data.customer.alamat ? ` · ${data.customer.alamat}` : ""}
          </p>
          {data.designer ? (
            <p className="text-sm text-muted-foreground">
              Designer: {data.designer}
            </p>
          ) : null}
        </div>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-base text-muted-foreground">Deadline</p>
            <span className="flex flex-wrap items-center gap-2 text-base text-foreground">
              {formatTanggal(data.deadline)}
              <Badge warna={sisa.warna}>{sisa.label}</Badge>
            </span>
          </div>

          {data.catatan ? (
            <p className="mt-3 text-base text-muted-foreground">
              Catatan: {data.catatan}
            </p>
          ) : null}

          <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
            <span className="text-base font-medium text-foreground">Total</span>
            <span className="text-3xl font-bold text-foreground">
              {formatRupiah(data.total_harga)}
            </span>
          </div>
        </Card>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            Item dan SPK ({data.spk.length})
          </h2>

          {data.items.map((item) => {
            const daftarSpk = data.spk.filter((spk) => spk.item_id === item.id);

            return (
              <Card key={item.id} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-base font-semibold text-foreground">
                    {item.jenis} — {item.kain.nama} ({item.kain.warna})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.lengan === "PANJANG"
                      ? "Lengan panjang"
                      : "Lengan pendek"}
                    {item.saku ? " · saku" : ""}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  Warna: {item.warna}
                </p>

                {daftarSpk.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada SPK untuk item ini.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {daftarSpk.map((spk) => {
                      const terurai = resolveSpk(spk, data.items);

                      if (!terurai) return null;

                      return (
                        <SpkCard
                          key={spk.id}
                          spk={spk}
                          item={terurai.item}
                          desain={terurai.desain}
                          onPreview={() =>
                            navigate(`/pesanan/${data.id}/spk/${spk.id}`)
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Riwayat Status</h2>
          <Card>
            <RiwayatStatus log={data.log} />
          </Card>
        </section>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="mb-3 text-xl font-semibold">Aksi</h2>
          <AksiPanel
            pesanan={data}
            onCatatKendala={() => setKendalaTerbuka(true)}
          />
        </Card>

        <Card>
          <h2 className="mb-3 text-xl font-semibold">Kendala</h2>

          {data.kendala && data.kendala.length > 0 ? (
            <ul className="space-y-2">
              {data.kendala.map((kendala) => (
                <li key={kendala.id} className="rounded-lg bg-muted/60 p-3">
                  <p className="text-base font-medium text-foreground">
                    {kendala.jenis}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {kendala.catatan}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mundur {kendala.estimasi_mundur_hari} hari ·{" "}
                    {formatTanggalWaktu(kendala.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-muted-foreground">
              Tidak ada kendala.
            </p>
          )}

          {data.status === "PRODUKSI" ? (
            <div className="mt-3">
              {kendalaTerbuka ? (
                <KendalaForm
                  pesananId={data.id}
                  onSelesai={() => setKendalaTerbuka(false)}
                />
              ) : (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setKendalaTerbuka(true)}
                >
                  <TriangleAlert
                    size={16}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  Catat Kendala
                </Button>
              )}
            </div>
          ) : null}
        </Card>

        {data.status === "SELESAI" || data.status === "DIAMBIL" ? (
          <PembayaranCard pesanan={data} />
        ) : null}
      </div>
    </div>
  );
}
