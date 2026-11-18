import { useMutation, useQueryClient } from '@tanstack/react-query';

import { update } from '@/api/pesanan';
import type { PesananCreate } from '@/api/types';

export interface UpdatePesananVariables {
  id: number;
  payload: Partial<PesananCreate>;
}

export function useUpdatePesanan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdatePesananVariables) => update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['pesanan'] });
      void queryClient.invalidateQueries({
        queryKey: ['pesanan', 'detail', variables.id],
      });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['antrian'] });
    },
  });
}