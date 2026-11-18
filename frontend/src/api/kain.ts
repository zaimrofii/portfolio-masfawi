import api from './client';
import type { BahanKain, KainCreate } from './types';

export async function list(): Promise<BahanKain[]> {
  const { data } = await api.get<BahanKain[]>('/kain/');
  return data;
}

export async function create(payload: KainCreate): Promise<BahanKain> {
  const { data } = await api.post<BahanKain>('/kain/', payload);
  return data;
}

export async function update(
  id: number,
  payload: Partial<KainCreate>,
): Promise<BahanKain> {
  const { data } = await api.put<BahanKain>(`/kain/${id}/`, payload);
  return data;
}