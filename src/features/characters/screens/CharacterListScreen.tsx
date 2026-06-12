import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Character, CharacterFilters } from '../../../types/character';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { useScrollHeader } from '../../../shared/hooks/useScrollHeader';
import { useScreenHeaderInsets } from '../../../shared/hooks/useScreenHeaderInsets';
import { CharacterCardSkeleton } from '../../../shared/components/SkeletonLoader';
import { ErrorScreen } from '../../../shared/components/ErrorScreen';
import { EmptyState } from '../../../shared/components/EmptyState';
import { OfflineBanner } from '../../../shared/components/OfflineBanner';
import { ScreenHeaderShell } from '../../../shared/components/ScreenHeaderShell';
import { useCharacters } from '../hooks/useCharacters';
import { CharacterCard } from '../components/CharacterCard';
import { FilterModal } from '../components/FilterModal';
import { useAppSelector } from '../../../store';
import { CharactersStackParamList } from '../../../navigation/types';

type NavProp = NativeStackNavigationProp<CharactersStackParamList, 'CharacterList'>;

const CharacterListScreen: React.FC = () => {
  const { headerHeight, totalHeight } = useScreenHeaderInsets(ds(72));
  const navigation = useNavigation<NavProp>();
  const favouriteIds = useAppSelector(s => s.favourites.items.map(c => c.id));
  const hasLoadedOnce = useRef(false);

  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<CharacterFilters>({});
  const [filterVisible, setFilterVisible] = useState(false);

  const debouncedSearch = useDebounce(searchText, 300);

  const activeFilters = useMemo<CharacterFilters>(
    () => ({ ...filters, name: debouncedSearch || undefined }),
    [filters, debouncedSearch],
  );

  const hasSearchOrFilters = !!(debouncedSearch || filters.status || filters.gender);

  const { onScroll, onScrollEnd, resetScroll, animatedHeaderStyle } =
    useScrollHeader(headerHeight);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isRefetching,
  } = useCharacters(activeFilters);

  if (data) {
    hasLoadedOnce.current = true;
  }

  const characters = useMemo(
    () => data?.pages.flatMap(p => p.results ?? []) ?? [],
    [data],
  );

  const hasActiveFilters = !!(filters.status || filters.gender);
  const showInitialSkeleton = isLoading && !hasLoadedOnce.current;
  const isDebouncing = searchText !== debouncedSearch;
  const isSearchFetching = isFetching && !isFetchingNextPage && hasLoadedOnce.current;
  const isSearchInProgress = isDebouncing || isSearchFetching;
  const isHeaderFixed =
    hasSearchOrFilters || isDebouncing || isError || characters.length === 0;
  const isHeaderAnimated = !isHeaderFixed && !isRefetching;

  useEffect(() => {
    if (Platform.OS === 'ios' && !isRefetching) {
      resetScroll();
    }
  }, [isRefetching, resetScroll]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    resetScroll();
    void refetch();
  }, [refetch, resetScroll]);

  const handleCardPress = useCallback(
    (character: Character) => {
      navigation.navigate('CharacterDetail', {
        id: character.id,
        name: character.name,
        character,
      });
    },
    [navigation],
  );

  const showOfflineBanner = isError && characters.length > 0;

  const renderItem = useCallback(
    ({ item }: { item: Character }) => (
      <CharacterCard
        character={item}
        onPress={handleCardPress}
        isFavourite={favouriteIds.includes(item.id)}
      />
    ),
    [handleCardPress, favouriteIds],
  );

  const renderFooter = useCallback(
    () =>
      isFetchingNextPage ? (
        <ActivityIndicator
          color={COLORS.primary}
          size="small"
          style={styles.footerLoader}
        />
      ) : null,
    [isFetchingNextPage],
  );

  const renderListHeader = useCallback(
    () => (
      <>
        {showOfflineBanner && <OfflineBanner />}
        {isSearchFetching && characters.length > 0 ? (
          <View style={styles.searchingBar}>
            <ActivityIndicator color={COLORS.primary} size="small" />
            <Text style={styles.searchingText}>Searching...</Text>
          </View>
        ) : null}
      </>
    ),
    [showOfflineBanner, isSearchFetching, characters.length],
  );

  const renderEmpty = useCallback(() => {
    if (isSearchInProgress) {
      return (
        <View style={styles.emptyLoading}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.searchingText}>
            {isDebouncing ? 'Waiting...' : 'Searching...'}
          </Text>
        </View>
      );
    }

    return (
      <EmptyState
        title="No characters found"
        subtitle={
          debouncedSearch
            ? `No results for "${debouncedSearch}".\nTry a different name or adjust filters.`
            : hasActiveFilters
              ? 'No characters match your filters.\nTry changing or resetting them.'
              : 'No characters available right now.'
        }
      />
    );
  }, [isSearchInProgress, isDebouncing, debouncedSearch, hasActiveFilters]);

  const renderListContent = () => {
    if (showInitialSkeleton) {
      return (
        <View style={[styles.listContent, { paddingTop: totalHeight }]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <CharacterCardSkeleton key={i} />
          ))}
        </View>
      );
    }

    if (isError && characters.length === 0) {
      return (
        <View style={[styles.inlineError, { paddingTop: totalHeight }]}>
          <ErrorScreen
            message={(error as Error).message}
            onRetry={() => void refetch()}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={characters}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          characters.length === 0 ? styles.listContentEmpty : null,
          {
            paddingTop: characters.length === 0 ? totalHeight : totalHeight + ds(6),
          },
        ]}
        onScroll={isHeaderAnimated ? onScroll : undefined}
        onScrollEndDrag={isHeaderAnimated ? onScrollEnd : undefined}
        onMomentumScrollEnd={isHeaderAnimated ? onScrollEnd : undefined}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.card}
            progressViewOffset={Platform.OS === 'android' ? totalHeight : 0}
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeaderShell
        headerHeight={headerHeight}
        animatedStyle={isHeaderAnimated ? animatedHeaderStyle : undefined}
      >
        <View style={styles.headerInner}>
          <View style={styles.searchContainer}>
            <Search size={ds(16)} color={COLORS.textMuted} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search characters..."
              placeholderTextColor={COLORS.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <X size={ds(14)} color={COLORS.textMuted} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
            onPress={() => setFilterVisible(true)}
          >
            <SlidersHorizontal
              size={ds(18)}
              color={hasActiveFilters ? COLORS.primary : COLORS.textSecondary}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </ScreenHeaderShell>

      {renderListContent()}

      <FilterModal
        visible={filterVisible}
        currentFilters={filters}
        onApply={f => setFilters({ status: f.status, gender: f.gender })}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ds(16),
    paddingVertical: ds(10),
    gap: ds(10),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: ds(10),
    paddingHorizontal: ds(12),
    paddingVertical: ds(9),
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: ds(8),
  },
  searchInput: {
    flex: 1,
    fontSize: fs(14),
    color: COLORS.text,
    padding: 0,
    margin: 0,
  },
  filterBtn: {
    width: ds(42),
    height: ds(42),
    borderRadius: ds(10),
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnActive: {
    borderColor: COLORS.primaryBorder,
    backgroundColor: COLORS.primaryDim,
  },
  listContent: {
    paddingBottom: ds(20),
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: ds(72),
  },
  inlineError: {
    flex: 1,
  },
  searchingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ds(8),
    paddingVertical: ds(10),
  },
  searchingText: {
    fontSize: fs(13),
    color: COLORS.textSecondary,
  },
  emptyLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ds(48),
    gap: ds(12),
  },
  footerLoader: {
    paddingVertical: ds(16),
  },
});

export default CharacterListScreen;
