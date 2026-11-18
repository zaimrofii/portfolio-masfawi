import { Trash2 } from 'lucide-react';

import type { UseFormReturn } from 'react-hook-form';

import { Button, Input, Select } from '@/components/ui';
import { formatRupiah } from '@/lib/format';
import { subtotalVarian } from '@/lib/kalkulasi';

import type { PesananFormValues } from './skema';

const OPSI_KATEGORI = [
  { value: 'DEWASA', label: 'Dewasa' },
  { value: 'ANAK', label: 'Anak' },
];

interface Props {
  form: UseFormReturn<PesananFormValues>;
  itemIndex: number;
  varianIndex: number;
  errorKategori?: string;
  errorUkuran?: string;
  errorJumlah?: string;
  errorHarga?: string;
  bisaHapus: boolean;
  onHapus: () => void;
}

export function VarianRow({
  form,
  itemIndex,
  varianIndex,
  errorKategori,
  errorUkuran,
  errorJumlah,
  errorHarga,
  bisaHapus,
  onHapus,
}: Props) {
  const { register, watch } = form;
  const varian = watch(`items.${itemIndex}.varian.${varianIndex}`);
  const subtotal = subtotalVarian(
    Number(varian?.jumlah) || 0,
    Number(varian?.harga_satuan) || 0,
  );

  return (
    <tr className="border-t border-border">
      <td className="px-2 py-2 align-top">
        <Select
          aria-label="Kategori"
          {...register(`items.${itemIndex}.varian.${varianIndex}.kategori`)}
          options={OPSI_KATEGORI}
          error={errorKategori}
        />
      </td>

      <td className="px-2 py-2 align-top">
        <Input
          aria-label="Ukuran"
          placeholder="S/M/L"
          {...register(`items.${itemIndex}.varian.${varianIndex}.ukuran`)}
          error={errorUkuran}
        />
      </td>

      <td className="px-2 py-2 align-top">
        <Input
          aria-label="Jumlah"
          type="number"
          min={1}
          {...register(`items.${itemIndex}.varian.${varianIndex}.jumlah`, {
            valueAsNumber: true,
          })}
          error={errorJumlah}
        />
      </td>

      <td className="px-2 py-2 align-top">
        <Input
          aria-label="Harga satuan"
          type="number"
          min={0}
          step={5000}
          placeholder="Harga satuan (hasil nego)"
          {...register(`items.${itemIndex}.varian.${varianIndex}.harga_satuan`)}
          error={errorHarga}
        />
      </td>

      <td className="whitespace-nowrap px-2 py-3 align-top text-foreground">
        {formatRupiah(subtotal)}
      </td>

      <td className="px-2 py-2 text-right align-top">
        <Button
          variant="ghost"
          onClick={onHapus}
          disabled={!bisaHapus}
          aria-label="Hapus varian"
        >
          <Trash2 size={16} className="shrink-0" aria-hidden="true" />
        </Button>
      </td>
    </tr>
  );
}