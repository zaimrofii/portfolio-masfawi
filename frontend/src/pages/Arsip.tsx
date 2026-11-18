import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import type { Pesanan } from '@/api/types';
import { Badge, Button, EmptyState, Select, Table } from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { usePesananList } from '@/hooks/usePesananList';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { STATUS_MAP } from '@/lib/status';

const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const OPSI_BULAN = [
  { value: 'SEMUA', label: 'Semua bulan' },
  ...NAMA_BULAN.map((nama, index) => ({
    value: String(index + 1),
    label: nama,
  })),
];

function jumlahPcs(pesanan: Pesanan): number {
  return pesanan.items.reduce(
    (total, item) =>
      total + item.varian.reduce((subtotal, varian) => subtotal + varian.jumlah, 0),
    0,
  );
}

export function Arsip() {
  const navigate = useNavigate();
  const [bulan, setBulan] = useState('SEMUA');

  const { data, isLoading, isError, refetch } = usePesananList({
    status: 'SEMUA',
  });

  const tahunIni = new Date().getFullYear();

  const arsip = (data ?? [])
    .filter((pesanan) => pesanan.status === 'DIAMBIL' || pesanan.status === 'BATAL')
    .filter((pesanan) => {
      if (bulan === 'SEMUA') return true;

      const tanggal = new Date(pesanan.created_at);
      return (
        tanggal.getFullYear() === tahunIni &&
        tanggal.getMonth() + 1 === Number(bulan)
      );
    })
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  const kolom: TableColumn<Pesanan>[] = [
    {
      key: 'nomor',
      header: 'No. Pesanan',
      className: 'font-semibold',
      render: (pesanan) => pesanan.nomor,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (pesanan) => pesanan.customer.nama,
    },
    {
      key: 'item',
      header: 'Item',
      render: (pesanan) =>
        `${pesanan.items.length} item · ${jumlahPcs(pesanan)} pcs`,
    },
    {
      key: 'total',
      header: 'Total',
      render: (pesanan) => formatRupiah(pesanan.total_harga),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (pesanan) => formatTanggal(pesanan.deadline),
    },
    {
      key: 'status',
      header: 'Status',
      render: (pesanan) => (
        <Badge warna={STATUS_MAP[pesanan.status].warna}>
          {STATUS_MAP[pesanan.status].label}
        </Badge>
      ),
    },
    {
      key: 'aksi',
      header: '',
      className: 'text-right',
      render: (pesanan) => (
        <Button
          variant="secondary"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/pesanan/${pesanan.id}`);
          }}
        >
          Lihat
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl xl:text-3xl font-bold">Arsip</h1>

        <div className="w-48">
          <Select
            label="Bulan"
            value={bulan}
            options={OPSI_BULAN}
            onChange={(event) => setBulan(event.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-base text-muted-foreground">Memuat…</p>
      ) : null}

      {isError ? (
        <EmptyState
          judul="Gagal memuat arsip"
          deskripsi="Periksa kembali koneksi ke server lalu coba lagi."
          aksi={<Button onClick={() => void refetch()}>Coba lagi</Button>}
        />
      ) : null}

      {!isLoading && !isError && arsip.length === 0 ? (
        <EmptyState
          judul="Arsip kosong"
          deskripsi="Pesanan yang sudah diambil atau dibatalkan akan muncul di sini."
        />
      ) : null}

      {!isLoading && !isError && arsip.length > 0 ? (
        <Table
          columns={kolom}
          data={arsip}
          getKey={(pesanan) => String(pesanan.id)}
          onRowClick={(pesanan) => navigate(`/pesanan/${pesanan.id}`)}
        />
      ) : null}
    </div>
  );
}