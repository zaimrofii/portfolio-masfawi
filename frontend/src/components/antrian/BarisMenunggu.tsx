import type { Pesanan } from '@/api/types';
import { Badge, Button, Table } from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { formatTanggal, labelSisaHari, sisaHari } from '@/lib/format';

interface Props {
  pesananList: Pesanan[];
  onLihat: (id: number) => void;
}

function jumlahPcs(pesanan: Pesanan): number {
  return pesanan.items.reduce(
    (total, item) =>
      total + item.varian.reduce((subtotal, varian) => subtotal + varian.jumlah, 0),
    0,
  );
}

export function BarisMenunggu({ pesananList, onLihat }: Props) {
  if (pesananList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Tidak ada pesanan menunggu.</p>
    );
  }

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
      key: 'deadline',
      header: 'Deadline',
      render: (pesanan) => {
        const sisa = labelSisaHari(sisaHari(pesanan.deadline));
        return (
          <span className="flex flex-wrap items-center gap-2">
            {formatTanggal(pesanan.deadline)}
            <Badge warna={sisa.warna}>{sisa.label}</Badge>
          </span>
        );
      },
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
            onLihat(pesanan.id);
          }}
        >
          Lihat
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={kolom}
      data={pesananList}
      getKey={(pesanan) => String(pesanan.id)}
      onRowClick={(pesanan) => onLihat(pesanan.id)}
    />
  );
}