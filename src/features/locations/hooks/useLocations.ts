import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchLocations } from '../services/locationService';
import { ApiResponse } from '../../../types/api';
import { Location } from '../../../types/location';

export function useLocations() {
  return useInfiniteQuery<ApiResponse<Location>, Error>({
    queryKey: ['locations'],
    queryFn: ({ pageParam }) =>
      fetchLocations(typeof pageParam === 'number' ? pageParam : 1),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.info.next) { return allPages.length + 1; }
      return undefined;
    },
    staleTime: 1000 * 60 * 10,
  });
}
