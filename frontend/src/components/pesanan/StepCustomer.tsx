import { Plus } from 'lucide-react';

import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { Customer } from '@/api/types';
import { Button, Input } from '@/components/ui';
import { useBuatCustomer, useCustomerList } from '@/hooks/useCustomerList';

import type { PesananFormValues } from './skema';

interface Props {
  form: UseFormReturn<PesananFormValues>;
}

export function StepCustomer({ form }: Props) {
  const [q, setQ] = useState('');
  const [qDebounce, setQDebounce] = useState('');
  const [terpilih, setTerpilih] = useState<Customer | null>(null);
  const [formBaru, setFormBaru] = useState(false);
  const [nama, setNama] = useState('');
  const [noWa, setNoWa] = useState('');
  const [alamat, setAlamat] = useState('');
  const [errorBaru, setErrorBaru] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setQDebounce(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);

  const customers = useCustomerList(qDebounce || undefined);
  const buatCustomer = useBuatCustomer();
  const daftar = customers.data ?? [];

  const pilih = (customer: Customer) => {
    setTerpilih(customer);
    form.setValue('customer_id', String(customer.id), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const simpanCustomerBaru = async () => {
    setErrorBaru(null);

    if (!nama.trim()) {
      setErrorBaru('Nama customer wajib diisi');
      return;
    }

    try {
      const baru = await buatCustomer.mutateAsync({
        nama: nama.trim(),
        no_wa: noWa.trim(),
        alamat: alamat.trim(),
        catatan: '',
      });
      pilih(baru);
      setFormBaru(false);
      setNama('');
      setNoWa('');
      setAlamat('');
      setQ('');
      setQDebounce('');
    } catch {
      setErrorBaru('Gagal menyimpan customer baru');
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">1. Pilih Customer</h2>

      {terpilih ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 p-4">
          <div>
            <p className="text-base font-medium text-foreground">
              {terpilih.nama}
            </p>
            <p className="text-sm text-muted-foreground">
              {terpilih.no_wa}
              {terpilih.alamat ? ` · ${terpilih.alamat}` : ''}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setTerpilih(null);
              form.setValue('customer_id', '', { shouldValidate: true });
            }}
          >
            Ganti
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            label="Cari customer"
            name="cari_customer"
            placeholder="Nama atau nomor WhatsApp"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            hint="Pencarian otomatis setelah 300 ms"
          />

          {customers.isLoading ? (
            <p className="text-sm text-muted-foreground">Memuat customer…</p>
          ) : null}

          {!customers.isLoading && daftar.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Customer tidak ditemukan.
            </p>
          ) : null}

          {daftar.length > 0 ? (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {daftar.slice(0, 6).map((customer) => (
                <li
                  key={customer.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-base text-foreground">{customer.nama}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.no_wa}
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => pilih(customer)}>
                    Pilih
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      {form.formState.errors.customer_id ? (
        <p className="text-sm text-danger">
          {form.formState.errors.customer_id.message}
        </p>
      ) : null}

      <Input
        label="Deadline"
        type="date"
        {...form.register('deadline')}
        error={form.formState.errors.deadline?.message}
      />

      <Input
        label="Designer (opsional)"
        placeholder="Nama designer (opsional)"
        {...form.register('designer')}
      />

      <div className="space-y-3 rounded-lg border border-border p-4">
        {!formBaru ? (
          <Button variant="ghost" onClick={() => setFormBaru(true)}>
            <Plus size={16} className="shrink-0" aria-hidden="true" />
            Customer Baru
          </Button>
        ) : (
          <>
            <p className="text-base font-medium text-foreground">
              Customer baru
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
              <Input
                label="Nomor WhatsApp"
                value={noWa}
                onChange={(e) => setNoWa(e.target.value)}
              />
              <Input
                label="Alamat"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="md:col-span-2"
              />
            </div>

            {errorBaru ? (
              <p className="text-sm text-danger">{errorBaru}</p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => void simpanCustomerBaru()}
                loading={buatCustomer.isPending}
              >
                Simpan dan Pilih
              </Button>
              <Button variant="ghost" onClick={() => setFormBaru(false)}>
                Batal
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}