import api from './client';
import type { DashboardData } from './types';

export async function get(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>('/dashboard/');
  return data;
}