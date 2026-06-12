import { useTopSafeInset } from './useTopSafeInset';
import { ds } from '../../utils/responsive';

export function useScreenHeaderInsets(contentHeight: number = ds(56)) {
  const topInset = useTopSafeInset();

  return {
    topInset,
    headerHeight: contentHeight,
    totalHeight: topInset + contentHeight,
  };
}
