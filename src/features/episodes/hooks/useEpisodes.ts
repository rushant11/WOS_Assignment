import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchEpisodes } from '../services/episodeService';
import { ApiResponse } from '../../../types/api';
import { Episode, EpisodeGroup } from '../../../types/episode';

export function useEpisodes() {
  return useInfiniteQuery<ApiResponse<Episode>, Error>({
    queryKey: ['episodes'],
    queryFn: ({ pageParam }) =>
      fetchEpisodes(typeof pageParam === 'number' ? pageParam : 1),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.info.next) { return allPages.length + 1; }
      return undefined;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function groupEpisodesBySeason(episodes: Episode[]): EpisodeGroup[] {
  const map = new Map<number, Episode[]>();

  episodes.forEach(ep => {
    const match = /^S(\d{2})E\d{2}$/.exec(ep.episode);
    const season = match ? parseInt(match[1], 10) : 0;
    const existing = map.get(season);
    if (existing) {
      existing.push(ep);
    } else {
      map.set(season, [ep]);
    }
  });

  return Array.from(map.entries())
    .map(([season, eps]) => ({ season, episodes: eps }))
    .sort((a, b) => a.season - b.season);
}
