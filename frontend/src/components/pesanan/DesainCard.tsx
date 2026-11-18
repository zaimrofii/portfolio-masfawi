import { ImagePlus, Trash2 } from 'lucide-react';

import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { Button, Input, Select } from '@/components/ui';
import { kompresGambar } from '@/lib/gambar';

import { butuhBordir, hitungTitikBordir, OPSI_JENIS_SPK } from './skema';
import type { PesananFormValues } from './skema';

interface SlotProps {
  label: string;
  nilai: string;
  onUbah: (dataUrl: string | null) => void;
}

function SlotGambar({ label, nilai, onUbah }: SlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(false);

  const pilihGambar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setMemuat(true);

    try {
      const dataUrl = await kompresGambar(file);
      onUbah(dataUrl);
    } catch (kesalahan) {
      setError(
        kesalahan instanceof Error
          ? kesalahan.message
          : 'Gagal memproses gambar',
      );
    } finally {
      setMemuat(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>

      {nilai ? (
        <div className="space-y-2">
          <img
            src={nilai}
            alt={label}
            className="aspect-video w-full rounded-lg border border-border bg-muted/40 object-contain"
          />
          <Button variant="ghost" onClick={() => onUbah(null)}>
            <Trash2 size={16} className="shrink-0" aria-hidden="true" />
            Hapus gambar
          </Button>
        </div>
      ) : (
        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input p-3 text-center text-sm text-muted-foreground">
          <ImagePlus size={20} className="shrink-0" aria-hidden="true" />
          {memuat ? 'Memproses…' : 'Pilih gambar (maks 5 MB)'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void pilihGambar(event)}
          />
        </label>
      )}

      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

interface Props {
  form: UseFormReturn<PesananFormValues>;
  itemIndex: number;
  desainIndex: number;
  bisaHapus: boolean;
  onHapus: () => void;
}

export function DesainCard({
  form,
  itemIndex,
  desainIndex,
  bisaHapus,
  onHapus,
}: Props) {
  const { register, watch, setValue, formState } = form;
  const errors = formState.errors.items?.[itemIndex]?.desain?.[desainIndex];

  const jenisSpk =
    watch(`items.${itemIndex}.desain.${desainIndex}.jenis_spk`) ?? 'POLOS';
  const gambarDepan =
    watch(`items.${itemIndex}.desain.${desainIndex}.gambar_depan`) ?? '';
  const gambarBelakang =
    watch(`items.${itemIndex}.desain.${desainIndex}.gambar_belakang`) ?? '';
  const bordirTitik =
    watch(`items.${itemIndex}.desain.${desainIndex}.bordir_titik`) ?? '';

  const perluBordir = butuhBordir(jenisSpk);
  const titik = hitungTitikBordir(bordirTitik) ?? 0;

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-medium text-foreground">
          Desain {desainIndex + 1}
        </p>
        <Button variant="ghost" onClick={onHapus} disabled={!bisaHapus}>
          <Trash2 size={16} className="shrink-0" aria-hidden="true" />
          Hapus desain
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="Label desain"
          placeholder="mis. Logo depan"
          {...register(`items.${itemIndex}.desain.${desainIndex}.label_desain`)}
          error={errors?.label_desain?.message}
        />

        <Select
          label="Jenis SPK"
          value={jenisSpk}
          options={OPSI_JENIS_SPK}
          error={errors?.jenis_spk?.message}
          onChange={(event) =>
            setValue(
              `items.${itemIndex}.desain.${desainIndex}.jenis_spk`,
              event.target.value as 'POLOS' | 'SABLON' | 'BORDIR' | 'CAMPURAN',
              { shouldValidate: true, shouldDirty: true },
            )
          }
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <SlotGambar
          label="Gambar depan"
          nilai={gambarDepan}
          onUbah={(nilai) =>
            setValue(
              `items.${itemIndex}.desain.${desainIndex}.gambar_depan`,
              nilai ?? '',
            )
          }
        />

        <SlotGambar
          label="Gambar belakang"
          nilai={gambarBelakang}
          onUbah={(nilai) =>
            setValue(
              `items.${itemIndex}.desain.${desainIndex}.gambar_belakang`,
              nilai ?? '',
            )
          }
        />

      </div>

      {perluBordir ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Jumlah titik bordir"
            type="number"
            min={1}
            max={999}
            placeholder="1–999"
            {...register(`items.${itemIndex}.desain.${desainIndex}.bordir_titik`)}
            error={errors?.bordir_titik?.message}
          />

          {titik > 0 ? (
            <Input
              label="Keterangan bordir"
              placeholder="mis. Logo dada kiri"
              {...register(
                `items.${itemIndex}.desain.${desainIndex}.bordir_keterangan`,
              )}
              error={errors?.bordir_keterangan?.message}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}