import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../utils/colors';
import { ds, fs } from '../../utils/responsive';

interface OfflineBannerProps {
  message?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = "You're offline. Showing cached data.",
}) => (
  <View style={styles.banner}>
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.primaryDim,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryBorder,
    paddingHorizontal: ds(16),
    paddingVertical: ds(8),
  },
  text: {
    fontSize: fs(12),
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
