import React, { useCallback, useEffect } from 'react';
import {
  Animated,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Heart, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Character } from '../../../types/character';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';
import { useScrollHeader } from '../../../shared/hooks/useScrollHeader';
import { EmptyState } from '../../../shared/components/EmptyState';
import { FadeImage } from '../../../shared/components/ProgressiveImage';
import { StatusBadge } from '../../characters/components/StatusBadge';
import { useAppDispatch, useAppSelector } from '../../../store';
import { loadFavourites, removeFavourite } from '../store/favouritesSlice';
import { FavouritesStackParamList } from '../../../navigation/types';

const HEADER_HEIGHT = ds(56);
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

type NavProp = NativeStackNavigationProp<FavouritesStackParamList, 'FavouritesList'>;

const FavouritesScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const { items: favourites, isLoading } = useAppSelector(s => s.favourites);
  const { onScroll, animatedHeaderStyle } = useScrollHeader(
    HEADER_HEIGHT + STATUSBAR_HEIGHT,
  );

  useEffect(() => {
    void dispatch(loadFavourites());
  }, [dispatch]);

  const handleRemove = useCallback(
    (id: number) => {
      void dispatch(removeFavourite(id));
    },
    [dispatch],
  );

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

  const renderItem = useCallback(
    ({ item }: { item: Character }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.8}
      >
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemove(item.id)}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <X size={ds(11)} color={COLORS.text} strokeWidth={2.5} />
        </TouchableOpacity>

        <FadeImage
          uri={item.image}
          style={styles.avatar}
          borderRadius={0}
          fallbackLabel={item.name}
        />

        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
          <StatusBadge status={item.status} />
          <Text style={styles.cardSpecies} numberOfLines={1}>{item.species}</Text>
        </View>
      </TouchableOpacity>
    ),
    [handleCardPress, handleRemove],
  );

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
        <View style={styles.headerInner}>
          <Text style={styles.headerTitle}>Favourites</Text>
          {favourites.length > 0 && (
            <View style={styles.countBadge}>
              <Heart size={ds(10)} color={COLORS.dead} fill={COLORS.dead} strokeWidth={0} />
              <Text style={styles.countText}>{favourites.length}</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {favourites.length === 0 && !isLoading ? (
        <View style={[styles.emptyWrapper, { paddingTop: totalHeight }]}>
          <EmptyState
            icon="❤️"
            title="No favourites yet"
            subtitle="Tap the heart on any character to save them here. Works offline!"
          />
        </View>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.gridContent,
            { paddingTop: totalHeight + ds(8) },
          ]}
          columnWrapperStyle={styles.columnWrapper}
          removeClippedSubviews
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
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds(10),
  },
  headerTitle: {
    fontSize: fs(20),
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds(4),
    backgroundColor: COLORS.deadBg,
    borderRadius: ds(20),
    paddingHorizontal: ds(8),
    paddingVertical: ds(3),
    borderWidth: 1,
    borderColor: COLORS.deadBorder,
  },
  countText: {
    fontSize: fs(12),
    color: COLORS.dead,
    fontWeight: '700',
  },
  emptyWrapper: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: ds(12),
    paddingBottom: ds(24),
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    backgroundColor: COLORS.card,
    borderRadius: ds(14),
    marginBottom: ds(10),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeBtn: {
    position: 'absolute',
    top: ds(8),
    right: ds(8),
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: ds(10),
    width: ds(24),
    height: ds(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: ds(130),
  },
  cardInfo: {
    padding: ds(10),
    gap: ds(4),
  },
  cardName: {
    fontSize: fs(13),
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.1,
  },
  cardSpecies: {
    fontSize: fs(11),
    color: COLORS.textSecondary,
  },
});

export default FavouritesScreen;
