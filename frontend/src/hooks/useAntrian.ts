import { useQuery } from '@tanstack/react-query';

import { get } from '@/api/antrian';

export function useAntrian() {
  return useQuery({
    queryKey: ['antrian'],
    queryFn: get,
  });
}