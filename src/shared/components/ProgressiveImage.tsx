import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageStyle,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { User } from 'lucide-react-native';
import { COLORS } from '../../utils/colors';
import { ds, fs } from '../../utils/responsive';

interface FadeImageProps {
  uri: string;
  style?: ImageStyle | ViewStyle;
  borderRadius?: number;
  fallbackLabel?: string;
}

function getInitials(label?: string): string {
  if (!label?.trim()) {
    return '';
  }
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

interface FallbackAvatarProps {
  label?: string;
  compact?: boolean;
}

const FallbackAvatar: React.FC<FallbackAvatarProps> = ({ label, compact = false }) => {
  const initials = getInitials(label);

  return (
    <View style={styles.fallback}>
      {initials ? (
        <Text style={[styles.fallbackInitials, compact && styles.fallbackInitialsCompact]}>
          {initials}
        </Text>
      ) : (
        <User
          size={compact ? ds(28) : ds(40)}
          color={COLORS.accent}
          strokeWidth={1.5}
        />
      )}
    </View>
  );
};

export const FadeImage: React.FC<FadeImageProps> = ({
  uri,
  style,
  borderRadius = 0,
  fallbackLabel,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const [hasError, setHasError] = useState(false);

  const hasValidUri = Boolean(uri?.trim());
  const showFallback = !hasValidUri || hasError;

  useEffect(() => {
    setHasError(false);
    opacity.setValue(0);
  }, [uri, opacity, hasValidUri]);

  const flatStyle = StyleSheet.flatten(style) ?? {};
  const width = typeof flatStyle.width === 'number' ? flatStyle.width : '100%';
  const height = typeof flatStyle.height === 'number' ? flatStyle.height : '100%';
  const compactFallback =
    typeof width === 'number' ? width < ds(60) : false;

  const handleLoad = (): void => {
    setHasError(false);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleError = (): void => {
    setHasError(true);
  };

  return (
    <View
      style={[
        styles.container,
        { borderRadius, overflow: 'hidden', width, height },
        style as ViewStyle,
      ]}
    >
      {showFallback ? (
        <FallbackAvatar label={fallbackLabel} compact={compactFallback} />
      ) : (
        <>
          <View style={styles.skeleton} />
          <Animated.View style={[styles.imageWrap, { opacity }]}>
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="cover"
              onLoad={handleLoad}
              onError={handleError}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.skeleton,
    position: 'relative',
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.skeleton,
  },
  imageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentDim,
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.25)',
  },
  fallbackInitials: {
    fontSize: fs(22),
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 1,
  },
  fallbackInitialsCompact: {
    fontSize: fs(16),
  },
});
