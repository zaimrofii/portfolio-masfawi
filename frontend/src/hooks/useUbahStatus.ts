import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ubahStatus } from '@/api/pesanan';
import type { StatusPesanan } from '@/api/types';

export interface UbahStatusVariables {
  id: number;
  status: StatusPesanan;
  keterangan?: string;
}

export function useUbahStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, keterangan }: UbahStatusVariables) =>
      ubahStatus(id, status, keterangan),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pesanan'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['antrian'] });
    },
  });
}