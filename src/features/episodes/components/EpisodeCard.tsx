import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Calendar, Users } from 'lucide-react-native';
import { Episode } from '../../../types/episode';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';

interface EpisodeCardProps {
  episode: Episode;
  onPress: (episode: Episode) => void;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress(episode)}
    activeOpacity={0.7}
  >
    <View style={styles.codeBadge}>
      <Text style={styles.code}>{episode.episode}</Text>
    </View>

    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={2}>
        {episode.name}
      </Text>
      <View style={styles.meta}>
        <Calendar size={ds(11)} color={COLORS.textMuted} strokeWidth={1.8} />
        <Text style={styles.metaText}>{episode.air_date}</Text>
        <Users size={ds(11)} color={COLORS.textMuted} strokeWidth={1.8} />
        <Text style={styles.metaText}>{episode.characters.length}</Text>
      </View>
    </View>

    <ChevronRight size={ds(16)} color={COLORS.textMuted} strokeWidth={2} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ds(16),
    paddingVertical: ds(13),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    backgroundColor: COLORS.background,
    gap: ds(12),
  },
  codeBadge: {
    backgroundColor: COLORS.accentDim,
    borderRadius: ds(8),
    paddingHorizontal: ds(10),
    paddingVertical: ds(8),
    minWidth: ds(66),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.35)',
  },
  code: {
    fontSize: fs(11),
    fontWeight: '700',
    color: COLORS.accent,
    lineHeight: fs(15),
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  info: {
    flex: 1,
    gap: ds(5),
  },
  name: {
    fontSize: fs(14),
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds(5),
  },
  metaText: {
    fontSize: fs(11),
    color: COLORS.textMuted,
  },
});
