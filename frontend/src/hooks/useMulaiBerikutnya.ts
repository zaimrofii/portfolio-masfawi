import { useMutation, useQueryClient } from '@tanstack/react-query';

import { mulaiBerikutnyaViaServer } from '@/api/antrian';

export function useMulaiBerikutnya() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mulaiBerikutnyaViaServer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pesanan'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['antrian'] });
    },
  });
}