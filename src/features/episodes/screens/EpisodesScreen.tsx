import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Episode, EpisodeGroup } from '../../../types/episode';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';
import { useScrollHeader } from '../../../shared/hooks/useScrollHeader';
import { EpisodeRowSkeleton } from '../../../shared/components/SkeletonLoader';
import { ErrorScreen } from '../../../shared/components/ErrorScreen';
import { OfflineBanner } from '../../../shared/components/OfflineBanner';
import { useEpisodes, groupEpisodesBySeason } from '../hooks/useEpisodes';
import { EpisodeCard } from '../components/EpisodeCard';
import EpisodeDetailModal from './EpisodeDetailModal';

const HEADER_HEIGHT = ds(56);
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

const EpisodesScreen: React.FC = () => {
  const { onScroll, animatedHeaderStyle } = useScrollHeader(
    HEADER_HEIGHT + STATUSBAR_HEIGHT,
  );
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
      <ErrorScreen message={(error as Error).message} onRetry={() => void refetch()} />
    );
  }

  const totalHeight = HEADER_HEIGHT + STATUSBAR_HEIGHT;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} translucent />

      <Animated.View
        style={[
          styles.header,
          { height: totalHeight, paddingTop: STATUSBAR_HEIGHT },
          animatedHeaderStyle,
        ]}
      >
        <Text style={styles.headerTitle}>Episodes</Text>
      </Animated.View>

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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.background,
    paddingHorizontal: ds(20),
    paddingBottom: ds(10),
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
