import { zodResolver } from '@hookform/resolvers/zod';

import { ArrowLeft, Save } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { FieldPath } from 'react-hook-form';

import { useNavigate } from 'react-router-dom';

import type { Pesanan } from '@/api/types';
import { Button, Card, useToast } from '@/components/ui';
import { useBuatPesanan } from '@/hooks/useBuatPesanan';
import { useKainList } from '@/hooks/useKainList';
import { useUpdatePesanan } from '@/hooks/useUpdatePesanan';
import { cn } from '@/lib/cn';

import { StepCustomer } from './StepCustomer';
import { StepItem } from './StepItem';
import { StepVarian } from './StepVarian';
import {
  dariPesanan,
  deadlineDefault,
  defaultItem,
  kePayload,
  pesananFormSchema,
} from './skema';
import type { PesananFormValues } from './skema';

const LANGKAH = [
  { nomor: 1, label: 'Customer' },
  { nomor: 2, label: 'Item' },
  { nomor: 3, label: 'Varian' },
] as const;

/**
 * Field yang divalidasi di Step 2 saja (leaf path).
 * JANGAN memasukkan path induk (items.N.desain / .varian) karena RHF
 * menganggap error di seluruh subtree sebagai blocker — varian baru
 * divalidasi di Step 3.
 */
function fieldStep2(
  items: PesananFormValues['items'],
): FieldPath<PesananFormValues>[] {
  const hasil: FieldPath<PesananFormValues>[] = [];

  items.forEach((item, i) => {
    hasil.push(
      `items.${i}.jenis`,
      `items.${i}.kain_id`,
      `items.${i}.lengan`,
      `items.${i}.warna`,
      `items.${i}.saku`,
    );

    item.desain.forEach((_desain, j) => {
      hasil.push(
        `items.${i}.desain.${j}.label_desain`,
        `items.${i}.desain.${j}.jenis_spk`,
        `items.${i}.desain.${j}.bordir_titik`,
        `items.${i}.desain.${j}.bordir_keterangan`,
      );
    });
  });

  return hasil;
}

interface Props {
  mode?: 'create' | 'edit';
  pesananAwal?: Pesanan;
  pesananId?: number;
}

export function PesananFormWizard({
  mode = 'create',
  pesananAwal,
  pesananId,
}: Props) {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const kains = useKainList();
  const buatPesanan = useBuatPesanan();
  const updatePesanan = useUpdatePesanan();

  const nilaiAwal = useMemo<PesananFormValues>(() => {
    if (pesananAwal) return dariPesanan(pesananAwal);

    return {
      customer_id: '',
      designer: '',
      deadline: deadlineDefault(),
      catatan: '',
      items: [defaultItem()],
    };
  }, [pesananAwal]);

  const form = useForm<PesananFormValues>({
    resolver: zodResolver(pesananFormSchema),
    defaultValues: nilaiAwal,
    mode: 'onTouched',
  });

  const kainPertamaId = kains.data?.[0] ? String(kains.data[0].id) : '';

  useEffect(() => {
    if (!kainPertamaId) return;

    form.getValues('items').forEach((item, index) => {
      if (!item.kain_id) {
        form.setValue(`items.${index}.kain_id`, kainPertamaId, {
          shouldValidate: false,
        });
      }
    });
  }, [kainPertamaId, form]);

  const keStep2 = async () => {
    const valid = await form.trigger(['customer_id', 'deadline']);
    if (valid) setStep(2);
  };

  const keStep3 = async () => {
    const valid = await form.trigger(fieldStep2(form.getValues('items')));
    if (valid) setStep(3);
  };

  const sedangSimpan = buatPesanan.isPending || updatePesanan.isPending;

  const kirim = form.handleSubmit(async (values) => {
    setPesanError(null);
    const payload = kePayload(values);

    try {
      if (mode === 'edit' && pesananId) {
        const hasil = await updatePesanan.mutateAsync({
          id: pesananId,
          payload,
        });
        toast.sukses('Perubahan disimpan');
        navigate(`/pesanan/${hasil.id}`);
        return;
      }

      const pesanan = await buatPesanan.mutateAsync(payload);
      navigate(`/pesanan/${pesanan.id}`);
    } catch {
      setPesanError(
        mode === 'edit'
          ? 'Gagal menyimpan perubahan. Periksa kembali lalu coba lagi.'
          : 'Gagal menyimpan pesanan. Periksa kembali lalu coba lagi.',
      );
    }
  });

  const adaError = Object.keys(form.formState.errors).length > 0;

  return (
    <div className="mx-auto w-full max-w-[92%] space-y-6 lg:max-w-[85%]">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">
          {mode === 'edit' ? 'Edit Pesanan' : 'Pesanan Baru'}
          {mode === 'edit' && pesananAwal ? (
            <span className="ml-3 text-lg font-medium text-muted-foreground">
              {pesananAwal.nomor}
            </span>
          ) : null}
        </h1>

        <div className="flex flex-wrap items-center gap-4">
          {LANGKAH.map(({ nomor, label }) => (
            <div key={nomor} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  'h-3 w-3 rounded-full',
                  step === nomor
                    ? 'bg-primary'
                    : step > nomor
                      ? 'bg-success'
                      : 'bg-muted',
                )}
              />
              <span
                className={cn(
                  'text-sm',
                  step === nomor
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {nomor}. {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card>
        {step === 1 ? <StepCustomer form={form} /> : null}
        {step === 2 ? <StepItem form={form} kainDefaultId={kainPertamaId} /> : null}
        {step === 3 ? <StepVarian form={form} /> : null}
      </Card>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={() => setStep(step === 3 ? 2 : 1)}
              disabled={sedangSimpan}
            >
              <ArrowLeft size={16} className="shrink-0" aria-hidden="true" />
              Kembali
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-2">
          {pesanError ? (
            <p className="text-sm text-danger">{pesanError}</p>
          ) : null}

          {step === 3 && adaError ? (
            <p className="text-sm text-danger">
              Masih ada isian yang belum valid.
            </p>
          ) : null}

          {step === 1 ? (
            <Button onClick={() => void keStep2()}>Lanjut</Button>
          ) : null}
          {step === 2 ? (
            <Button onClick={() => void keStep3()}>Lanjut</Button>
          ) : null}
          {step === 3 ? (
            <Button onClick={() => void kirim()} loading={sedangSimpan}>
              <Save size={16} className="shrink-0" aria-hidden="true" />
              {mode === 'edit' ? 'Simpan Perubahan' : 'Simpan Pesanan'}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}