import api, { apiBaseUrl } from './client';
import type {
  Kendala,
  KendalaCreate,
  MetodeBayar,
  Pesanan,
  PesananCreate,
  StatusPesanan,
} from './types';

export interface PesananFilter {
  status?: StatusPesanan | 'SEMUA';
  q?: string;
}

export async function list(filter: PesananFilter = {}): Promise<Pesanan[]> {
  const params: Record<string, string> = {};
  if (filter.status && filter.status !== 'SEMUA') params.status = filter.status;
  if (filter.q) params.q = filter.q;
  const { data } = await api.get<Pesanan[]>('/pesanan/', { params });
  return data;
}

export async function get(id: number): Promise<Pesanan> {
  const { data } = await api.get<Pesanan>(`/pesanan/${id}/`);
  return data;
}

export async function create(payload: PesananCreate): Promise<Pesanan> {
  const { data } = await api.post<Pesanan>('/pesanan/', payload);
  return data;
}

export async function update(
  id: number,
  payload: Partial<PesananCreate>,
): Promise<Pesanan> {
  const { data } = await api.put<Pesanan>(`/pesanan/${id}/`, payload);
  return data;
}

export async function ubahStatus(
  id: number,
  status: StatusPesanan,
  keterangan = '',
): Promise<Pesanan> {
  const { data } = await api.patch<Pesanan>(`/pesanan/${id}/status/`, {
    status,
    keterangan,
  });
  return data;
}

export interface PembayaranPayload {
  nominal: number;
  metode?: MetodeBayar;
  catatan?: string;
  lunas?: boolean;
}

/** PATCH /pesanan/:id/bayar/ — catat pembayaran (parsial / lunas). */
export async function catatPembayaran(
  id: number,
  payload: PembayaranPayload,
): Promise<Pesanan> {
  const { data } = await api.patch<Pesanan>(`/pesanan/${id}/bayar/`, payload);
  return data;
}

export async function catatKendala(
  id: number,
  payload: KendalaCreate,
): Promise<Kendala> {
  const { data } = await api.post<Kendala>(`/pesanan/${id}/kendala/`, payload);
  return data;
}

/** URL cetak PDF (Fase 1: backend belum ada, handler MSW mengembalikan 404). */
export function exportUrl(id: number, jenis: 'spk' | 'invoice'): string {
  return `${apiBaseUrl}/pesanan/${id}/${jenis}.pdf`;
}

/** Ambil PDF sebagai Blob (sementara mock masih 404). */
export async function exportPdf(
  id: number,
  jenis: 'spk' | 'invoice',
): Promise<Blob> {
  const { data } = await api.get<Blob>(`/pesanan/${id}/${jenis}.pdf`, {
    responseType: 'blob',
  });
  return data;
}