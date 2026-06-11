import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Episode } from '../../../types/episode';
import { Character } from '../../../types/character';
import { fetchCharactersByIds } from '../../characters/services/characterService';
import { extractCharacterIds } from '../services/episodeService';
import { FadeImage } from '../../../shared/components/ProgressiveImage';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';

interface EpisodeDetailModalProps {
  episode: Episode;
  onClose: () => void;
}

const EpisodeDetailModal: React.FC<EpisodeDetailModalProps> = ({ episode, onClose }) => {
  const characterIds = useMemo(
    () => extractCharacterIds(episode.characters).slice(0, 20),
    [episode.characters],
  );

  const {
    data: characters,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Character[], Error>({
    queryKey: ['episodeCharacters', episode.id],
    queryFn: () => fetchCharactersByIds(characterIds),
    enabled: characterIds.length > 0,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.dismissArea} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close episode details" />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.epBadge}>
              <Text style={styles.epCode}>{episode.episode}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.epName} numberOfLines={2}>{episode.name}</Text>
              <Text style={styles.epDate}>{episode.air_date}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {episode.characters.length} Characters
          </Text>

          {isLoading && !characters?.length ? (
            <ActivityIndicator color={COLORS.primary} style={styles.loader} />
          ) : isError && !characters?.length ? (
            <View style={styles.offlineMessage}>
              <Text style={styles.offlineText}>
                {(error as Error).message}
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => void refetch()}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={characters ?? []}
              keyExtractor={item => String(item.id)}
              numColumns={4}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={styles.grid}
              renderItem={({ item }: { item: Character }) => (
                <View style={styles.avatarItem}>
                  <FadeImage
                    uri={item.image}
                    style={styles.avatar}
                    borderRadius={ds(32)}
                    fallbackLabel={item.name}
                  />
                  <Text style={styles.avatarName} numberOfLines={1}>
                    {item.name.split(' ')[0]}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  dismissArea: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: ds(24),
    borderTopRightRadius: ds(24),
    paddingTop: ds(12),
    maxHeight: '85%',
    height: '85%',
  },
  list: {
    flex: 1,
  },
  handle: {
    width: ds(40),
    height: ds(4),
    borderRadius: ds(2),
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: ds(12),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ds(16),
    marginBottom: ds(4),
    gap: ds(10),
  },
  epBadge: {
    backgroundColor: COLORS.accentDim,
    borderRadius: ds(8),
    paddingHorizontal: ds(10),
    paddingVertical: ds(8),
    minWidth: ds(66),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.35)',
    flexShrink: 0,
  },
  epCode: {
    fontSize: fs(11),
    fontWeight: '700',
    color: COLORS.accent,
    lineHeight: fs(15),
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  headerInfo: {
    flex: 1,
  },
  epName: {
    fontSize: fs(16),
    fontWeight: '700',
    color: COLORS.text,
  },
  epDate: {
    fontSize: fs(12),
    color: COLORS.textSecondary,
    marginTop: ds(2),
  },
  closeBtn: {
    padding: ds(8),
  },
  closeText: {
    fontSize: fs(16),
    color: COLORS.textSecondary,
  },
  subtitle: {
    fontSize: fs(13),
    color: COLORS.textSecondary,
    paddingHorizontal: ds(16),
    marginBottom: ds(12),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  loader: {
    padding: ds(40),
  },
  offlineMessage: {
    alignItems: 'center',
    padding: ds(32),
    gap: ds(12),
  },
  offlineText: {
    fontSize: fs(13),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: fs(20),
  },
  retryBtn: {
    paddingHorizontal: ds(20),
    paddingVertical: ds(8),
    borderRadius: ds(16),
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  retryText: {
    fontSize: fs(13),
    fontWeight: '600',
    color: COLORS.primary,
  },
  grid: {
    paddingHorizontal: ds(12),
    paddingBottom: ds(32),
  },
  avatarItem: {
    flex: 1,
    alignItems: 'center',
    padding: ds(6),
  },
  avatar: {
    width: ds(64),
    height: ds(64),
    marginBottom: ds(4),
  },
  avatarName: {
    fontSize: fs(10),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default EpisodeDetailModal;
