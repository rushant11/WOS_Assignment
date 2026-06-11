import apiClient from '../../../api/axiosInstance';
import { ApiResponse } from '../../../types/api';
import { Location } from '../../../types/location';

export async function fetchLocations(page: number): Promise<ApiResponse<Location>> {
  const response = await apiClient.get<ApiResponse<Location>>('/location', {
    params: { page },
  });
  return response.data;
}

export function extractResidentIds(urls: string[]): number[] {
  return urls
    .map(url => {
      const parts = url.split('/');
      const id = parseInt(parts[parts.length - 1], 10);
      return isNaN(id) ? null : id;
    })
    .filter((id): id is number => id !== null);
}
