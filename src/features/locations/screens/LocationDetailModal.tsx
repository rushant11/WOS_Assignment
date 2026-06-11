import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Location } from '../../../types/location';
import { Character } from '../../../types/character';
import { fetchCharactersByIds } from '../../characters/services/characterService';
import { extractResidentIds } from '../services/locationService';
import { FadeImage } from '../../../shared/components/ProgressiveImage';
import { StatusBadge } from '../../characters/components/StatusBadge';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';

interface LocationDetailModalProps {
  location: Location;
  onClose: () => void;
}

const LocationDetailModal: React.FC<LocationDetailModalProps> = ({ location, onClose }) => {
  const residentIds = useMemo(
    () => extractResidentIds(location.residents).slice(0, 24),
    [location.residents],
  );

  const {
    data: residents,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Character[], Error>({
    queryKey: ['locationResidents', location.id],
    queryFn: () => fetchCharactersByIds(residentIds),
    enabled: residentIds.length > 0,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.dismissArea} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close location details" />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.locationName} numberOfLines={1}>{location.name}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{location.type}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.meta} numberOfLines={1}>{location.dimension}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {location.residents.length} Residents
            {residentIds.length < location.residents.length ? ` (showing ${residentIds.length})` : ''}
          </Text>

          {location.residents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👻</Text>
              <Text style={styles.emptyText}>No residents found</Text>
            </View>
          ) : isLoading && !residents?.length ? (
            <ActivityIndicator color={COLORS.primary} style={styles.loader} />
          ) : isError && !residents?.length ? (
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
              data={residents ?? []}
              keyExtractor={item => String(item.id)}
              numColumns={3}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={styles.grid}
              renderItem={({ item }: { item: Character }) => (
                <View style={styles.residentItem}>
                  <FadeImage
                    uri={item.image}
                    style={styles.avatar}
                    borderRadius={ds(40)}
                    fallbackLabel={item.name}
                  />
                  <Text style={styles.residentName} numberOfLines={1}>
                    {item.name.split(' ')[0]}
                  </Text>
                  <StatusBadge status={item.status} centered />
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
    alignItems: 'flex-start',
    paddingHorizontal: ds(16),
    marginBottom: ds(4),
  },
  headerInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: fs(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds(6),
    marginTop: ds(4),
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: fs(12),
    color: COLORS.textSecondary,
    flex: 1,
  },
  metaDot: {
    fontSize: fs(12),
    color: COLORS.textMuted,
  },
  closeBtn: {
    padding: ds(8),
    marginTop: ds(-4),
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
  emptyContainer: {
    alignItems: 'center',
    padding: ds(40),
  },
  emptyIcon: {
    fontSize: fs(40),
    marginBottom: ds(8),
  },
  emptyText: {
    fontSize: fs(14),
    color: COLORS.textSecondary,
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
    paddingHorizontal: ds(8),
    paddingBottom: ds(32),
  },
  residentItem: {
    flex: 1,
    alignItems: 'center',
    padding: ds(8),
    gap: ds(4),
  },
  avatar: {
    width: ds(72),
    height: ds(72),
    marginBottom: ds(4),
  },
  residentName: {
    fontSize: fs(11),
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LocationDetailModal;
