import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from '../../utils/colors';
import { ds } from '../../utils/responsive';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = ds(16),
  borderRadius = ds(4),
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as number, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

export const CharacterCardSkeleton: React.FC = () => (
  <View style={styles.card}>
    <SkeletonLoader width={ds(72)} height={ds(72)} borderRadius={ds(10)} />
    <View style={styles.cardContent}>
      <SkeletonLoader width="55%" height={ds(14)} style={styles.mb8} />
      <SkeletonLoader width="45%" height={ds(12)} style={styles.mb8} />
      <SkeletonLoader width="65%" height={ds(11)} />
    </View>
  </View>
);

export const EpisodeRowSkeleton: React.FC = () => (
  <View style={styles.episodeRow}>
    <SkeletonLoader width={ds(50)} height={ds(50)} borderRadius={ds(8)} />
    <View style={styles.episodeContent}>
      <SkeletonLoader width="70%" height={ds(13)} style={styles.mb8} />
      <SkeletonLoader width="45%" height={ds(11)} />
    </View>
  </View>
);

export const LocationRowSkeleton: React.FC = () => (
  <View style={styles.locationRow}>
    <SkeletonLoader width="55%" height={ds(14)} style={styles.mb8} />
    <SkeletonLoader width="40%" height={ds(11)} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.skeleton,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: ds(14),
    paddingVertical: ds(10),
    paddingHorizontal: ds(10),
    marginHorizontal: ds(16),
    marginVertical: ds(5),
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: ds(92),
  },
  cardContent: {
    flex: 1,
    marginLeft: ds(12),
  },
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ds(16),
    paddingVertical: ds(10),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  episodeContent: {
    flex: 1,
    marginLeft: ds(12),
  },
  locationRow: {
    paddingHorizontal: ds(16),
    paddingVertical: ds(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  mb8: {
    marginBottom: ds(8),
  },
});
