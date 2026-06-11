import apiClient from '../../../api/axiosInstance';
import { ApiResponse } from '../../../types/api';
import { Character, CharacterFilters } from '../../../types/character';

export async function fetchCharacters(
  page: number,
  filters?: CharacterFilters,
): Promise<ApiResponse<Character>> {
  const params: Record<string, string | number> = { page };

  if (filters?.name) { params.name = filters.name; }
  if (filters?.status) { params.status = filters.status; }
  if (filters?.gender) { params.gender = filters.gender; }

  try {
    const response = await apiClient.get<ApiResponse<Character>>('/character', { params });
    return response.data;
  } catch (error) {
    if (error instanceof Error && error.message === 'Resource not found') {
      return {
        info: { count: 0, pages: 0, next: null, prev: null },
        results: [],
      };
    }
    throw error;
  }
}

export async function fetchCharacterById(id: number): Promise<Character> {
  const response = await apiClient.get<Character>(`/character/${id}`);
  return response.data;
}

export async function fetchCharactersByIds(ids: number[]): Promise<Character[]> {
  if (ids.length === 0) { return []; }
  if (ids.length === 1) {
    const char = await fetchCharacterById(ids[0]);
    return [char];
  }
  const response = await apiClient.get<Character[]>(`/character/${ids.join(',')}`);
  return response.data;
}
