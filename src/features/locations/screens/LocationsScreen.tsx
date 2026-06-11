import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Location } from '../../../types/location';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';
import { useScrollHeader } from '../../../shared/hooks/useScrollHeader';
import { LocationRowSkeleton } from '../../../shared/components/SkeletonLoader';
import { ErrorScreen } from '../../../shared/components/ErrorScreen';
import { OfflineBanner } from '../../../shared/components/OfflineBanner';
import { useLocations } from '../hooks/useLocations';
import { LocationCard } from '../components/LocationCard';
import LocationDetailModal from './LocationDetailModal';

const HEADER_HEIGHT = ds(56);
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

const LocationsScreen: React.FC = () => {
  const { onScroll, animatedHeaderStyle } = useScrollHeader(
    HEADER_HEIGHT + STATUSBAR_HEIGHT,
  );
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
        <Text style={styles.headerTitle}>Locations</Text>
      </Animated.View>

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
  skeletonList: {
    flex: 1,
  },
  loader: {
    paddingVertical: ds(16),
  },
});

export default LocationsScreen;
