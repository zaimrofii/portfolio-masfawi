import { useQuery } from '@tanstack/react-query';

import { get } from '@/api/pesanan';

export function usePesananDetail(id: number | null | undefined) {
  return useQuery({
    queryKey: ['pesanan', 'detail', id],
    queryFn: () => get(id as number),
    enabled: Boolean(id),
  });
}