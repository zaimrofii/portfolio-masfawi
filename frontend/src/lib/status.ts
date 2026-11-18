import type { StatusPesanan } from '@/api/types';

export type WarnaStatus =
  | 'muted'
  | 'info'
  | 'warning'
  | 'success'
  | 'danger'
  | 'accent-blue'
  | 'emerald';

export type AksiId =
  | 'export_spk'
  | 'kirim_spk'
  | 'edit'
  | 'batal'
  | 'revisi'
  | 'setujui'
  | 'mulai_produksi'
  | 'kendala'
  | 'selesai'
  | 'export_invoice'
  | 'diambil';

export interface StatusMeta {
  label: string;
  warna: WarnaStatus;
  aksi: AksiId[];
}

/** Cetak biru §4 — 8 status; kunci mengikuti StatusPesanan di api/types.ts. */
export const STATUS_MAP: Record<StatusPesanan, StatusMeta> = {
  DRAFT: {
    label: 'Draft',
    warna: 'muted',
    aksi: ['export_spk', 'kirim_spk', 'edit', 'batal'],
  },
  SPK_DIKIRIM: {
    label: 'SPK Dikirim',
    warna: 'info',
    aksi: ['revisi', 'setujui'],
  },
  REVISI: {
    label: 'Revisi',
    warna: 'warning',
    aksi: ['edit', 'export_spk', 'setujui'],
  },
  DISETUJUI: {
    label: 'Disetujui',
    warna: 'accent-blue',
    aksi: ['mulai_produksi'],
  },
  PRODUKSI: {
    label: 'Produksi',
    warna: 'warning',
    aksi: ['kendala', 'selesai'],
  },
  SELESAI: {
    label: 'Selesai',
    warna: 'success',
    aksi: ['export_invoice', 'diambil'],
  },
  DIAMBIL: { label: 'Diambil', warna: 'emerald', aksi: [] },
  BATAL: { label: 'Batal', warna: 'danger', aksi: [] },
};

const LABEL_AKSI: Record<AksiId, string> = {
  export_spk: 'Export SPK',
  kirim_spk: 'Kirim SPK',
  edit: 'Edit',
  batal: 'Batalkan',
  revisi: 'Revisi',
  setujui: 'Setujui',
  mulai_produksi: 'Mulai Produksi',
  kendala: 'Catat Kendala',
  selesai: 'Selesai Produksi',
  export_invoice: 'Export Invoice',
  diambil: 'Sudah Diambil',
};

export function labelAksi(id: AksiId): string {
  return LABEL_AKSI[id];
}

/** Kelas Tailwind murni dari token OKLCH (tanpa hex/oklch baru). */
export function warnaBadge(warna: WarnaStatus): string {
  switch (warna) {
    case 'danger':
      return 'bg-danger/10 text-danger border-danger/30';
    case 'warning':
      return 'bg-warning/15 text-warning-foreground border-warning/40';
    case 'success':
      return 'bg-success/15 text-success-foreground border-success/40';
    case 'info':
      return 'bg-info/15 text-info-foreground border-info/40';
    case 'accent-blue':
      return 'bg-accent-blue/15 text-accent-blue border-accent-blue/40';
    case 'emerald':
      return 'bg-success/10 text-success border-success/30';
    case 'muted':
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

/** Tabel transisi legal (dipakai UI; handler mock memakai aturan yang sama). */
const TRANSISI: Record<StatusPesanan, StatusPesanan[]> = {
  DRAFT: ['SPK_DIKIRIM', 'BATAL'],
  SPK_DIKIRIM: ['REVISI', 'DISETUJUI', 'BATAL'],
  REVISI: ['SPK_DIKIRIM', 'DISETUJUI', 'BATAL'],
  DISETUJUI: ['PRODUKSI', 'BATAL'],
  PRODUKSI: ['SELESAI'],
  SELESAI: ['DIAMBIL'],
  DIAMBIL: [],
  BATAL: [],
};

export function bolehTransisi(
  dari: StatusPesanan,
  ke: StatusPesanan,
): boolean {
  return TRANSISI[dari].includes(ke);
}