import api from './client';
import type { AntrianData, Pesanan } from './types';

export async function get(): Promise<AntrianData> {
  const { data } = await api.get<AntrianData>('/antrian/');
  return data;
}

/**
 * POST /antrian/mulai-berikutnya/ — server/mock memilih pesanan DISETUJUI
 * dengan deadline terdekat lalu menaikkannya ke PRODUKSI.
 */
export async function mulaiBerikutnyaViaServer(): Promise<Pesanan> {
  const { data } = await api.post<Pesanan>('/antrian/mulai-berikutnya/');
  return data;
}