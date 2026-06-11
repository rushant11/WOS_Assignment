import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchCharacters } from '../services/characterService';
import { CharacterFilters } from '../../../types/character';
import { ApiResponse } from '../../../types/api';
import { Character } from '../../../types/character';

export function useCharacters(filters: CharacterFilters) {
  const name = filters.name ?? '';
  const status = filters.status ?? '';
  const gender = filters.gender ?? '';

  return useInfiniteQuery<ApiResponse<Character>, Error>({
    queryKey: ['characters', name, status, gender],
    queryFn: ({ pageParam }) =>
      fetchCharacters(typeof pageParam === 'number' ? pageParam : 1, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.info.next) {
        return allPages.length + 1;
      }
      return undefined;
    },
    retry: (failureCount, error) => {
      if (error.message === 'Resource not found') {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5,
  });
}
