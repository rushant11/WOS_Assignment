import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTopSafeInset } from '../hooks/useTopSafeInset';
import { COLORS } from '../../utils/colors';

interface ScreenHeaderShellProps {
  headerHeight: number;
  animatedStyle?: object;
  children: React.ReactNode;
}

export const ScreenHeaderShell: React.FC<ScreenHeaderShellProps> = ({
  headerHeight,
  animatedStyle,
  children,
}) => {
  const topInset = useTopSafeInset();

  return (
    <>
      <View
        pointerEvents="none"
        style={[styles.statusBar, { height: topInset }]}
      />
      <Animated.View
        style={[
          styles.header,
          { top: topInset, height: headerHeight },
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 101,
    backgroundColor: COLORS.background,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    overflow: 'hidden',
  },
});
