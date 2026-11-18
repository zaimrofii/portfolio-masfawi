import { useQuery } from '@tanstack/react-query';

import { get } from '@/api/dashboard';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: get,
  });
}