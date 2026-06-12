import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Episode, EpisodeGroup } from '../../../types/episode';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';
import { useScrollHeader } from '../../../shared/hooks/useScrollHeader';
import { useScreenHeaderInsets } from '../../../shared/hooks/useScreenHeaderInsets';
import { EpisodeRowSkeleton } from '../../../shared/components/SkeletonLoader';
import { ErrorScreen } from '../../../shared/components/ErrorScreen';
import { OfflineBanner } from '../../../shared/components/OfflineBanner';
import { ScreenHeaderShell } from '../../../shared/components/ScreenHeaderShell';
import { useEpisodes, groupEpisodesBySeason } from '../hooks/useEpisodes';
import { EpisodeCard } from '../components/EpisodeCard';
import EpisodeDetailModal from './EpisodeDetailModal';

const EpisodesScreen: React.FC = () => {
  const { topInset, headerHeight, totalHeight } = useScreenHeaderInsets(ds(56));
  const { onScroll, onScrollEnd, animatedHeaderStyle } = useScrollHeader(headerHeight);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useEpisodes();

  React.useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allEpisodes = useMemo(
    () => data?.pages.flatMap(p => p.results) ?? [],
    [data],
  );

  const sections = useMemo(
    () =>
      groupEpisodesBySeason(allEpisodes).map((g: EpisodeGroup) => ({
        title: `Season ${g.season}`,
        data: g.episodes,
      })),
    [allEpisodes],
  );

  const renderItem = useCallback(
    ({ item }: { item: Episode }) => (
      <EpisodeCard episode={item} onPress={setSelectedEpisode} />
    ),
    [],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: Episode[] } }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.sectionCountBadge}>
          <Text style={styles.sectionCount}>{section.data.length} eps</Text>
        </View>
      </View>
    ),
    [],
  );

  const showOfflineBanner = isError && allEpisodes.length > 0;
  const showFullError = isError && allEpisodes.length === 0 && !isLoading;

  if (showFullError) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <ErrorScreen message={(error as Error).message} onRetry={() => void refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeaderShell headerHeight={headerHeight} animatedStyle={animatedHeaderStyle}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Episodes</Text>
        </View>
      </ScreenHeaderShell>

      {isLoading ? (
        <View style={[styles.skeletonList, { paddingTop: totalHeight }]}>
          {Array.from({ length: 8 }).map((_, i) => <EpisodeRowSkeleton key={i} />)}
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          onScroll={onScroll}
          onScrollEndDrag={onScrollEnd}
          onMomentumScrollEnd={onScrollEnd}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
          contentContainerStyle={{
            paddingTop: totalHeight,
            paddingBottom: ds(24),
          }}
          ListHeaderComponent={showOfflineBanner ? <OfflineBanner /> : null}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={COLORS.primary} style={styles.loader} />
            ) : null
          }
        />
      )}

      {selectedEpisode && (
        <EpisodeDetailModal
          episode={selectedEpisode}
          onClose={() => setSelectedEpisode(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: ds(20),
    paddingBottom: ds(10),
  },
  headerTitle: {
    fontSize: fs(20),
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ds(16),
    paddingVertical: ds(8),
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderLeftWidth: ds(3),
    borderLeftColor: COLORS.accent,
  },
  sectionTitle: {
    fontSize: fs(13),
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  sectionCountBadge: {
    backgroundColor: COLORS.accentDim,
    borderRadius: ds(6),
    paddingHorizontal: ds(8),
    paddingVertical: ds(2),
  },
  sectionCount: {
    fontSize: fs(11),
    color: COLORS.accent,
    fontWeight: '600',
  },
  skeletonList: {
    flex: 1,
  },
  loader: {
    paddingVertical: ds(16),
  },
});

export default EpisodesScreen;
