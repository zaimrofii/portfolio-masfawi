import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { create, list, update } from '@/api/kain';
import type { KainCreate } from '@/api/types';

export function useKainList() {
  return useQuery({
    queryKey: ['kain'],
    queryFn: list,
  });
}

function invalidasiKain(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['kain'] });
  void queryClient.invalidateQueries({ queryKey: ['pesanan'] });
}

export function useBuatKain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: KainCreate) => create(payload),
    onSuccess: () => invalidasiKain(queryClient),
  });
}

export function useUpdateKain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<KainCreate>;
    }) => update(id, payload),
    onSuccess: () => invalidasiKain(queryClient),
  });
}