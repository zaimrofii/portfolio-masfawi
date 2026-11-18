import { zodResolver } from '@hookform/resolvers/zod';

import { Plus } from 'lucide-react';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { BahanKain, KainCreate } from '@/api/types';
import { kainFormSchema } from '@/components/master/skema';
import type { KainFormValues } from '@/components/master/skema';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Input,
  Table,
  useToast,
} from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { useBuatKain, useKainList, useUpdateKain } from '@/hooks/useKainList';
import { formatRupiah } from '@/lib/format';

type Mode = 'tutup' | 'baru' | 'edit';

const NILAI_AWAL: KainFormValues = {
  nama: '',
  warna: '',
  harga_per_meter: 0,
  stok_meter: 0,
  aktif: true,
};

export function MasterKain() {
  const toast = useToast();
  const { data, isLoading, isError, refetch } = useKainList();
  const buatKain = useBuatKain();
  const updateKain = useUpdateKain();

  const [mode, setMode] = useState<Mode>('tutup');
  const [kainEdit, setKainEdit] = useState<BahanKain | null>(null);
  const [konfirmasi, setKonfirmasi] = useState<BahanKain | null>(null);

  const form = useForm<KainFormValues>({
    resolver: zodResolver(kainFormSchema),
    defaultValues: NILAI_AWAL,
  });

  const { register, formState, reset, handleSubmit } = form;

  const bukaFormBaru = () => {
    setMode('baru');
    setKainEdit(null);
    reset(NILAI_AWAL);
  };

  const bukaFormEdit = (kain: BahanKain) => {
    setMode('edit');
    setKainEdit(kain);
    reset({
      nama: kain.nama,
      warna: kain.warna,
      harga_per_meter: kain.harga_per_meter,
      stok_meter: kain.stok_meter,
      aktif: kain.aktif,
    });
  };

  const tutupForm = () => {
    setMode('tutup');
    setKainEdit(null);
    reset(NILAI_AWAL);
  };

  const simpan = handleSubmit(async (values) => {
    const payload: KainCreate = {
      nama: values.nama.trim(),
      warna: values.warna.trim(),
      harga_per_meter: Number(values.harga_per_meter),
      stok_meter: Number(values.stok_meter),
      aktif: values.aktif,
    };

    try {
      if (mode === 'edit' && kainEdit) {
        await updateKain.mutateAsync({ id: kainEdit.id, payload });
        toast.sukses('Kain diperbarui');
      } else {
        await buatKain.mutateAsync(payload);
        toast.sukses('Kain ditambahkan');
      }

      tutupForm();
    } catch {
      toast.error('Gagal menyimpan kain');
    }
  });

  const ubahAktif = async (kain: BahanKain, aktif: boolean) => {
    const payload: KainCreate = {
      nama: kain.nama,
      warna: kain.warna,
      harga_per_meter: kain.harga_per_meter,
      stok_meter: kain.stok_meter,
      aktif,
    };

    try {
      await updateKain.mutateAsync({ id: kain.id, payload });
      toast.sukses(aktif ? 'Kain diaktifkan' : 'Kain dinonaktifkan');
    } catch {
      toast.error('Gagal memperbarui kain');
    } finally {
      setKonfirmasi(null);
    }
  };

  const kolom: TableColumn<BahanKain>[] = [
    {
      key: 'nama',
      header: 'Nama',
      className: 'font-semibold',
      render: (kain) => kain.nama,
    },
    { key: 'warna', header: 'Warna', render: (kain) => kain.warna || '-' },
    {
      key: 'harga',
      header: 'Harga/meter',
      render: (kain) => formatRupiah(kain.harga_per_meter),
    },
    { key: 'stok', header: 'Stok', render: (kain) => `${kain.stok_meter} m` },
    {
      key: 'status',
      header: 'Status',
      render: (kain) => (
        <Badge warna={kain.aktif ? 'success' : 'muted'}>
          {kain.aktif ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'aksi',
      header: '',
      className: 'text-right',
      render: (kain) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => bukaFormEdit(kain)}>
            Edit
          </Button>

          {kain.aktif ? (
            <Button variant="ghost" onClick={() => setKonfirmasi(kain)}>
              Nonaktifkan
            </Button>
          ) : (
            <Button
              variant="ghost"
              loading={updateKain.isPending}
              onClick={() => void ubahAktif(kain, true)}
            >
              Aktifkan
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Master Kain</h1>

        <Button onClick={bukaFormBaru}>
          <Plus size={16} className="shrink-0" aria-hidden="true" />
          Tambah Kain
        </Button>
      </div>

      {mode !== 'tutup' ? (
        <div className="space-y-3 rounded-card border border-border p-4">
          <p className="text-lg font-semibold">
            {mode === 'edit' ? 'Edit Kain' : 'Kain Baru'}
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Nama kain"
              placeholder="mis. Cotton Combed 30s"
              {...register('nama')}
              error={formState.errors.nama?.message}
            />
            <Input
              label="Warna (opsional)"
              placeholder="mis. Hitam"
              {...register('warna')}
            />
            <Input
              label="Harga per meter"
              type="number"
              min={0}
              step={1000}
              {...register('harga_per_meter', { valueAsNumber: true })}
              error={formState.errors.harga_per_meter?.message}
            />
            <Input
              label="Stok (meter)"
              type="number"
              min={0}
              {...register('stok_meter', { valueAsNumber: true })}
              error={formState.errors.stok_meter?.message}
            />
          </div>

          <label className="flex min-h-12 items-center gap-3 text-base text-foreground">
            <input
              type="checkbox"
              className="h-5 w-5 accent-primary"
              {...register('aktif')}
            />
            Aktif
          </label>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void simpan()}
              loading={buatKain.isPending || updateKain.isPending}
            >
              Simpan
            </Button>
            <Button
              variant="ghost"
              onClick={tutupForm}
              disabled={buatKain.isPending || updateKain.isPending}
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
          judul="Gagal memuat kain"
          deskripsi="Periksa kembali koneksi ke server lalu coba lagi."
          aksi={<Button onClick={() => void refetch()}>Coba lagi</Button>}
        />
      ) : null}

      {!isLoading && !isError && (data ?? []).length === 0 ? (
        <EmptyState
          judul="Belum ada kain"
          deskripsi="Tambahkan kain pertama Anda."
          aksi={<Button onClick={bukaFormBaru}>Tambah Kain</Button>}
        />
      ) : null}

      {!isLoading && !isError && (data ?? []).length > 0 ? (
        <Table
          columns={kolom}
          data={data ?? []}
          getKey={(kain) => String(kain.id)}
        />
      ) : null}

      <ConfirmDialog
        open={konfirmasi !== null}
        judul="Nonaktifkan kain?"
        pesan="Kain nonaktif tidak akan muncul di form pesanan baru. Yakin?"
        confirmLabel="Ya, nonaktifkan"
        variant="danger"
        loading={updateKain.isPending}
        onConfirm={() => {
          if (konfirmasi) void ubahAktif(konfirmasi, false);
        }}
        onCancel={() => setKonfirmasi(null)}
      />
    </div>
  );
}