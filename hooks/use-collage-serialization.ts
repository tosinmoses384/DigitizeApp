import { useCallback } from 'react';
import { useCollageStore } from '../stores/collage-store';
import type { CollageDocument, CollageLayer } from '../types/collage';

interface SerializedCollageLayer {
  wardrobeItemId: string;
  matrix: number[];
  zIndex: number;
  opacity: number;
  naturalWidth: number;
  naturalHeight: number;
}

interface SerializedCollageLayout {
  canvasWidth: number;
  canvasHeight: number;
  stageTransform: {
    scale: number;
    translateX: number;
    translateY: number;
  };
  layers: SerializedCollageLayer[];
}

interface UseCollageSerializationResult {
  serializeCollageLayout: () => Record<string, string> | undefined;
  deserializeAndLoadCollage: (
    metadata?: Record<string, string>,
    wardrobeItems?: { id: string; itemDefaultImageUrl?: string; itemDefaultTransparentImageUrl?: string }[]
  ) => boolean;
  hasCollageLayout: (metadata?: Record<string, string>) => boolean;
  getSerializedLayers: (metadata?: Record<string, string>) => SerializedCollageLayer[] | null;
  clearCollageData: () => void;
}

export const useCollageSerialization = (): UseCollageSerializationResult => {
  const { setDocument, setStageTransform, clearDocument } = useCollageStore();

  const serializeCollageLayout = useCallback((): Record<string, string> | undefined => {
    try {
      const collageDocument = useCollageStore.getState().document;
      const currentStageTransform = useCollageStore.getState().stageTransform;

      if (!collageDocument || collageDocument.layers.length === 0) {
        return undefined;
      }

      const visibleLayers = collageDocument.layers.filter(
        (layer) => !layer.isHidden && layer.wardrobeItemId
      );

      if (visibleLayers.length === 0) {
        return undefined;
      }

      const collageLayout: SerializedCollageLayout = {
        canvasWidth: collageDocument.width,
        canvasHeight: collageDocument.height,
        stageTransform: {
          scale: currentStageTransform.scale,
          translateX: currentStageTransform.translateX,
          translateY: currentStageTransform.translateY,
        },
        layers: visibleLayers.map((layer) => ({
          wardrobeItemId: layer.wardrobeItemId!,
          matrix: layer.matrix,
          zIndex: layer.zIndex,
          opacity: layer.opacity,
          naturalWidth: layer.naturalWidth,
          naturalHeight: layer.naturalHeight,
        })),
      };

      return {
        collageLayout: JSON.stringify(collageLayout),
      };
    } catch {
      return undefined;
    }
  }, []);

  const hasCollageLayout = useCallback((metadata?: Record<string, string>): boolean => {
    if (!metadata || !metadata.collageLayout) {
      return false;
    }

    try {
      const parsed = JSON.parse(metadata.collageLayout);
      return parsed && parsed.layers && Array.isArray(parsed.layers) && parsed.layers.length > 0;
    } catch {
      return false;
    }
  }, []);

  const deserializeAndLoadCollage = useCallback((
    metadata?: Record<string, string>,
    wardrobeItems?: { id: string; itemDefaultImageUrl?: string; itemDefaultTransparentImageUrl?: string; itemImageUrls?: string[]; defaultImageUrl?: string }[]
  ): boolean => {
    try {
      if (!hasCollageLayout(metadata)) {
        return false;
      }

      const collageLayout: SerializedCollageLayout = JSON.parse(metadata!.collageLayout);

      if (!collageLayout.layers || collageLayout.layers.length === 0) {
        return false;
      }

      const itemsMap = new Map(
        wardrobeItems?.map(item => [item.id, item]) || []
      );

      const reconstructedLayers: CollageLayer[] = collageLayout.layers
        .filter(serializedLayer => {
          const itemExists = itemsMap.has(serializedLayer.wardrobeItemId);
          return itemExists;
        })
        .map((serializedLayer, index) => {
          const item = itemsMap.get(serializedLayer.wardrobeItemId)!;
          
          const imageUri = 
            item.itemImageUrls?.[0] || 
            item.itemDefaultTransparentImageUrl || 
            item.itemDefaultImageUrl || 
            item.defaultImageUrl || 
            '';

          return {
            id: `layer_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'image' as const,
            uri: imageUri,
            wardrobeItemId: serializedLayer.wardrobeItemId,
            naturalWidth: serializedLayer.naturalWidth,
            naturalHeight: serializedLayer.naturalHeight,
            transform: {
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              anchorX: 0.5,
              anchorY: 0.5,
            },
            matrix: serializedLayer.matrix,
            zIndex: serializedLayer.zIndex,
            cachedUri: imageUri,
            cachedSize: { width: serializedLayer.naturalWidth, height: serializedLayer.naturalHeight },
            cachedThumbUri: null,
            backgroundRemoved: imageUri?.includes('transparent') || imageUri?.includes('background-removed'),
            opacity: serializedLayer.opacity,
            isLocked: false,
            isHidden: false,
          };
        });

      const reconstructedDocument: CollageDocument = {
        id: `collage_${Date.now()}`,
        width: collageLayout.canvasWidth,
        height: collageLayout.canvasHeight,
        transparent: true,
        backgroundColor: '#FFFFFF',
        layers: reconstructedLayers,
        selection: [],
        historyPointer: -1,
        history: [],
      };

      setDocument(reconstructedDocument);

      if (collageLayout.stageTransform) {
        setStageTransform({
          scale: collageLayout.stageTransform.scale,
          translateX: collageLayout.stageTransform.translateX,
          translateY: collageLayout.stageTransform.translateY,
        });
      }

      return true;
    } catch {
      return false;
    }
  }, [hasCollageLayout, setDocument, setStageTransform]);

  const clearCollageData = useCallback(() => {
    clearDocument();
  }, [clearDocument]);

  const getSerializedLayers = useCallback((metadata?: Record<string, string>): SerializedCollageLayer[] | null => {
    try {
      if (!hasCollageLayout(metadata)) {
        return null;
      }

      const collageLayout: SerializedCollageLayout = JSON.parse(metadata!.collageLayout);
      return collageLayout.layers || null;
    } catch {
      return null;
    }
  }, [hasCollageLayout]);

  return {
    serializeCollageLayout,
    deserializeAndLoadCollage,
    hasCollageLayout,
    getSerializedLayers,
    clearCollageData,
  };
};

