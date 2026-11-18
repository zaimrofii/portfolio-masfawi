import { ExternalLink, ImageOff, Scissors } from "lucide-react";

import type { DesainItem, ItemPesanan, SpkProduksi } from "@/api/types";
import { Badge, Button } from "@/components/ui";
import { formatRupiah } from "@/lib/format";
import { jumlahPcsItem } from "@/lib/resolveSpk";
import { ATURAN_PRODUKSI, PERINGATAN_SPK } from "@/lib/spkAturan";
import type { WarnaStatus } from "@/lib/status";

const WARNA_JENIS: Record<string, WarnaStatus> = {
  POLOS: "muted",
  SABLON: "info",
  BORDIR: "accent-blue",
  CAMPURAN: "warning",
};

interface Props {
  spk: SpkProduksi;
  item: ItemPesanan;
  desain: DesainItem;
  onPreview: () => void;
}

export function SpkCard({ spk, item, desain, onPreview }: Props) {
  const gambar = [
    { label: "Depan", nilai: desain.gambar_depan ?? "" },
    { label: "Belakang", nilai: desain.gambar_belakang ?? "" },
    { label: "Close-up", nilai: desain.gambar_desain ?? "" },
  ].filter((baris) => baris.nilai !== "");

  const pcs = jumlahPcsItem(item);
  const rupiah = item.varian.reduce(
    (total, varian) => total + varian.subtotal,
    0,
  );
  const ringkas = [
    item.jenis,
    item.kain.nama,
    item.warna,
    item.lengan === "PANJANG" ? "Panjang" : "Pendek",
    desain.jenis_spk,
  ].join(" · ");

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-foreground">
            {spk.nomor_spk}
          </p>
          <p className="text-sm text-muted-foreground">{desain.label_desain}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge warna={WARNA_JENIS[desain.jenis_spk] ?? "muted"}>
            {desain.jenis_spk}
          </Badge>
          <Button variant="primary" onClick={onPreview}>
            <ExternalLink size={16} className="shrink-0" aria-hidden="true" />
            Lihat SPK
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{ringkas}</p>

      {gambar.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {gambar.map((item2) => (
            <figure key={item2.label} className="space-y-1">
              <img
                src={item2.nilai}
                alt={`Gambar ${item2.label} ${spk.nomor_spk}`}
                className="aspect-video w-full rounded-lg border border-border bg-muted/40 object-contain"
              />
              <figcaption className="text-sm text-muted-foreground">
                {item2.label}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageOff size={14} className="shrink-0" aria-hidden="true" />
          Belum ada gambar
        </p>
      )}

      {desain.bordir_titik ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Scissors size={14} className="shrink-0" aria-hidden="true" />
          Bordir {desain.bordir_titik} titik
          {desain.bordir_keterangan ? " — " + desain.bordir_keterangan : ""}
        </p>
      ) : null}

      {desain.spesifikasi.length > 0 ? (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {desain.spesifikasi.map((baris, index) => (
            <li key={`${baris.label}-${index}`}>
              <span className="font-medium text-foreground">
                {baris.label}:
              </span>{" "}
              {baris.nilai || "-"}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-base">
          <thead className="text-sm text-muted-foreground">
            <tr>
              <th className="px-2 py-2 font-medium">Kategori</th>
              <th className="px-2 py-2 font-medium">Ukuran</th>
              <th className="px-2 py-2 font-medium">Jumlah</th>
              <th className="px-2 py-2 font-medium">Harga</th>
              <th className="px-2 py-2 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {item.varian.map((varian) => (
              <tr key={varian.id} className="border-t border-border">
                <td className="px-2 py-2">
                  {varian.kategori === "DEWASA" ? "Dewasa" : "Anak"}
                </td>
                <td className="px-2 py-2">{varian.ukuran}</td>
                <td className="px-2 py-2">{varian.jumlah}</td>
                <td className="px-2 py-2">
                  {formatRupiah(varian.harga_satuan)}
                </td>
                <td className="px-2 py-2">{formatRupiah(varian.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        {pcs} pcs · {formatRupiah(rupiah)}
      </p>

      <div className="rounded-lg bg-muted/50 p-3">
        <p className="text-sm font-medium text-foreground">Aturan produksi</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
          {ATURAN_PRODUKSI.map((aturan) => (
            <li key={aturan}>{aturan}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-warning">{PERINGATAN_SPK}</p>
      </div>
    </div>
  );
}
