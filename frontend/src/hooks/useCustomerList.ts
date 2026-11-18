import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { create, list, update } from '@/api/customer';
import type { CustomerCreate } from '@/api/types';

export function useCustomerList(q?: string) {
  return useQuery({
    queryKey: ['customer', q ?? ''],
    queryFn: () => list(q),
  });
}

/** Mutasi customer baru dari wizard pesanan (Fase 4). */
export function useBuatCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomerCreate) => create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer'] });
    },
  });
}

/** Mutasi edit customer (Master Customer, Fase 7). */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<CustomerCreate>;
    }) => update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer'] });
      void queryClient.invalidateQueries({ queryKey: ['pesanan'] });
    },
  });
}