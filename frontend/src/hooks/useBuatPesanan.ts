import { useMutation, useQueryClient } from '@tanstack/react-query';

import { create } from '@/api/pesanan';

export function useBuatPesanan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pesanan'] });
    },
  });
}