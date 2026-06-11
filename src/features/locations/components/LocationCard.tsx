import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Globe, ChevronRight, Users } from 'lucide-react-native';
import { Location } from '../../../types/location';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';

interface LocationCardProps {
  location: Location;
  onPress: (location: Location) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress(location)}
    activeOpacity={0.7}
  >
    <View style={styles.iconContainer}>
      <Globe size={ds(20)} color={COLORS.primary} strokeWidth={1.8} />
    </View>

    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>{location.name}</Text>
      <View style={styles.metaRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{location.type || 'Unknown'}</Text>
        </View>
        <Text style={styles.dimension} numberOfLines={1}>
          {location.dimension === 'unknown' ? 'Unknown Dimension' : location.dimension}
        </Text>
      </View>
      <View style={styles.residentsRow}>
        <Users size={ds(11)} color={COLORS.textMuted} strokeWidth={1.8} />
        <Text style={styles.residents}>
          {location.residents.length} resident{location.residents.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>

    <ChevronRight size={ds(16)} color={COLORS.textMuted} strokeWidth={2} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: ds(12),
    marginHorizontal: ds(16),
    marginVertical: ds(5),
    padding: ds(14),
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: ds(12),
  },
  iconContainer: {
    width: ds(42),
    height: ds(42),
    borderRadius: ds(10),
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: ds(4),
  },
  name: {
    fontSize: fs(14),
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds(8),
    flexWrap: 'wrap',
  },
  typeBadge: {
    backgroundColor: COLORS.primaryDim,
    borderRadius: ds(5),
    paddingHorizontal: ds(7),
    paddingVertical: ds(2),
  },
  typeText: {
    fontSize: fs(10),
    color: COLORS.primary,
    fontWeight: '600',
  },
  dimension: {
    fontSize: fs(11),
    color: COLORS.textSecondary,
    flex: 1,
  },
  residentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds(4),
  },
  residents: {
    fontSize: fs(11),
    color: COLORS.textMuted,
  },
});
