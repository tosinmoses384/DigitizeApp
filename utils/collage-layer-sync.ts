import type { CollageLayer } from '../types/collage';
import type { WardrobeItem } from '../services/features/wardrobe-service/types';
import { convertWardrobeItemToCollageLayer } from './collage-adapter';

interface SyncLayersWithWardrobeItemsOptions {
  items: WardrobeItem[];
  canvasWidth: number;
  canvasHeight: number;
  existingLayers: CollageLayer[] | null | undefined;
  addLayer: (layer: Omit<CollageLayer, 'id' | 'zIndex'>) => void;
  removeLayer: (layerId: string) => void;
}

export const syncCollageLayersWithWardrobeItems = ({
  items,
  canvasWidth,
  canvasHeight,
  existingLayers,
  addLayer,
  removeLayer,
}: SyncLayersWithWardrobeItemsOptions): void => {
  const currentLayers = existingLayers ?? [];

  if (currentLayers.length === 0 && items.length === 0) {
    return;
  }

  const nextItemIds = new Set(items.map((item) => item.id));

  currentLayers.forEach((layer) => {
    const wardrobeId = layer.wardrobeItemId;
    if (wardrobeId && !nextItemIds.has(wardrobeId)) {
      removeLayer(layer.id);
    }
  });

  const layersByWardrobeId = new Map<string, CollageLayer>();

  currentLayers.forEach((layer) => {
    const wardrobeId = layer.wardrobeItemId;
    if (wardrobeId && !layersByWardrobeId.has(wardrobeId)) {
      layersByWardrobeId.set(wardrobeId, layer);
    }
  });

  items.forEach((item, index) => {
    if (!layersByWardrobeId.has(item.id)) {
      const baseLayer = convertWardrobeItemToCollageLayer(
        item,
        index,
        canvasWidth,
        canvasHeight
      );
      addLayer(baseLayer);
    }
  });
};


