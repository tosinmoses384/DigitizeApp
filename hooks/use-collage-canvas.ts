// DEPRECATED: This is the legacy gesture hook that has known issues with gesture conflicts.
// DO NOT USE THIS HOOK - Use use-collage-canvas-optimized.ts instead
// This file is kept for reference only and will be removed soon.
// Known issues:
// - Uses Gesture.Simultaneous(tap, pan, pinch, rotation) which causes pan to hijack pinch/rotation
// - Does not properly handle focal point during pinch zoom
// - Has performance issues with high-frequency gesture updates

import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { useSharedValue, runOnJS, withSpring } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import type { SkImage } from '@shopify/react-native-skia';
import { useCollageStore } from '../stores/collage-store';
import {
  findTopmostLayerAtPoint,
  calculateUnionBoundingBox,
  mapGroupTransformToLayerTransform,
  snapToGrid,
  snapToNearbyEdges,
  clampStageTransform,
  transformPointByMatrix,
} from '../utils/collage-geometry';
import { createTranslationMatrix, createScaleMatrix, multiplyMatrices, constrainBoundsToDocument } from '../utils/collage-geometry';
import { saveDraftToFile, loadDraftFromFile, deleteDraftFile } from '../utils/collage-io';
import type { CollagePoint, CollageBounds } from '../types/collage';

interface UseCollageCanvasOptions {
  width: number;
  height: number;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
}

interface UseCollageCanvasResult {
  selectionBounds: CollageBounds | null;
  isExporting: boolean;
  exportAsPng: (image: SkImage | null) => Promise<{ success: boolean; error?: string }>;
  composedGesture: ReturnType<typeof Gesture.Simultaneous>;
  restoreDraft: () => Promise<boolean>;
  clearDraft: () => Promise<void>;
}

