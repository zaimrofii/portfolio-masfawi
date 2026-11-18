import { Plus } from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import type { Pesanan, StatusPesanan } from "@/api/types";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Select,
  Table,
} from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import { usePesananList } from "@/hooks/usePesananList";
import {
  formatRupiah,
  formatTanggal,
  labelSisaHari,
  sisaHari,
} from "@/lib/format";
import { STATUS_MAP } from "@/lib/status";

const URUTAN_STATUS: StatusPesanan[] = [
  "DRAFT",
  "SPK_DIKIRIM",
  "REVISI",
  "DISETUJUI",
  "PRODUKSI",
  "SELESAI",
  "DIAMBIL",
  "BATAL",
];

const OPSI_STATUS = [
  { value: "SEMUA", label: "Semua status" },
  ...URUTAN_STATUS.map((status) => ({
    value: status,
    label: STATUS_MAP[status].label,
  })),
];

function jumlahPcs(pesanan: Pesanan): number {
  return pesanan.items.reduce(
    (total, item) =>
      total +
      item.varian.reduce((subtotal, varian) => subtotal + varian.jumlah, 0),
    0,
  );
}

export function DaftarPesanan() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusPesanan | "SEMUA">("SEMUA");
  const [q, setQ] = useState("");
  const [qDebounce, setQDebounce] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQDebounce(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);

  const { data, isLoading, isError, refetch } = usePesananList({
    status,
    q: qDebounce || undefined,
  });

  const daftar = [...(data ?? [])].sort((a, b) =>
    a.deadline.localeCompare(b.deadline),
  );

  const kolom: TableColumn<Pesanan>[] = [
    {
      key: "nomor",
      header: "No. Pesanan",
      className: "font-semibold",
      render: (pesanan) => pesanan.nomor,
    },
    {
      key: "customer",
      header: "Customer",
      render: (pesanan) => pesanan.customer.nama,
    },
    {
      key: "item",
      header: "Item",
      render: (pesanan) =>
        `${pesanan.items.length} item · ${jumlahPcs(pesanan)} pcs`,
    },
    {
      key: "total",
      header: "Total",
      render: (pesanan) => formatRupiah(pesanan.total_harga),
    },
    {
      key: "deadline",
      header: "Deadline",
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
      key: "status",
      header: "Status",
      render: (pesanan) => (
        <Badge warna={STATUS_MAP[pesanan.status].warna}>
          {STATUS_MAP[pesanan.status].label}
        </Badge>
      ),
    },
    {
      key: "aksi",
      header: "",
      className: "text-right",
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
        <h1 className="text-2xl xl:text-3xl font-bold">Daftar Pesanan</h1>

        <Button onClick={() => navigate("/pesanan/baru")}>
          <Plus size={16} className="shrink-0" aria-hidden="true" />
          Pesanan Baru
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[240px_1fr]">
        <Select
          label="Status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as StatusPesanan | "SEMUA")
          }
          options={OPSI_STATUS}
        />

        <Input
          label="Cari"
          placeholder="Cari no/nama customer…"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="text-sm xl:text-base text-muted-foreground">Memuat…</p>
      ) : null}

      {isError ? (
        <EmptyState
          judul="Gagal memuat pesanan"
          deskripsi="Periksa kembali koneksi ke server lalu coba lagi."
          aksi={<Button onClick={() => void refetch()}>Coba lagi</Button>}
        />
      ) : null}

      {!isLoading && !isError && daftar.length === 0 ? (
        <EmptyState
          judul="Tidak ada pesanan"
          deskripsi="Coba ubah filter atau buat pesanan baru."
          aksi={
            <Button onClick={() => navigate("/pesanan/baru")}>
              Pesanan Baru
            </Button>
          }
        />
      ) : null}

      {daftar.length > 0 ? (
        <Table
          columns={kolom}
          data={daftar}
          getKey={(pesanan) => String(pesanan.id)}
          onRowClick={(pesanan) => navigate(`/pesanan/${pesanan.id}`)}
        />
      ) : null}
    </div>
  );
}
