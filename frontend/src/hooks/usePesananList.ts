import { useQuery } from '@tanstack/react-query';

import { list } from '@/api/pesanan';
import type { PesananFilter } from '@/api/pesanan';

export function usePesananList(filter: PesananFilter = {}) {
  return useQuery({
    queryKey: ['pesanan', filter],
    queryFn: () => list(filter),
  });
}