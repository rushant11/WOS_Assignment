import { useCallback, useRef } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export function useScrollHeader(headerHeight: number = 56) {
  const scrollY = useRef(new Animated.Value(0)).current;

  const clampedScroll = useRef(
    Animated.diffClamp(scrollY, 0, headerHeight),
  ).current;

  const translateY = clampedScroll.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.setValue(Math.max(0, event.nativeEvent.contentOffset.y));
    },
    [scrollY],
  );

  const resetScroll = useCallback(() => {
    scrollY.setValue(0);
  }, [scrollY]);

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (event.nativeEvent.contentOffset.y <= 0) {
        resetScroll();
      }
    },
    [resetScroll],
  );

  return {
    onScroll,
    onScrollEnd,
    resetScroll,
    animatedHeaderStyle: { transform: [{ translateY }] },
    headerHeight,
  };
}
