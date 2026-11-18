import { ArrowLeft, Printer } from "lucide-react";

import { useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { Button, EmptyState } from "@/components/ui";
import { usePesananDetail } from "@/hooks/usePesananDetail";
import { formatTanggal } from "@/lib/format";
import { resolveSpk } from "@/lib/resolveSpk";
import { ATURAN_PRODUKSI, PERINGATAN_SPK } from "@/lib/spkAturan";

import "@/styles/print.css";

const URUTAN_HURUF = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function kunciUkuran(ukuran: string): [number, number, string] {
  const teks = ukuran.trim().toUpperCase();

  const indeksHuruf = URUTAN_HURUF.indexOf(teks);
  if (indeksHuruf >= 0) return [0, indeksHuruf, teks];

  const angka = Number(teks);
  if (teks !== "" && Number.isFinite(angka)) return [1, angka, teks];

  return [2, 0, teks];
}

function KotakGambar({
  nilai,
  kosong,
}: {
  nilai?: string | null;
  kosong: string;
}) {
  if (!nilai) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded bg-muted/50 text-sm text-muted-foreground">
        {kosong}
      </div>
    );
  }

  return (
    <img src={nilai} alt={kosong} className="mx-auto max-h-64 object-contain" />
  );
}

export function PreviewSpk() {
  const { id, spk_id: spkId } = useParams<{ id: string; spk_id: string }>();
  const navigate = useNavigate();
  const [logoGagal, setLogoGagal] = useState(false);

  const { data, isLoading, isError, refetch } = usePesananDetail(Number(id));

  const spk = useMemo(
    () => data?.spk.find((item) => item.id === Number(spkId)),
    [data, spkId],
  );

  const terurai = useMemo(
    () => (data && spk ? resolveSpk(spk, data.items) : null),
    [data, spk],
  );

  const ukuranUnik = useMemo(() => {
    if (!terurai) return [];
    return [...new Set(terurai.item.varian.map((baris) => baris.ukuran))].sort(
      (a, b) => {
        const [grupA, nilaiA, teksA] = kunciUkuran(a);
        const [grupB, nilaiB, teksB] = kunciUkuran(b);
        if (grupA !== grupB) return grupA - grupB;
        if (nilaiA !== nilaiB) return nilaiA - nilaiB;
        return teksA.localeCompare(teksB);
      },
    );
  }, [terurai]);

  if (isLoading) {
    return <p className="text-base text-muted-foreground">Memuat…</p>;
  }

  if (isError) {
    return (
      <EmptyState
        judul="Gagal memuat SPK"
        deskripsi="Periksa kembali koneksi ke server lalu coba lagi."
        aksi={<Button onClick={() => void refetch()}>Coba lagi</Button>}
      />
    );
  }

  if (!data || !spk || !terurai) {
    return (
      <EmptyState
        judul="SPK tidak ditemukan"
        deskripsi="Nomor SPK tidak valid atau sudah dihapus."
        aksi={
          <Button onClick={() => navigate(`/pesanan/${id}`)}>Kembali</Button>
        }
      />
    );
  }

  const { item, desain } = terurai;

  const totalPcs = item.varian.reduce(
    (total, baris) => total + baris.jumlah,
    0,
  );
  const spesifikasiOtomatis: { label: string; nilai: string }[] = [
    {
      label: "Item",
      nilai: `${item.jenis} — ${item.kain.nama} (${item.warna})`,
    },
    {
      label: "Lengan",
      nilai: item.lengan === "PANJANG" ? "Panjang" : "Pendek",
    },
    { label: "Saku", nilai: item.saku ? "Ya" : "Tidak" },
    { label: "Jenis SPK", nilai: desain.jenis_spk },
  ];

  if (desain.bordir_titik) {
    spesifikasiOtomatis.push({
      label: "Bordir",
      nilai: `${desain.bordir_titik} titik${
        desain.bordir_keterangan ? " — " + desain.bordir_keterangan : ""
      }`,
    });
  }

  spesifikasiOtomatis.push({
    label: "Label Desain",
    nilai: desain.label_desain,
  });

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Preview SPK{" "}
          <span className="text-muted-foreground">{spk.nomor_spk}</span>
        </h1>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/pesanan/${data.id}`)}
          >
            <ArrowLeft size={16} className="shrink-0" aria-hidden="true" />
            Kembali
          </Button>
          <Button onClick={() => window.print()}>
            <Printer size={16} className="shrink-0" aria-hidden="true" />
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>

      <div className="spk-page bg-white p-2 rounded-md">
        <div className="spk-grid">
          {/* ── Baris A: 3 kolom horizontal (a1 | a2 | a3) ── */}

          <div
            style={{ gridArea: "a1" }}
            className="spk-block border border-gray-200"
          >
            <div className="flex h-full items-center justify-center">
              {logoGagal ? (
                <p className="text-center text-sm font-semibold tracking-wide">
                  LOGO USAHA
                </p>
              ) : (
                <img
                  src="/logo.png"
                  alt="Logo usaha"
                  className="max-h-16"
                  onError={() => setLogoGagal(true)}
                />
              )}
            </div>
          </div>

          <div
            style={{ gridArea: "a2" }}
            className="spk-block space-y-0.5 text-sm border border-gray-200"
          >
            <p className="text-base font-bold">{spk.nomor_spk}</p>
            <p>{data.customer.nama}</p>
            <p>{data.customer.no_wa}</p>
            <p className="text-muted-foreground">Pesanan: {data.nomor}</p>
          </div>

          <div
            style={{ gridArea: "a3" }}
            className="spk-block text-sm border border-gray-200"
          >
            <p className="space-y-0.5">
              <span className="block">
                <span className="font-semibold">Label: </span>
                {desain.label_desain}
              </span>
              <span className="block">
                <span className="font-semibold">Tanggal Cetak: </span>
                {formatTanggal(new Date().toISOString())}
              </span>
              <span className="block">
                <span className="font-semibold">Deadline: </span>
                {formatTanggal(data.deadline)}
              </span>
              <span className="block">
                <span className="font-semibold">Designer: </span>
                {data.designer || "-"}
              </span>
            </p>
          </div>

          {/* ── Baris B: desain depan & belakang ── */}
          <div style={{ gridArea: "b1" }} className="spk-block">
            <p className="mb-1 text-sm font-medium">Desain Depan</p>
            <KotakGambar
              nilai={desain.gambar_depan}
              kosong="Tidak ada desain depan"
            />
          </div>

          <div style={{ gridArea: "b2" }} className="spk-block">
            <p className="mb-1 text-sm font-medium">Desain Belakang</p>
            <KotakGambar
              nilai={desain.gambar_belakang}
              kosong="Tidak ada desain belakang"
            />
          </div>
          {/* ── Blok C: spesifikasi otomatis (kiri) + tabel ukuran (kanan) ── */}
          <div
            style={{ gridArea: "c" }}
            className="spk-block spk-block-c space-y-2"
          >
            <div className="spk-c-grid">
              {/* Kiri: Spesifikasi Otomatis */}
              <div className="spk-c-col">
                <table>
                  <tbody>
                    {spesifikasiOtomatis.map((baris) => (
                      <tr key={baris.label}>
                        <th className="w-32">{baris.label}</th>
                        <td>{baris.nilai}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Kanan: Tabel Ukuran (vertikal) */}
              <div className="spk-c-col">
                {ukuranUnik.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada varian.
                  </p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Ukuran</th>
                        <th>Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ukuranUnik.map((ukuran) => (
                        <tr key={ukuran}>
                          <th>{ukuran}</th>
                          <td>
                            {item.varian
                              .filter((baris) => baris.ukuran === ukuran)
                              .reduce(
                                (total, baris) => total + baris.jumlah,
                                0,
                              )}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <th>Total</th>
                        <td className="font-semibold">{totalPcs}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Bawah: Spesifikasi Manual (hanya render jika ada isi) */}
            {desain.spesifikasi.length > 0 && (
              <div>
                <p className="text-sm font-medium">Spesifikasi Manual</p>
                <table>
                  <tbody>
                    {desain.spesifikasi.map((baris, index) => (
                      <tr key={`${baris.label}-${index}`}>
                        <th className="w-32">{baris.label}</th>
                        <td>{baris.nilai || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Baris D: aturan produksi, desain close-up, peringatan ── */}
          <div style={{ gridArea: "d1" }} className="spk-block ">
            <p className="mb-1 font-medium text-sm">Aturan Produksi</p>
            <ul className="list-disc space-y-0.5 pl-5 text-[11px]">
              {ATURAN_PRODUKSI.map((aturan) => (
                <li key={aturan}>{aturan}</li>
              ))}
            </ul>
            <div
              style={{ gridArea: "d3" }}
              className="border border-orange-300 py-1 px-4 text-sm text-orange-500 mt-2"
            >
              <span className="font-semibold">Perhatian: </span>
              {PERINGATAN_SPK}
            </div>
          </div>

          <div style={{ gridArea: "d2" }} className="spk-block">
            <p className="mb-1 text-sm font-medium">Desain Sablon/Bordir</p>
            <div style={{ width: "60%", margin: "0 auto" }}>
              <KotakGambar
                nilai={desain.gambar_desain}
                kosong="Tidak ada desain close-up"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
