import { CheckCheck, ExternalLink, Scissors, TriangleAlert } from 'lucide-react';

import type { ItemPesanan, Pesanan } from '@/api/types';
import { Badge, Button, Card } from '@/components/ui';
import { formatRupiah, formatTanggal, labelSisaHari, sisaHari } from '@/lib/format';
import { STATUS_MAP } from '@/lib/status';

interface Props {
  pesanan: Pesanan;
  isPending: boolean;
  onSelesai: () => void;
  onCatatKendala: () => void;
  onLihatDetail: () => void;
}

function pcsItem(item: ItemPesanan): number {
  return item.varian.reduce((total, varian) => total + varian.jumlah, 0);
}

export function KartuSedangDikerjakan({
  pesanan,
  isPending,
  onSelesai,
  onCatatKendala,
  onLihatDetail,
}: Props) {
  const sisa = labelSisaHari(sisaHari(pesanan.deadline));
  const totalPcs = pesanan.items.reduce(
    (total, item) => total + pcsItem(item),
    0,
  );
  const kendala = pesanan.kendala ?? [];

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-2xl font-semibold text-foreground">
            {pesanan.nomor}
          </p>
          <Badge warna={STATUS_MAP[pesanan.status].warna}>
            {STATUS_MAP[pesanan.status].label}
          </Badge>
          <Badge warna={sisa.warna}>{sisa.label}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{pesanan.customer.no_wa}</p>
      </div>

      <p className="text-base font-medium text-foreground">
        {pesanan.customer.nama}
        {pesanan.designer ? (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            · Designer: {pesanan.designer}
          </span>
        ) : null}
      </p>

      <div className="space-y-2">
        <ul className="space-y-1">
          {pesanan.items.map((item) => (
            <li key={item.id} className="text-base text-foreground">
              {item.jenis} {item.warna} ×{pcsItem(item)} — {item.kain.nama},{' '}
              {item.lengan === 'PANJANG' ? 'Panjang' : 'Pendek'}
            </li>
          ))}
        </ul>

        <ul className="space-y-1">
          {pesanan.items.flatMap((item) =>
            item.desain
              .filter((desain) => (desain.bordir_titik ?? 0) > 0)
              .map((desain, index) => (
                <li
                  key={`bordir-${item.id}-${index}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Scissors size={14} className="shrink-0" aria-hidden="true" />
                  Bordir {desain.bordir_titik} titik
                  {desain.bordir_keterangan ? ' — ' + desain.bordir_keterangan : ''}
                  {' · '}
                  {desain.label_desain}
                </li>
              )),
          )}
        </ul>

        <p className="text-sm text-muted-foreground">
          Total: {totalPcs} pcs · {formatRupiah(pesanan.total_harga)} ·{' '}
          {pesanan.spk.length} SPK
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-base text-muted-foreground">Deadline</span>
        <span className="flex flex-wrap items-center gap-2 text-base text-foreground">
          {formatTanggal(pesanan.deadline)}
          <Badge warna={sisa.warna}>{sisa.label}</Badge>
        </span>
      </div>

      {kendala.length > 0 ? (
        <ul className="space-y-1">
          {kendala.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2 text-sm text-warning"
            >
              <TriangleAlert
                size={14}
                className="mt-1 shrink-0"
                aria-hidden="true"
              />
              <span>
                {item.jenis} — {item.catatan} · mundur {
                  item.estimasi_mundur_hari
                }{' '}
                hari
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={onCatatKendala}
        >
          <TriangleAlert size={16} className="shrink-0" aria-hidden="true" />
          Catat Kendala
        </Button>

        <Button
          size="lg"
          className="w-full sm:w-auto"
          loading={isPending}
          onClick={onSelesai}
        >
          <CheckCheck size={16} className="shrink-0" aria-hidden="true" />
          Selesai Produksi
        </Button>

        <Button
          size="lg"
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={onLihatDetail}
        >
          <ExternalLink size={16} className="shrink-0" aria-hidden="true" />
          Lihat Detail
        </Button>
      </div>
    </Card>
  );
}