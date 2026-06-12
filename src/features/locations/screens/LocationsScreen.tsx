import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Location } from '../../../types/location';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';
import { useScrollHeader } from '../../../shared/hooks/useScrollHeader';
import { useScreenHeaderInsets } from '../../../shared/hooks/useScreenHeaderInsets';
import { LocationRowSkeleton } from '../../../shared/components/SkeletonLoader';
import { ErrorScreen } from '../../../shared/components/ErrorScreen';
import { OfflineBanner } from '../../../shared/components/OfflineBanner';
import { ScreenHeaderShell } from '../../../shared/components/ScreenHeaderShell';
import { useLocations } from '../hooks/useLocations';
import { LocationCard } from '../components/LocationCard';
import LocationDetailModal from './LocationDetailModal';

const LocationsScreen: React.FC = () => {
  const { topInset, headerHeight, totalHeight } = useScreenHeaderInsets(ds(56));
  const { onScroll, onScrollEnd, animatedHeaderStyle } = useScrollHeader(headerHeight);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useLocations();

  const locations = useMemo(
    () => data?.pages.flatMap(p => p.results) ?? [],
    [data],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Location }) => (
      <LocationCard location={item} onPress={setSelectedLocation} />
    ),
    [],
  );

  const renderFooter = useCallback(
    () =>
      isFetchingNextPage ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : null,
    [isFetchingNextPage],
  );

  const showOfflineBanner = isError && locations.length > 0;
  const showFullError = isError && locations.length === 0 && !isLoading;

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
          <Text style={styles.headerTitle}>Locations</Text>
        </View>
      </ScreenHeaderShell>

      {isLoading ? (
        <View style={[styles.skeletonList, { paddingTop: totalHeight }]}>
          {Array.from({ length: 8 }).map((_, i) => <LocationRowSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          ListHeaderComponent={showOfflineBanner ? <OfflineBanner /> : null}
          onScroll={onScroll}
          onScrollEndDrag={onScrollEnd}
          onMomentumScrollEnd={onScrollEnd}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: totalHeight + ds(6),
            paddingBottom: ds(24),
          }}
          removeClippedSubviews
        />
      )}

      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
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
  skeletonList: {
    flex: 1,
  },
  loader: {
    paddingVertical: ds(16),
  },
});

export default LocationsScreen;
