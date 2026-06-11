import { useQuery } from '@tanstack/react-query';
import { fetchCharacterById } from '../services/characterService';
import { Character } from '../../../types/character';

export function useCharacterDetail(id: number) {
  return useQuery<Character, Error>({
    queryKey: ['characterDetail', id],
    queryFn: () => fetchCharacterById(id),
    enabled: id > 0,
    staleTime: 1000 * 60 * 10,
  });
}
