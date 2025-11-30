import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

type AnyComponent = React.ComponentType<any>;

function isExpoGo(): boolean {
  // Expo Go doesn't ship native Skia
  return Constants.appOwnership === 'expo';
}

export function hasSkiaNativeModule(): boolean {
  try {
    return !!(NativeModules as any)?.RNSkiaModule;
  } catch {
    return false;
  }
}

export function canAttemptSkia(): boolean {
  return !isExpoGo() && hasSkiaNativeModule();
}

export function isSkiaRuntimeUsable(): boolean {
  if (!canAttemptSkia()) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@shopify/react-native-skia');
    return true;
  } catch {
    return false;
  }
}

export function getCollageCanvasSafely(): AnyComponent | null {
  if (!isSkiaRuntimeUsable()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('../components/collage/CollageCanvas');
    return (mod?.default ?? null) as AnyComponent | null;
  } catch {
    return null;
  }
}

export function getSkiaModuleSafely(): any | null {
  if (!isSkiaRuntimeUsable()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@shopify/react-native-skia');
  } catch {
    return null;
  }
}


