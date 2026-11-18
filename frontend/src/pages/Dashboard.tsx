import { AlarmClock, TriangleAlert } from "lucide-react";

import { Link } from "react-router-dom";

import type { Kendala, Pesanan } from "@/api/types";
import { Badge, Button, Card, EmptyState, Table } from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import { useDashboard } from "@/hooks/useDashboard";
import { formatTanggal, labelSisaHari, sisaHari } from "@/lib/format";

interface KartuStatProps {
  label: string;
  nilai: number;
  subteks?: string;
  to: string;
}

function KartuStat({ label, nilai, subteks, to }: KartuStatProps) {
  return (
    <Link
      to={to}
      className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition hover:shadow-pill">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-4xl font-bold text-foreground">{nilai}</p>
        {subteks ? (
          <p className="mt-1 text-sm text-muted-foreground">{subteks}</p>
        ) : null}
      </Card>
    </Link>
  );
}

const KOLOM_DEADLINE: TableColumn<Pesanan>[] = [
  { key: "nomor", header: "Nomor" },
  { key: "customer", header: "Customer", render: (p) => p.customer.nama },
  {
    key: "deadline",
    header: "Deadline",
    render: (p) => formatTanggal(p.deadline),
  },
  {
    key: "sisa",
    header: "Sisa",
    render: (p) => {
      const sisa = labelSisaHari(sisaHari(p.deadline));
      return <Badge warna={sisa.warna}>{sisa.label}</Badge>;
    },
  },
  {
    key: "aksi",
    header: "",
    className: "text-right",
    render: (p) => (
      <Link
        to={`/pesanan/${p.id}`}
        className="text-accent-blue underline-offset-4 hover:underline"
      >
        Lihat
      </Link>
    ),
  },
];

const KOLOM_KENDALA: TableColumn<Kendala>[] = [
  {
    key: "pesanan_nomor",
    header: "Pesanan",
    render: (k) => k.pesanan_nomor ?? `#${k.pesanan_id}`,
  },
  { key: "jenis", header: "Jenis" },
  { key: "catatan", header: "Catatan" },
  {
    key: "estimasi",
    header: "Estimasi",
    render: (k) => `mundur ${k.estimasi_mundur_hari} hari`,
  },
];

export function Dashboard() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <p className="text-sm xl:text-base text-muted-foreground">Memuat…</p>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        judul="Gagal memuat dashboard"
        deskripsi="Periksa kembali koneksi ke server lalu coba lagi."
        aksi={<Button onClick={() => void refetch()}>Coba lagi</Button>}
      />
    );
  }

  const deadlineMepet = data.deadline_dekat.filter(
    (p) => sisaHari(p.deadline) <= 3,
  ).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KartuStat
          label="Pesanan Aktif"
          nilai={data.aktif}
          subteks="Draft sampai produksi"
          to="/pesanan"
        />
        <KartuStat
          label="Sedang Produksi"
          nilai={data.produksi}
          subteks="Dikerjakan sekarang"
          to="/antrian"
        />
        <KartuStat
          label="Menunggu Antrian"
          nilai={data.menunggu}
          subteks="Sudah disetujui"
          to="/antrian"
        />
        <KartuStat
          label="Deadline ≤3 hari"
          nilai={deadlineMepet}
          subteks="Dari deadline terdekat"
          to="/pesanan"
        />
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg xl:text-xl font-semibold text-foreground">
          <AlarmClock
            size={20}
            className="shrink-0 text-danger"
            aria-hidden="true"
          />
          Deadline Terdekat
        </h2>
        {data.deadline_dekat.length === 0 ? (
          <EmptyState
            judul="Tidak ada deadline terdekat"
            deskripsi="Semua pesanan masih punya waktu longgar."
          />
        ) : (
          <Table
            columns={KOLOM_DEADLINE}
            data={data.deadline_dekat}
            getKey={(p) => String(p.id)}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg xl:text-xl font-semibold text-foreground">
          <TriangleAlert
            size={20}
            className="shrink-0 text-warning"
            aria-hidden="true"
          />
          Kendala Aktif
        </h2>
        {data.kendala.length === 0 ? (
          <EmptyState
            judul="Tidak ada kendala"
            deskripsi="Produksi berjalan lancar."
          />
        ) : (
          <Table
            columns={KOLOM_KENDALA}
            data={data.kendala}
            getKey={(k) => String(k.id)}
          />
        )}
      </section>
    </div>
  );
}
