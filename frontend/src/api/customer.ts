import api from './client';
import type { Customer, CustomerCreate } from './types';

export async function list(q?: string): Promise<Customer[]> {
  const { data } = await api.get<Customer[]>('/customer/', {
    params: q ? { q } : undefined,
  });
  return data;
}

export async function get(id: number): Promise<Customer> {
  const { data } = await api.get<Customer>(`/customer/${id}/`);
  return data;
}

export async function create(payload: CustomerCreate): Promise<Customer> {
  const { data } = await api.post<Customer>('/customer/', payload);
  return data;
}

export async function update(
  id: number,
  payload: Partial<CustomerCreate>,
): Promise<Customer> {
  const { data } = await api.put<Customer>(`/customer/${id}/`, payload);
  return data;
}