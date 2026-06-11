import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../utils/colors';
import { ds, fs } from '../../utils/responsive';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No results found',
  subtitle = "Rick must have destroyed them.\nTry a different search.",
  icon = '🔭',
}) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ds(32),
    paddingVertical: ds(24),
  },
  icon: {
    fontSize: fs(56),
    marginBottom: ds(16),
  },
  title: {
    fontSize: fs(18),
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: ds(8),
  },
  subtitle: {
    fontSize: fs(14),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: fs(22),
  },
});
