import { zodResolver } from '@hookform/resolvers/zod';

import { Receipt } from 'lucide-react';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useNavigate } from 'react-router-dom';

import { z } from 'zod';

import type { MetodeBayar, Pesanan } from '@/api/types';
import { Badge, Button, Card, Input, Select, useToast } from '@/components/ui';
import { useCatatPembayaran } from '@/hooks/useCatatPembayaran';
import { formatRupiah } from '@/lib/format';
import type { WarnaStatus } from '@/lib/status';

const skemaPembayaran = z.object({
  nominal: z
    .number({ message: 'Nominal wajib diisi' })
    .min(1, 'Nominal minimal Rp 1'),
  metode: z.enum(['', 'TUNAI', 'TRANSFER']),
  catatan: z.string(),
});

type NilaiPembayaran = z.infer<typeof skemaPembayaran>;

const OPSI_METODE = [
  { value: '', label: 'Tidak disebutkan' },
  { value: 'TUNAI', label: 'Tunai' },
  { value: 'TRANSFER', label: 'Transfer' },
];

const WARNA_BAYAR: Record<Pesanan['status_bayar'], WarnaStatus> = {
  BELUM_BAYAR: 'danger',
  DP: 'warning',
  LUNAS: 'success',
};

const LABEL_BAYAR: Record<Pesanan['status_bayar'], string> = {
  BELUM_BAYAR: 'Belum bayar',
  DP: 'DP',
  LUNAS: 'Lunas',
};

export function PembayaranCard({ pesanan }: { pesanan: Pesanan }) {
  const toast = useToast();
  const navigate = useNavigate();
  const catat = useCatatPembayaran();

  const [formTerbuka, setFormTerbuka] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const sisa = Math.max(0, pesanan.total_harga - pesanan.dibayar);
  const lunas = pesanan.status_bayar === 'LUNAS';

  const form = useForm<NilaiPembayaran>({
    resolver: zodResolver(skemaPembayaran),
    defaultValues: { nominal: 0, metode: '', catatan: '' },
  });

  const { register, formState, handleSubmit, reset, setError } = form;

  const kirim = handleSubmit(async (values) => {
    setPesanError(null);

    if (values.nominal > sisa) {
      setError('nominal', {
        message: `Nominal maksimal ${formatRupiah(sisa)}`,
      });
      return;
    }

    try {
      await catat.mutateAsync({
        id: pesanan.id,
        payload: {
          nominal: values.nominal,
          metode: values.metode ? (values.metode as MetodeBayar) : undefined,
          catatan: values.catatan.trim() || undefined,
          lunas: pesanan.dibayar + values.nominal >= pesanan.total_harga,
        },
      });
      toast.sukses('Pembayaran dicatat');
      setFormTerbuka(false);
      reset({ nominal: 0, metode: '', catatan: '' });
    } catch {
      setPesanError('Gagal mencatat pembayaran. Coba lagi.');
    }
  });

  const lunasi = async () => {
    setPesanError(null);

    try {
      await catat.mutateAsync({
        id: pesanan.id,
        payload: { nominal: sisa, lunas: true },
      });
      toast.sukses('Pesanan dilunasi');
    } catch {
      setPesanError('Gagal mencatat pelunasan. Coba lagi.');
    }
  };

  return (
    <Card className="space-y-3">
      <h2 className="text-xl font-semibold">Pembayaran</h2>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">Sisa Tagihan</p>
          <p className="text-2xl font-bold text-foreground">
            {formatRupiah(sisa)}
          </p>
        </div>
        <Badge warna={WARNA_BAYAR[pesanan.status_bayar]}>
          {LABEL_BAYAR[pesanan.status_bayar]}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Total: {formatRupiah(pesanan.total_harga)} · Dibayar:{' '}
        {formatRupiah(pesanan.dibayar)}
      </p>

      {pesanan.metode_bayar || pesanan.catatan_bayar ? (
        <p className="text-sm text-muted-foreground">
          {pesanan.metode_bayar ? `Metode: ${pesanan.metode_bayar}` : ''}
          {pesanan.metode_bayar && pesanan.catatan_bayar ? ' · ' : ''}
          {pesanan.catatan_bayar ?? ''}
        </p>
      ) : null}

      {pesanError ? <p className="text-sm text-danger">{pesanError}</p> : null}

      {formTerbuka && !lunas ? (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <Input
            label="Nominal"
            type="number"
            min={1}
            max={sisa}
            {...register('nominal', { valueAsNumber: true })}
            error={formState.errors.nominal?.message}
          />
          <Select label="Metode" options={OPSI_METODE} {...register('metode')} />
          <Input label="Catatan (opsional)" {...register('catatan')} />

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void kirim()} loading={catat.isPending}>
              Simpan
            </Button>
            <Button
              variant="ghost"
              onClick={() => setFormTerbuka(false)}
              disabled={catat.isPending}
            >
              Batal
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {!lunas ? (
          <>
            <Button
              fullWidth
              onClick={() => setFormTerbuka(true)}
              disabled={formTerbuka}
            >
              Catat Pembayaran
            </Button>

            {pesanan.dibayar > 0 ? (
              <Button
                fullWidth
                loading={catat.isPending}
                onClick={() => void lunasi()}
              >
                Lunasi
              </Button>
            ) : null}
          </>
        ) : null}

        <Button
          variant={lunas ? 'secondary' : 'ghost'}
          fullWidth
          onClick={() => navigate(`/pesanan/${pesanan.id}/invoice`)}
        >
          <Receipt size={16} className="shrink-0" aria-hidden="true" />
          Lihat Invoice
        </Button>
      </div>
    </Card>
  );
}