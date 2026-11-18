import { zodResolver } from '@hookform/resolvers/zod';

import { Plus } from 'lucide-react';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { Customer, CustomerCreate } from '@/api/types';
import { customerFormSchema } from '@/components/master/skema';
import type { CustomerFormValues } from '@/components/master/skema';
import {
  Button,
  EmptyState,
  Input,
  Table,
  Textarea,
  useToast,
} from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import {
  useBuatCustomer,
  useCustomerList,
  useUpdateCustomer,
} from '@/hooks/useCustomerList';
import { usePesananList } from '@/hooks/usePesananList';

type Mode = 'tutup' | 'baru' | 'edit';

const NILAI_AWAL: CustomerFormValues = {
  nama: '',
  no_wa: '',
  alamat: '',
  catatan: '',
};

export function MasterCustomer() {
  const toast = useToast();

  const [q, setQ] = useState('');
  const [qDebounce, setQDebounce] = useState('');
  const [mode, setMode] = useState<Mode>('tutup');
  const [customerEdit, setCustomerEdit] = useState<Customer | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setQDebounce(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);

  const { data, isLoading, isError, refetch } = useCustomerList(
    qDebounce || undefined,
  );
  const pesanan = usePesananList({ status: 'SEMUA' });
  const buatCustomer = useBuatCustomer();
  const updateCustomer = useUpdateCustomer();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: NILAI_AWAL,
  });

  const { register, formState, reset, handleSubmit } = form;

  const bukaFormBaru = () => {
    setMode('baru');
    setCustomerEdit(null);
    reset(NILAI_AWAL);
  };

  const bukaFormEdit = (customer: Customer) => {
    setMode('edit');
    setCustomerEdit(customer);
    reset({
      nama: customer.nama,
      no_wa: customer.no_wa,
      alamat: customer.alamat,
      catatan: customer.catatan,
    });
  };

  const tutupForm = () => {
    setMode('tutup');
    setCustomerEdit(null);
    reset(NILAI_AWAL);
  };

  const simpan = handleSubmit(async (values) => {
    const payload: CustomerCreate = {
      nama: values.nama.trim(),
      no_wa: values.no_wa.trim(),
      alamat: values.alamat.trim(),
      catatan: values.catatan.trim(),
    };

    try {
      if (mode === 'edit' && customerEdit) {
        await updateCustomer.mutateAsync({ id: customerEdit.id, payload });
        toast.sukses('Customer diperbarui');
      } else {
        await buatCustomer.mutateAsync(payload);
        toast.sukses('Customer ditambahkan');
      }

      tutupForm();
    } catch {
      toast.error('Gagal menyimpan customer');
    }
  });

  const hitungPesanan = (customerId: number) => {
    if (!pesanan.data) return '-';

    return String(
      pesanan.data.filter((baris) => baris.customer.id === customerId).length,
    );
  };

  const kolom: TableColumn<Customer>[] = [
    {
      key: 'nama',
      header: 'Nama',
      className: 'font-semibold',
      render: (customer) => customer.nama,
    },
    { key: 'no_wa', header: 'No WA', render: (customer) => customer.no_wa },
    {
      key: 'alamat',
      header: 'Alamat',
      render: (customer) => (
        <span
          className="block max-w-xs truncate"
          title={customer.alamat || '-'}
        >
          {customer.alamat || '-'}
        </span>
      ),
    },
    {
      key: 'pesanan',
      header: 'Jumlah Pesanan',
      render: (customer) => hitungPesanan(customer.id),
    },
    {
      key: 'aksi',
      header: '',
      className: 'text-right',
      render: (customer) => (
        <Button variant="secondary" onClick={() => bukaFormEdit(customer)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Master Customer</h1>

        <div className="flex flex-wrap items-end gap-3">
          <Input
            label="Cari"
            placeholder="Cari nama / no WA…"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />

          <Button onClick={bukaFormBaru}>
            <Plus size={16} className="shrink-0" aria-hidden="true" />
            Tambah Customer
          </Button>
        </div>
      </div>

      {mode !== 'tutup' ? (
        <div className="space-y-3 rounded-card border border-border p-4">
          <p className="text-lg font-semibold">
            {mode === 'edit' ? 'Edit Customer' : 'Customer Baru'}
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Nama"
              {...register('nama')}
              error={formState.errors.nama?.message}
            />
            <Input
              label="Nomor WhatsApp"
              placeholder="62812xxxxxxx"
              {...register('no_wa')}
              error={formState.errors.no_wa?.message}
            />
          </div>

          <Textarea
            label="Alamat (opsional)"
            rows={2}
            {...register('alamat')}
          />
          <Textarea
            label="Catatan (opsional)"
            rows={2}
            {...register('catatan')}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void simpan()}
              loading={buatCustomer.isPending || updateCustomer.isPending}
            >
              Simpan
            </Button>
            <Button
              variant="ghost"
              onClick={tutupForm}
              disabled={buatCustomer.isPending || updateCustomer.isPending}
            >
              Batal
            </Button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-base text-muted-foreground">Memuat…</p>
      ) : null}

      {isError ? (
        <EmptyState
          judul="Gagal memuat customer"
          deskripsi="Periksa kembali koneksi ke server lalu coba lagi."
          aksi={<Button onClick={() => void refetch()}>Coba lagi</Button>}
        />
      ) : null}

      {!isLoading && !isError && (data ?? []).length === 0 ? (
        <EmptyState
          judul="Tidak ada customer"
          deskripsi="Coba ubah kata kunci atau tambahkan customer baru."
          aksi={<Button onClick={bukaFormBaru}>Tambah Customer</Button>}
        />
      ) : null}

      {!isLoading && !isError && (data ?? []).length > 0 ? (
        <Table
          columns={kolom}
          data={data ?? []}
          getKey={(customer) => String(customer.id)}
        />
      ) : null}
    </div>
  );
}