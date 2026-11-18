import type { UseFormReturn } from 'react-hook-form';

import { formatRupiah } from '@/lib/format';
import { subtotalVarian } from '@/lib/kalkulasi';

import type { PesananFormValues } from './skema';

interface Props {
  form: UseFormReturn<PesananFormValues>;
}

export function TotalSummary({ form }: Props) {
  const items = form.watch('items') ?? [];

  const baris = items.map((item) => {
    const varian = item?.varian ?? [];

    return {
      pcs: varian.reduce((total, satu) => total + (Number(satu?.jumlah) || 0), 0),
      rupiah: varian.reduce(
        (total, satu) =>
          total +
          subtotalVarian(
            Number(satu?.jumlah) || 0,
            Number(satu?.harga_satuan) || 0,
          ),
        0,
      ),
    };
  });

  const total = baris.reduce((jumlah, satu) => jumlah + satu.rupiah, 0);

  return (
    <div className="space-y-2 rounded-lg bg-muted/60 p-4">
      {baris.map((satu, index) => (
        <div
          key={index}
          className="flex items-center justify-between text-sm text-muted-foreground"
        >
          <span>
            Item {index + 1} — {satu.pcs} pcs
          </span>
          <span>{formatRupiah(satu.rupiah)}</span>
        </div>
      ))}

      <div className="flex items-end justify-between border-t border-border pt-3">
        <span className="text-base font-medium text-foreground">
          Total Pesanan
        </span>
        <span className="text-3xl font-bold text-foreground">
          {formatRupiah(total)}
        </span>
      </div>
    </div>
  );
}