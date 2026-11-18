import { useMutation, useQueryClient } from '@tanstack/react-query';

import { catatPembayaran } from '@/api/pesanan';
import type { PembayaranPayload } from '@/api/pesanan';

export interface CatatPembayaranVariables {
  id: number;
  payload: PembayaranPayload;
}

export function useCatatPembayaran() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: CatatPembayaranVariables) =>
      catatPembayaran(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['pesanan'] });
      void queryClient.invalidateQueries({
        queryKey: ['pesanan', 'detail', variables.id],
      });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}