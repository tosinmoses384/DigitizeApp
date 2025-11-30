import type { CollageLayer } from '../types/collage';
import type { WardrobeItem } from '../services/features/wardrobe-service/types';
import { composeMatrix } from './collage-geometry';

export const convertWardrobeItemToCollageLayer = (
  item: WardrobeItem,
  index: number,
  canvasWidth: number,
  canvasHeight: number
): CollageLayer => {
  const backgroundRemovedUri = (item as any).backgroundRemovedImageUrl || '';
  const imageUri = backgroundRemovedUri || (item.itemImageUrls && item.itemImageUrls[0]) || '';

  const naturalWidth = 200;
  const naturalHeight = 200;

  const initialX = (canvasWidth || 400) / 2;
  const initialY = (canvasHeight || 600) / 2;

  const layer: CollageLayer = {
    id: `layer_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    type: 'image',
    uri: imageUri,
    wardrobeItemId: item.id,
    zIndex: item.id?.toString() || `temp_${Date.now()}`,
    naturalWidth,
    naturalHeight,
    transform: {
      x: initialX,
      y: initialY,
      scale: 1,
      rotation: 0,
      anchorX: 0.5,
      anchorY: 0.5,
    },
    matrix: composeMatrix({
      x: initialX,
      y: initialY,
      scale: 1,
      rotation: 0,
      anchorX: 0.5,
      anchorY: 0.5,
    }, naturalWidth, naturalHeight),
    cachedUri: imageUri,
    cachedSize: { width: naturalWidth, height: naturalHeight },
    cachedThumbUri: null,
    backgroundRemoved: (item as any).backgroundRemoved || imageUri?.includes('transparent') || imageUri?.includes('background-removed') || !!backgroundRemovedUri,
    opacity: 1,
    isLocked: false,
    isHidden: false,
  };

  if (__DEV__) {
    console.log('[collage-adapter] Layer created:', {
      itemId: item.id,
      backgroundRemoved: layer.backgroundRemoved,
      itemBackgroundRemoved: (item as any).backgroundRemoved,
      naturalSize: `${layer.naturalWidth}x${layer.naturalHeight}`,
    });
  }

  return layer;
};

export const convertWardrobeItemsToCollageLayers = (
  items: WardrobeItem[],
  canvasWidth: number,
  canvasHeight: number
): CollageLayer[] => {
  return items.map((item, index) =>
    convertWardrobeItemToCollageLayer(item, index, canvasWidth, canvasHeight)
  );
};

export const extractWardrobeItemIds = (layers: CollageLayer[]): string[] => {
  return layers
    .map((layer) => {
      const match = layer.uri.match(/items\/([^/]+)/);
      return match ? match[1] : null;
    })
    .filter((id): id is string => id !== null);
};

