import { ArrowLeft, Printer } from 'lucide-react';

import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import type { ItemPesanan } from '@/api/types';
import { Badge, Button, EmptyState } from '@/components/ui';
import { usePesananDetail } from '@/hooks/usePesananDetail';
import { formatRupiah, formatTanggal } from '@/lib/format';
import type { WarnaStatus } from '@/lib/status';

import '@/styles/print.css';

const WARNA_BAYAR: Record<string, WarnaStatus> = {
  BELUM_BAYAR: 'danger',
  DP: 'warning',
  LUNAS: 'success',
};

const LABEL_BAYAR: Record<string, string> = {
  BELUM_BAYAR: 'Belum bayar',
  DP: 'DP',
  LUNAS: 'Lunas',
};

function pcsItem(item: ItemPesanan): number {
  return item.varian.reduce((total, varian) => total + varian.jumlah, 0);
}

function subtotalItem(item: ItemPesanan): number {
  return item.varian.reduce(
    (total, varian) => total + varian.harga_satuan * varian.jumlah,
    0,
  );
}

function hargaRataRata(item: ItemPesanan): number {
  const pcs = pcsItem(item);
  if (pcs === 0) return 0;

  return Math.round(subtotalItem(item) / pcs);
}

function ringkasUkuran(item: ItemPesanan): string {
  const peta = new Map<string, number>();

  for (const varian of item.varian) {
    peta.set(varian.ukuran, (peta.get(varian.ukuran) ?? 0) + varian.jumlah);
  }

  return [...peta.entries()].map(([ukuran, jumlah]) => `${ukuran}×${jumlah}`).join(', ');
}

export function InvoicePesanan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [logoGagal, setLogoGagal] = useState(false);

  const { data, isLoading, isError, refetch } = usePesananDetail(Number(id));

  if (isLoading) {
    return <p className="text-base text-muted-foreground">Memuat…</p>;
  }

  if (isError) {
    return (
      <EmptyState
        judul="Gagal memuat invoice"
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
        aksi={<Button onClick={() => navigate('/pesanan')}>Kembali</Button>}
      />
    );
  }

  const sisa = Math.max(0, data.total_harga - data.dibayar);

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Invoice <span className="text-muted-foreground">{data.nomor}</span>
        </h1>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate(`/pesanan/${data.id}`)}>
            <ArrowLeft size={16} className="shrink-0" aria-hidden="true" />
            Kembali
          </Button>
          <Button onClick={() => window.print()}>
            <Printer size={16} className="shrink-0" aria-hidden="true" />
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>

      <div className="spk-page space-y-3">
        <div className="spk-block flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {logoGagal ? (
              <p className="text-sm font-semibold tracking-wide">NAMA USAHA</p>
            ) : (
              <img
                src="/logo.png"
                alt="Logo usaha"
                className="max-h-16"
                onError={() => setLogoGagal(true)}
              />
            )}
          </div>

          <div className="text-right text-sm">
            <p className="text-xl font-bold tracking-wide">INVOICE</p>
            <p>No: {data.nomor}</p>
            <p>Tanggal: {formatTanggal(new Date().toISOString())}</p>
          </div>
        </div>

        <div className="spk-block text-sm">
          <p className="font-semibold">Ditagihkan kepada</p>
          <p>{data.customer.nama}</p>
          <p>{data.customer.no_wa}</p>
          {data.customer.alamat ? <p>{data.customer.alamat}</p> : null}
          {data.designer ? (
            <p className="text-muted-foreground">Designer: {data.designer}</p>
          ) : null}
        </div>

        <div className="spk-block spk-block-c">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Ukuran</th>
                <th>Jumlah</th>
                <th>Harga Satuan</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.jenis} — {item.kain.nama} ({item.warna})
                  </td>
                  <td>{ringkasUkuran(item) || '-'}</td>
                  <td>{pcsItem(item)} pcs</td>
                  <td>{pcsItem(item) > 0 ? formatRupiah(hargaRataRata(item)) : '-'}</td>
                  <td>{formatRupiah(subtotalItem(item))}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="font-semibold">
                  Total
                </td>
                <td className="font-semibold">{formatRupiah(data.total_harga)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="max-w-md text-sm text-muted-foreground">
            Terima kasih telah mempercayakan jahitan Anda.
          </p>

          <div className="spk-block min-w-64 space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span>Subtotal</span>
              <span>{formatRupiah(data.total_harga)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Total</span>
              <span>{formatRupiah(data.total_harga)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Dibayar</span>
              <span>{formatRupiah(data.dibayar)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border pt-1">
              <span className="font-semibold">Sisa Tagihan</span>
              <span className="text-lg font-bold">{formatRupiah(sisa)}</span>
            </div>
            <div className="pt-1">
              <Badge warna={WARNA_BAYAR[data.status_bayar] ?? 'muted'}>
                {LABEL_BAYAR[data.status_bayar] ?? data.status_bayar}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">WA usaha: 0812-xxxx-xxxx</p>
      </div>
    </div>
  );
}