export const useCollageCanvas = (
  options: UseCollageCanvasOptions
): UseCollageCanvasResult => {
  const { width, height, enableAutoSave = true, autoSaveInterval = 3000 } = options;

  const {
    document,
    interactionMode,
    stageTransform,
    isSnappingEnabled,
    setInteractionMode,
    selectLayer,
    clearSelection,
    updateSelectedLayersMatrix,
    getSelectedLayers,
    hasSelection,
    bringToFront,
    sendToBack,
    removeLayer,
    updateLayer,
  } = useCollageStore();

  const [isExporting, setIsExporting] = useState(false);
  // Compute selection bounds on demand in caller from store; avoid per-frame React state updates

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSaveRef = useRef<number>(0);
  const didFinalizeRef = useRef(false);

  const initialTransforms = useRef<Record<string, number[]>>({});
  const gestureStartCentroidRef = useRef<{ x: number; y: number } | null>(null);
  
  const currentModeRef = useRef<string>('none');
  const panStartPointRef = useRef<{ x: number; y: number } | null>(null);

  // Shared values for gesture state to work in worklet context
  const gestureStateShared = useSharedValue({
    mode: 'none' as 'none' | 'transform-layer' | 'transform-stage',
    hasSelection: false,
  });

  useEffect(() => {
    gestureStateShared.value = {
      mode: interactionMode as 'none' | 'transform-layer' | 'transform-stage',
      hasSelection: hasSelection(),
    };
  }, [interactionMode, hasSelection, gestureStateShared]);

  const scheduleAutoSave = useCallback(() => {
    if (!enableAutoSave || !document) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      const now = Date.now();
      if (now - lastAutoSaveRef.current >= autoSaveInterval) {
        await saveDraftToFile(document);
        lastAutoSaveRef.current = now;
      }
    }, autoSaveInterval);
  }, [enableAutoSave, document, autoSaveInterval]);

  useEffect(() => {
    scheduleAutoSave();
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [scheduleAutoSave]);

  const restoreDraft = useCallback(async (): Promise<boolean> => {
    const result = await loadDraftFromFile();
    if (result.success && result.document) {
      useCollageStore.getState().setDocument(result.document);
      return true;
    }
    return false;
  }, []);

  const clearDraft = useCallback(async (): Promise<void> => {
    await deleteDraftFile();
  }, []);

  const exportAsPng = useCallback(
    async (image: SkImage | null): Promise<{ success: boolean; error?: string }> => {
      setIsExporting(true);

      try {
        if (!image) {
          return { success: false, error: 'No image to export' };
        }

        const { encodeSkiaImageToPNG } = await import('../services/collageExporter');
        const result = await encodeSkiaImageToPNG(image);

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Export failed';
        return { success: false, error: errorMessage };
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    Haptics.impactAsync(
      type === 'light'
        ? Haptics.ImpactFeedbackStyle.Light
        : type === 'medium'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Heavy
    );
  }, []);

  const screenToContentSpace = useCallback((screenX: number, screenY: number): CollagePoint => {
    const scale = stageTransform.scale || 1;
    const tx = stageTransform.translateX || 0;
    const ty = stageTransform.translateY || 0;
    
    return {
      x: (screenX - tx) / scale,
      y: (screenY - ty) / scale,
    };
  }, [stageTransform]);

  const handleTapGesture = useCallback(
    (x: number, y: number) => {
      if (!document) return;

      const contentPoint = screenToContentSpace(x, y);
      const hitLayer = findTopmostLayerAtPoint(document.layers, contentPoint);

      if (hitLayer && !hitLayer.isLocked) {
        selectLayer(hitLayer.id);
        setInteractionMode('transform-layer');
        triggerHapticFeedback('light');
      } else {
        clearSelection();
        setInteractionMode('none');
      }
    },
    [document, selectLayer, clearSelection, setInteractionMode, triggerHapticFeedback, screenToContentSpace]
  );

  const handlePanStart = useCallback((x?: number, y?: number) => {
    if (!document) return;

    didFinalizeRef.current = false;
    let selectedLayers = getSelectedLayers();
    
    if (selectedLayers.length === 0 && typeof x === 'number' && typeof y === 'number') {
      const contentPoint = screenToContentSpace(x, y);
      const hit = findTopmostLayerAtPoint(document.layers, contentPoint);
      if (hit && !hit.isLocked) {
        selectLayer(hit.id);
        selectedLayers = [hit];
      }
    }

    if (selectedLayers.length > 0 && !selectedLayers.every(l => l.isLocked)) {
      currentModeRef.current = 'transform-layer';
      setInteractionMode('transform-layer');
      initialTransforms.current = {};
      selectedLayers.forEach((layer) => {
        initialTransforms.current[layer.id] = [...layer.matrix];
      });
      const startBounds = calculateUnionBoundingBox(selectedLayers);
      if (startBounds) {
        gestureStartCentroidRef.current = {
          x: startBounds.x + startBounds.width / 2,
          y: startBounds.y + startBounds.height / 2,
        };
      } else {
        gestureStartCentroidRef.current = null;
      }
      panStartPointRef.current = typeof x === 'number' && typeof y === 'number' ? { x, y } : null;
    } else {
      currentModeRef.current = 'transform-stage';
      setInteractionMode('transform-stage');
      panStartPointRef.current = typeof x === 'number' && typeof y === 'number' ? { x, y } : null;
    }
  }, [document, getSelectedLayers, setInteractionMode, selectLayer, screenToContentSpace]);

  const handlePanUpdate = useCallback(
    (deltaX: number, deltaY: number) => {
      const mode = currentModeRef.current;
      
      if (mode === 'transform-layer') {
        const selectedLayers = getSelectedLayers();
        if (selectedLayers.length === 0 || selectedLayers.every(l => l.isLocked)) return;

        const groupBounds = calculateUnionBoundingBox(selectedLayers);
        if (!groupBounds) return;

        let finalDeltaX = deltaX;
        let finalDeltaY = deltaY;

        const scale = stageTransform.scale || 1;
        if (scale !== 1) {
          finalDeltaX = finalDeltaX / scale;
          finalDeltaY = finalDeltaY / scale;
        }

        if (isSnappingEnabled && document) {
          const otherLayers = document.layers.filter(
            (l) => !selectedLayers.some((sl) => sl.id === l.id)
          );
          const otherBounds = otherLayers.map((l) => ({
            x: l.transform.x,
            y: l.transform.y,
            width: l.naturalWidth * l.transform.scale,
            height: l.naturalHeight * l.transform.scale,
          }));

          const newBounds = {
            ...groupBounds,
            x: groupBounds.x + finalDeltaX,
            y: groupBounds.y + finalDeltaY,
          };

          const snapResult = snapToNearbyEdges(newBounds, otherBounds, 8);
          
          if (snapResult.snappedX || snapResult.snappedY) {
            triggerHapticFeedback('light');
          }

          finalDeltaX += snapResult.deltaX;
          finalDeltaY += snapResult.deltaY;
        }

        const layerUpdates: Record<string, number[]> = {};
        const baseTranslate = createTranslationMatrix(finalDeltaX, finalDeltaY);
        selectedLayers.forEach((layer) => {
          if (!layer.isLocked) {
            const base = initialTransforms.current[layer.id] || layer.matrix;
            const updatedMatrix = multiplyMatrices(baseTranslate, base);
            layerUpdates[layer.id] = updatedMatrix;
          }
        });

        if (document) {
          const postBounds = calculateUnionBoundingBox(
            selectedLayers.map((l) => ({
              ...l,
              matrix: layerUpdates[l.id] ?? l.matrix,
            }))
          );
          if (postBounds) {
            const { dx, dy } = constrainBoundsToDocument(
              postBounds,
              document.width,
              document.height,
              0
            );
            if (dx !== 0 || dy !== 0) {
              const correction = createTranslationMatrix(dx, dy);
              Object.keys(layerUpdates).forEach((id) => {
                layerUpdates[id] = multiplyMatrices(correction, layerUpdates[id]);
              });
            }
          }
        }

        updateSelectedLayersMatrix(layerUpdates);
      } else if (mode === 'transform-stage') {
        const newTransform = clampStageTransform(
          stageTransform.scale,
          stageTransform.translateX + deltaX,
          stageTransform.translateY + deltaY,
          width,
          height,
          width,
          height
        );

        useCollageStore.getState().setStageTransform(newTransform);
      }
    },
    [
      getSelectedLayers,
      isSnappingEnabled,
      document,
      stageTransform,
      width,
      height,
      updateSelectedLayersMatrix,
      triggerHapticFeedback,
    ]
  );

  const handlePanEnd = useCallback(() => {
    if (didFinalizeRef.current) return;
    didFinalizeRef.current = true;

    currentModeRef.current = 'none';
    setInteractionMode('none');
    panStartPointRef.current = null;
    scheduleAutoSave();
  }, [setInteractionMode, scheduleAutoSave]);

  const handlePinchStart = useCallback(() => {
    didFinalizeRef.current = false;
    const selected = getSelectedLayers();
    if (selected.length > 0 && !selected.every(l => l.isLocked)) {
      currentModeRef.current = 'transform-layer';
      setInteractionMode('transform-layer');
      initialTransforms.current = {};
      selected.forEach((layer) => {
        initialTransforms.current[layer.id] = [...layer.matrix];
      });
      const startBounds = calculateUnionBoundingBox(selected);
      if (startBounds) {
        gestureStartCentroidRef.current = {
          x: startBounds.x + startBounds.width / 2,
          y: startBounds.y + startBounds.height / 2,
        };
      } else {
        gestureStartCentroidRef.current = null;
      }
    } else {
      currentModeRef.current = 'transform-stage';
      setInteractionMode('transform-stage');
    }
  }, [getSelectedLayers, setInteractionMode]);

  const handlePinchUpdate = useCallback((scale: number) => {
    const mode = currentModeRef.current;
    
    if (mode === 'transform-stage') {
      const newScale = stageTransform.scale * scale;
      const clampedTransform = clampStageTransform(
        newScale,
        stageTransform.translateX,
        stageTransform.translateY,
        width,
        height,
        width,
        height
      );
      useCollageStore.getState().setStageTransform(clampedTransform);
    } else if (mode === 'transform-layer') {
      const selectedLayers = getSelectedLayers();
      if (selectedLayers.length === 0 || selectedLayers.every(l => l.isLocked)) return;

      const centroid = gestureStartCentroidRef.current;
      const layerUpdates: Record<string, number[]> = {};
      const scaleM = createScaleMatrix(scale, scale);
      const toCentroid = centroid ? createTranslationMatrix(-centroid.x, -centroid.y) : createTranslationMatrix(0, 0);
      const fromCentroid = centroid ? createTranslationMatrix(centroid.x, centroid.y) : createTranslationMatrix(0, 0);
      const deltaM = multiplyMatrices(multiplyMatrices(fromCentroid, scaleM), toCentroid);

      selectedLayers.forEach((layer) => {
        if (!layer.isLocked) {
          const base = initialTransforms.current[layer.id] || layer.matrix;
          const updatedMatrix = multiplyMatrices(deltaM, base);
          layerUpdates[layer.id] = updatedMatrix;
        }
      });

      if (document) {
        const postBounds = calculateUnionBoundingBox(
          selectedLayers.map((l) => ({
            ...l,
            matrix: layerUpdates[l.id] ?? l.matrix,
          }))
        );
        if (postBounds) {
          const { dx, dy } = constrainBoundsToDocument(
            postBounds,
            document.width,
            document.height,
            0
          );
          if (dx !== 0 || dy !== 0) {
            const correction = createTranslationMatrix(dx, dy);
            Object.keys(layerUpdates).forEach((id) => {
              layerUpdates[id] = multiplyMatrices(correction, layerUpdates[id]);
            });
          }
        }
      }

      updateSelectedLayersMatrix(layerUpdates);
    }
  }, [getSelectedLayers, stageTransform, width, height, document, updateSelectedLayersMatrix]);

  const handleRotationStart = useCallback(() => {
    didFinalizeRef.current = false;
    const selected = getSelectedLayers();
    if (selected.length > 0 && !selected.every(l => l.isLocked)) {
      currentModeRef.current = 'transform-layer';
      setInteractionMode('transform-layer');
      initialTransforms.current = {};
      selected.forEach((layer) => {
        initialTransforms.current[layer.id] = [...layer.matrix];
      });
      const startBounds = calculateUnionBoundingBox(selected);
      if (startBounds) {
        gestureStartCentroidRef.current = {
          x: startBounds.x + startBounds.width / 2,
          y: startBounds.y + startBounds.height / 2,
        };
      } else {
        gestureStartCentroidRef.current = null;
      }
    }
  }, [getSelectedLayers, setInteractionMode]);

  const handleRotationUpdate = useCallback((rotation: number) => {
    const mode = currentModeRef.current;
    
    if (mode === 'transform-layer') {
      const selectedLayers = getSelectedLayers();
      if (selectedLayers.length === 0 || selectedLayers.every(l => l.isLocked)) return;

      const centroid = gestureStartCentroidRef.current;
      const layerUpdates: Record<string, number[]> = {};
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const rotateM = [cos, -sin, 0, sin, cos, 0, 0, 0, 1];
      const toCentroid = centroid ? createTranslationMatrix(-centroid.x, -centroid.y) : createTranslationMatrix(0, 0);
      const fromCentroid = centroid ? createTranslationMatrix(centroid.x, centroid.y) : createTranslationMatrix(0, 0);
      const deltaM = multiplyMatrices(multiplyMatrices(fromCentroid, rotateM), toCentroid);

      selectedLayers.forEach((layer) => {
        if (!layer.isLocked) {
          const base = initialTransforms.current[layer.id] || layer.matrix;
          const updatedMatrix = multiplyMatrices(deltaM, base);
          layerUpdates[layer.id] = updatedMatrix;
        }
      });

      if (document) {
        const postBounds = calculateUnionBoundingBox(
          selectedLayers.map((l) => ({
            ...l,
            matrix: layerUpdates[l.id] ?? l.matrix,
          }))
        );
        if (postBounds) {
          const { dx, dy } = constrainBoundsToDocument(
            postBounds,
            document.width,
            document.height,
            0
          );
          if (dx !== 0 || dy !== 0) {
            const correction = createTranslationMatrix(dx, dy);
            Object.keys(layerUpdates).forEach((id) => {
              layerUpdates[id] = multiplyMatrices(correction, layerUpdates[id]);
            });
          }
        }
      }

      updateSelectedLayersMatrix(layerUpdates);
    }
  }, [getSelectedLayers, document, updateSelectedLayersMatrix]);

  const handleGestureEnd = useCallback(() => {
    if (didFinalizeRef.current) return;
    didFinalizeRef.current = true;
    currentModeRef.current = 'none';
    setInteractionMode('none');
    scheduleAutoSave();
  }, [setInteractionMode, scheduleAutoSave]);

  const composedGesture = useMemo(() => {
    const tap = Gesture.Tap()
      .onStart((e) => {
        runOnJS(handleTapGesture)(e.x, e.y);
      });

    const pan = Gesture.Pan()
      .onStart((e) => {
        runOnJS(handlePanStart)(e.x, e.y);
      })
      .onUpdate((e) => {
        runOnJS(handlePanUpdate)(e.translationX, e.translationY);
      })
      .onEnd(() => {
        runOnJS(handlePanEnd)();
      });

    const pinch = Gesture.Pinch()
      .onStart(() => {
        runOnJS(handlePinchStart)();
      })
      .onUpdate((e) => {
        runOnJS(handlePinchUpdate)(e.scale);
      })
      .onEnd(() => {
        runOnJS(handleGestureEnd)();
      });

    const rotation = Gesture.Rotation()
      .onStart(() => {
        runOnJS(handleRotationStart)();
      })
      .onUpdate((e) => {
        runOnJS(handleRotationUpdate)(e.rotation);
      })
      .onEnd(() => {
        runOnJS(handleGestureEnd)();
      });

    return Gesture.Simultaneous(tap, pan, pinch, rotation);
  }, [
    handleTapGesture,
    handlePanStart,
    handlePanUpdate,
    handlePanEnd,
    handlePinchStart,
    handlePinchUpdate,
    handleRotationStart,
    handleRotationUpdate,
    handleGestureEnd,
  ]);

  return {
    selectionBounds: null,
    isExporting,
    exportAsPng,
    composedGesture,
    restoreDraft,
    clearDraft,
  };
};

