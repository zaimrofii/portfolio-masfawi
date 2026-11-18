import { useMutation, useQueryClient } from '@tanstack/react-query';

import { catatKendala } from '@/api/pesanan';
import type { KendalaCreate } from '@/api/types';

export interface CatatKendalaVariables {
  id: number;
  payload: KendalaCreate;
}

export function useCatatKendala() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: CatatKendalaVariables) =>
      catatKendala(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pesanan'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}