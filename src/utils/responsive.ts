import { Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const STANDARD_WIDTH = 375;
const USE_FOR_BIGGER_SIZE = true;
const isTab = width >= 600;

const PHONE_SCALE_FACTOR = width / (Platform.OS === 'android' ? 400 : 390);
const TABLET_SCALE_FACTOR = PHONE_SCALE_FACTOR * 0.75;

function dynamicSize(size: number): number {
  if (isTab) {
    return size * TABLET_SCALE_FACTOR;
  }
  return size * PHONE_SCALE_FACTOR;
}

function getFontSize(size: number): number {
  if (USE_FOR_BIGGER_SIZE || width < STANDARD_WIDTH) {
    return dynamicSize(size);
  }
  return size;
}

export const ds = (size: number): number => dynamicSize(size);
export const fs = (size: number): number => getFontSize(size);
