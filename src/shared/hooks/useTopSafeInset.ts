import { Platform, StatusBar } from 'react-native';
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const METRICS_TOP = initialWindowMetrics?.insets.top ?? 0;
const IOS_MIN_TOP = 59;

export function useTopSafeInset(): number {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'android') {
    return Math.max(insets.top, StatusBar.currentHeight ?? 0);
  }

  return Math.max(insets.top, METRICS_TOP, IOS_MIN_TOP);
}
