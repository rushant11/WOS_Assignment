import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CharacterStatus } from '../../../types/character';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';

interface StatusBadgeProps {
  status: CharacterStatus;
  centered?: boolean;
}

const STATUS_CONFIG: Record<
  CharacterStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  Alive: { label: 'Alive', color: COLORS.alive, bg: COLORS.aliveBg, border: COLORS.aliveBorder },
  Dead: { label: 'Dead', color: COLORS.dead, bg: COLORS.deadBg, border: COLORS.deadBorder },
  unknown: { label: 'Unknown', color: COLORS.unknown, bg: COLORS.unknownBg, border: COLORS.unknownBorder },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, centered = false }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;

  return (
    <View
      style={[
        styles.badge,
        centered && styles.badgeCentered,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: ds(8),
    paddingVertical: ds(3),
    borderRadius: ds(20),
    borderWidth: 1,
  },
  badgeCentered: {
    alignSelf: 'center',
  },
  dot: {
    width: ds(6),
    height: ds(6),
    borderRadius: ds(3),
    marginRight: ds(5),
  },
  label: {
    fontSize: fs(11),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
