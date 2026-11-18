const RUPIAH = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRupiah(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return 'Rp 0';
  return RUPIAH.format(n);
}

export function formatTanggal(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTanggalWaktu(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  const jam = String(d.getHours()).padStart(2, '0');
  const menit = String(d.getMinutes()).padStart(2, '0');
  return `${formatTanggal(iso)} ${jam}:${menit}`;
}

export function sisaHari(deadline: string | null | undefined): number {
  if (!deadline) return 0;
  const target = new Date(deadline).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.ceil((target - Date.now()) / 86_400_000);
}

export interface LabelSisaHari {
  label: string;
  warna: 'danger' | 'warning' | 'muted';
}

export function labelSisaHari(n: number): LabelSisaHari {
  if (n <= 0) return { label: 'Lewat', warna: 'danger' };
  if (n <= 3) return { label: `${n} hari lagi`, warna: 'warning' };
  return { label: `${n} hari`, warna: 'muted' };
}