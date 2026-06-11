import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Heart,
  HeartOff,
  MapPin,
  Dna,
  Venus,
  Tv2,
  Star,
} from 'lucide-react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useCharacterDetail } from '../hooks/useCharacterDetail';
import { StatusBadge } from '../components/StatusBadge';
import { FadeImage } from '../../../shared/components/ProgressiveImage';
import { ErrorScreen } from '../../../shared/components/ErrorScreen';
import { OfflineBanner } from '../../../shared/components/OfflineBanner';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';
import { useAppDispatch, useAppSelector } from '../../../store';
import { addFavourite, removeFavourite } from '../../favourites/store/favouritesSlice';
import { CharactersStackParamList } from '../../../navigation/types';

type RouteType = RouteProp<CharactersStackParamList, 'CharacterDetail'>;

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabelRow}>
      {icon}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue} numberOfLines={2}>{value || 'N/A'}</Text>
  </View>
);

const CharacterDetailScreen: React.FC = () => {
  const route = useRoute<RouteType>();
  const { id, character: paramCharacter } = route.params;
  const dispatch = useAppDispatch();

  const favouriteCharacter = useAppSelector(s =>
    s.favourites.items.find(c => c.id === id),
  );
  const favouriteIds = useAppSelector(s => s.favourites.items.map(c => c.id));
  const loadingIds = useAppSelector(s => s.favourites.loadingIds);

  const { data, isLoading, isError, error, refetch } = useCharacterDetail(id);
  const character = data ?? paramCharacter ?? favouriteCharacter;

  const isFav = character ? favouriteIds.includes(character.id) : false;
  const isToggling = character ? loadingIds.includes(character.id) : false;
  const showOfflineBanner = !!character && !data && (isError || !!paramCharacter || !!favouriteCharacter);

  const episodeNumbers = useMemo(() => {
    if (!character) { return []; }
    return character.episode.map(url => {
      const parts = url.split('/');
      return parseInt(parts[parts.length - 1], 10);
    });
  }, [character]);

  const seasons = useMemo(() => {
    if (!character) { return []; }
    return Array.from(
      new Set(
        character.episode.map(url => {
          const epNum = parseInt(url.split('/').pop() ?? '0', 10);
          return Math.ceil(epNum / 10);
        }),
      ),
    ).sort((a, b) => a - b);
  }, [character]);

  const handleToggleFavourite = useCallback(() => {
    if (!character || isToggling) { return; }
    if (isFav) {
      void dispatch(removeFavourite(character.id));
    } else {
      void dispatch(addFavourite(character));
    }
  }, [character, isFav, isToggling, dispatch]);

  if (isLoading && !character) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!character) {
    return (
      <ErrorScreen
        message={(error as Error | null)?.message ?? 'Character not found.'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {showOfflineBanner && <OfflineBanner />}
      <View style={styles.hero}>
        <View style={styles.avatarWrapper}>
          <FadeImage
            uri={character.image}
            style={styles.avatar}
            borderRadius={ds(80)}
            fallbackLabel={character.name}
          />
        </View>
        <Text style={styles.name}>{character.name}</Text>
        <StatusBadge status={character.status} centered />
      </View>

      <TouchableOpacity
        style={[styles.favButton, isFav && styles.favButtonActive]}
        onPress={handleToggleFavourite}
        disabled={isToggling}
        activeOpacity={0.8}
      >
        {isToggling ? (
          <ActivityIndicator
            color={isFav ? COLORS.background : COLORS.primary}
            size="small"
          />
        ) : (
          <View style={styles.favInner}>
            {isFav ? (
              <HeartOff size={ds(17)} color={COLORS.background} strokeWidth={2} />
            ) : (
              <Heart size={ds(17)} color={COLORS.primary} strokeWidth={2} />
            )}
            <Text style={[styles.favText, isFav && styles.favTextActive]}>
              {isFav ? 'Remove from Favourites' : 'Add to Favourites'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Character Info</Text>

        <InfoRow
          icon={<Dna size={ds(13)} color={COLORS.textMuted} strokeWidth={1.8} />}
          label="Species"
          value={character.species}
        />
        <InfoRow
          icon={<Venus size={ds(13)} color={COLORS.textMuted} strokeWidth={1.8} />}
          label="Gender"
          value={character.gender}
        />
        {character.type ? (
          <InfoRow
            icon={<Star size={ds(13)} color={COLORS.textMuted} strokeWidth={1.8} />}
            label="Type"
            value={character.type}
          />
        ) : null}
        <InfoRow
          icon={<MapPin size={ds(13)} color={COLORS.textMuted} strokeWidth={1.8} />}
          label="Origin"
          value={character.origin.name}
        />
        <InfoRow
          icon={<MapPin size={ds(13)} color={COLORS.textMuted} strokeWidth={1.8} />}
          label="Last Location"
          value={character.location.name}
        />
        <InfoRow
          icon={<Tv2 size={ds(13)} color={COLORS.textMuted} strokeWidth={1.8} />}
          label="First Seen"
          value={
            character.episode[0]
              ? `Episode ${character.episode[0].split('/').pop() ?? ''}`
              : 'Unknown'
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Episodes
          <Text style={styles.sectionCount}> ({episodeNumbers.length})</Text>
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.episodesRow}
        >
          {episodeNumbers.map(epNum => (
            <View key={epNum} style={styles.episodePill}>
              <Text style={styles.episodePillText}>EP {epNum}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {seasons.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seasons</Text>
          <View style={styles.seasonsRow}>
            {seasons.map(s => (
              <View key={s} style={styles.seasonBadge}>
                <Text style={styles.seasonText}>S{String(s).padStart(2, '0')}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: ds(40),
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  hero: {
    alignItems: 'center',
    paddingTop: ds(28),
    paddingBottom: ds(24),
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: ds(24),
    borderBottomRightRadius: ds(24),
    marginBottom: ds(16),
  },
  avatarWrapper: {
    width: ds(140),
    height: ds(140),
    borderRadius: ds(70),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primaryBorder,
    marginBottom: ds(16),
  },
  avatar: {
    width: ds(140),
    height: ds(140),
  },
  name: {
    fontSize: fs(22),
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: ds(8),
    paddingHorizontal: ds(20),
    letterSpacing: 0.2,
  },
  favButton: {
    marginHorizontal: ds(16),
    marginBottom: ds(16),
    paddingVertical: ds(13),
    borderRadius: ds(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    backgroundColor: COLORS.primaryDim,
  },
  favButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  favInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds(8),
  },
  favText: {
    fontSize: fs(14),
    fontWeight: '600',
    color: COLORS.primary,
  },
  favTextActive: {
    color: COLORS.background,
  },
  section: {
    marginHorizontal: ds(16),
    marginBottom: ds(12),
    backgroundColor: COLORS.card,
    borderRadius: ds(14),
    padding: ds(16),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: fs(13),
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: ds(12),
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionCount: {
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: ds(9),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds(6),
  },
  infoLabel: {
    fontSize: fs(13),
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: fs(13),
    color: COLORS.text,
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },
  episodesRow: {
    gap: ds(8),
    paddingRight: ds(4),
  },
  episodePill: {
    backgroundColor: COLORS.accentDim,
    borderRadius: ds(8),
    paddingHorizontal: ds(10),
    paddingVertical: ds(5),
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.35)',
  },
  episodePillText: {
    fontSize: fs(11),
    color: COLORS.accent,
    fontWeight: '700',
  },
  seasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds(8),
  },
  seasonBadge: {
    backgroundColor: COLORS.primaryDim,
    borderRadius: ds(8),
    paddingHorizontal: ds(12),
    paddingVertical: ds(5),
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  seasonText: {
    fontSize: fs(12),
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default CharacterDetailScreen;
