import apiClient from '../../../api/axiosInstance';
import { ApiResponse } from '../../../types/api';
import { Episode } from '../../../types/episode';

export async function fetchEpisodes(page: number): Promise<ApiResponse<Episode>> {
  const response = await apiClient.get<ApiResponse<Episode>>('/episode', {
    params: { page },
  });
  return response.data;
}

export function extractCharacterIds(urls: string[]): number[] {
  return urls
    .map(url => {
      const parts = url.split('/');
      const id = parseInt(parts[parts.length - 1], 10);
      return isNaN(id) ? null : id;
    })
    .filter((id): id is number => id !== null);
}
