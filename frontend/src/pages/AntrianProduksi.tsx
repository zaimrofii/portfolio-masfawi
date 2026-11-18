import { Play } from "lucide-react";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { BarisMenunggu } from "@/components/antrian/BarisMenunggu";
import { KartuSedangDikerjakan } from "@/components/antrian/KartuSedangDikerjakan";
import { KendalaForm } from "@/components/pesanan/KendalaForm";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  useToast,
} from "@/components/ui";
import { useAntrian } from "@/hooks/useAntrian";
import { useMulaiBerikutnya } from "@/hooks/useMulaiBerikutnya";
import { useUbahStatus } from "@/hooks/useUbahStatus";

export function AntrianProduksi() {
  const navigate = useNavigate();
  const toast = useToast();

  const { data, isLoading, isError, refetch } = useAntrian();
  const ubahStatus = useUbahStatus();
  const mulaiBerikutnya = useMulaiBerikutnya();

  const [konfirmasiSelesai, setKonfirmasiSelesai] = useState(false);
  const [tampilKendala, setTampilKendala] = useState(false);

  const sedang = data?.sedang_dikerjakan ?? null;
  const menunggu = data?.menunggu ?? [];

  const selesaikanProduksi = async () => {
    if (!sedang) return;

    try {
      await ubahStatus.mutateAsync({
        id: sedang.id,
        status: "SELESAI",
        keterangan: "Selesai produksi",
      });
      toast.sukses("Pesanan selesai diproduksi");
      setKonfirmasiSelesai(false);
      setTampilKendala(false);
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  const jalankanMulaiBerikutnya = async () => {
    try {
      const pesanan = await mulaiBerikutnya.mutateAsync();
      toast.sukses(`Mulai produksi: ${pesanan.nomor}`);
    } catch {
      toast.error("Gagal memulai produksi berikutnya");
    }
  };

  if (isLoading) {
    return (
      <p className="text-sm xl:text-base text-muted-foreground">Memuat…</p>
    );
  }

  if (isError) {
    return (
      <EmptyState
        judul="Gagal memuat antrian"
        deskripsi="Periksa kembali koneksi ke server lalu coba lagi."
        aksi={<Button onClick={() => void refetch()}>Coba lagi</Button>}
      />
    );
  }

  return (
    <div className="space-y-6  xl:space-y-8">
      <h1 className="text-2xl xl:text-3xl font-bold">Antrian Produksi</h1>

      <section className="space-y-3">
        <h2 className="text-lg xl:text-xl font-semibold">Sedang Dikerjakan</h2>

        {sedang ? (
          <div className="space-y-3">
            <KartuSedangDikerjakan
              pesanan={sedang}
              isPending={ubahStatus.isPending}
              onSelesai={() => setKonfirmasiSelesai(true)}
              onCatatKendala={() => setTampilKendala(true)}
              onLihatDetail={() => navigate(`/pesanan/${sedang.id}`)}
            />

            {tampilKendala ? (
              <KendalaForm
                pesananId={sedang.id}
                onSelesai={() => setTampilKendala(false)}
              />
            ) : null}
          </div>
        ) : menunggu.length > 0 ? (
          <Card>
            <EmptyState
              judul="Belum ada pesanan yang dikerjakan"
              deskripsi="Mulai pesanan dengan deadline terdekat."
              aksi={
                <Button
                  size="lg"
                  loading={mulaiBerikutnya.isPending}
                  onClick={() => void jalankanMulaiBerikutnya()}
                >
                  <Play size={16} className="shrink-0" aria-hidden="true" />
                  Mulai Pesanan Berikutnya
                </Button>
              }
            />
          </Card>
        ) : (
          <Card>
            <EmptyState
              judul="Tidak ada antrian"
              deskripsi="Semua pesanan selesai. 🎉"
            />
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base xl:text-lg font-semibold">
          Menunggu ({menunggu.length})
        </h2>
        <BarisMenunggu
          pesananList={menunggu}
          onLihat={(id) => navigate(`/pesanan/${id}`)}
        />
      </section>

      <ConfirmDialog
        open={konfirmasiSelesai}
        judul="Selesaikan produksi?"
        pesan="Pesanan akan keluar dari antrian dan masuk ke tahap invoice."
        confirmLabel="Ya, selesai"
        loading={ubahStatus.isPending}
        onConfirm={() => void selesaikanProduksi()}
        onCancel={() => setKonfirmasiSelesai(false)}
      />
    </div>
  );
}
