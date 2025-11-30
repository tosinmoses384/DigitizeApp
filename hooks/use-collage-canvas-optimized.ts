import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { useSharedValue, runOnJS, withSpring } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import type { SkImage } from '@shopify/react-native-skia';
import { useCollageStore } from '../stores/collage-store';
import { findTopmostLayerAtPoint, hitTestHandles } from '../utils/collage-geometry';
import {
  createTranslationMatrixWorklet,
  createScaleMatrixWorklet,
  createRotationMatrixWorklet,
  multiplyMatricesWorklet,
  clampStageTransformWorklet,
  getLayerCornerPointsWorklet,
  calculateBoundsFromPointsWorklet,
  findTopmostLayerAtPointWorklet,
  hitTestHandlesWorklet,
  HandleType,
} from '../utils/collage-geometry-worklets';
import { saveDraftToFile, loadDraftFromFile, deleteDraftFile } from '../utils/collage-io';
import type { CollagePoint, CollageBounds, SnapLine, CollageLayer } from '../types/collage';
import type { SharedValue } from 'react-native-reanimated';
import { snapToNearbyEdgesWorklet } from '../utils/collage-snapping-worklet';

interface UseCollageCanvasOptimizedOptions {
  width: number;
  height: number;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
}

interface UseCollageCanvasOptimizedResult {
  selectionBounds: CollageBounds | null;
  isExporting: boolean;
  exportAsPng: (image: SkImage | null) => Promise<{ success: boolean; error?: string }>;
  composedGesture: ReturnType<typeof Gesture.Race> | ReturnType<typeof Gesture.Manual>;
  restoreDraft: () => Promise<boolean>;
  clearDraft: () => Promise<void>;
  activeLayerTransforms: SharedValue<Record<string, number[]>>;
  stageTransformShared: {
    scale: SharedValue<number>;
    translateX: SharedValue<number>;
    translateY: SharedValue<number>;
  };
  snapLinesShared: SharedValue<SnapLine[]>;
}

export const useCollageCanvasOptimized = (
  options: UseCollageCanvasOptimizedOptions
): UseCollageCanvasOptimizedResult => {
  const { width, height, enableAutoSave = true, autoSaveInterval = 3000 } = options;

  // Add a ready state to ensure gestures are initialized
  const [gesturesReady, setGesturesReady] = useState(false);

  const {
    document,
    stageTransform,
    setInteractionMode,
    selectLayer,
    clearSelection,
    updateSelectedLayersMatrix,
    getSelectedLayers,
  } = useCollageStore();

  const [isExporting, setIsExporting] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSaveRef = useRef<number>(0);

  const activeLayerTransforms = useSharedValue<Record<string, number[]>>({});
  const gestureFrameCount = useSharedValue(0);
  const gestureStartTime = useSharedValue(0);
  const lastFrameLogTime = useSharedValue(0);
  const stageScale = useSharedValue(stageTransform.scale);
  const stageTranslateX = useSharedValue(stageTransform.translateX);
  const stageTranslateY = useSharedValue(stageTransform.translateY);

  const gestureMode = useSharedValue<'none' | 'transform-layer' | 'transform-stage' | 'resize-layer' | 'rotate-layer'>('none');
  const selectedLayerIdsShared = useSharedValue<string[]>([]);
  const initialTransformsShared = useSharedValue<Record<string, number[]>>({});
  const gestureCentroidShared = useSharedValue<{ x: number; y: number } | null>(null);
  const initialStageScale = useSharedValue(1);
  const initialStageTranslateX = useSharedValue(0);
  const initialStageTranslateY = useSharedValue(0);
  const snapLinesShared = useSharedValue<SnapLine[]>([]);
  const otherLayersBoundsShared = useSharedValue<CollageBounds[]>([]);
  const activeLayerDimensionsShared = useSharedValue<{ width: number, height: number } | null>(null);
  const layersShared = useSharedValue<CollageLayer[]>([]);
  // PERFORMANCE: Frame counter for throttling snap calculations
  const snapFrameCounter = useSharedValue(0);

  // Shared values for multi-touch gesture state
  const currentGestureScale = useSharedValue(1);
  const currentGestureRotation = useSharedValue(0);
  const activeHandleShared = useSharedValue<HandleType>(null);
  const initialGestureDistShared = useSharedValue(0);
  const initialGestureAngleShared = useSharedValue(0);

  useEffect(() => {
    stageScale.value = stageTransform.scale;
    stageTranslateX.value = stageTransform.translateX;
    stageTranslateY.value = stageTransform.translateY;
  }, [stageTransform.scale, stageTransform.translateX, stageTransform.translateY, stageScale, stageTranslateX, stageTranslateY]);

  useEffect(() => {
    if (document?.layers) {
      layersShared.value = document.layers;
    }
    if (document?.selection) {
      selectedLayerIdsShared.value = document.selection;
    }
  }, [document?.layers, document?.selection, layersShared, selectedLayerIdsShared]);

  useEffect(() => {
    // Delay gesture initialization slightly to ensure everything is ready
    const timer = setTimeout(() => {
      setGesturesReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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

      // Use shared values for most up-to-date transform
      const scale = stageScale.value;
      const tx = stageTranslateX.value;
      const ty = stageTranslateY.value;

      const contentPoint = {
        x: (x - tx) / scale,
        y: (y - ty) / scale,
      };

      console.log('[TapGesture] Screen:', { x, y });
      console.log('[TapGesture] Content:', contentPoint);
      console.log('[TapGesture] Stage:', { scale, tx, ty });

      // Check if we hit a handle of the currently selected layer
      const selectedLayers = getSelectedLayers();
      console.log('[TapGesture] Selected Layers:', selectedLayers.length);

      if (selectedLayers.length === 1) {
        const selectedLayer = selectedLayers[0];
        const handleHit = hitTestHandles(selectedLayer, contentPoint, scale);
        console.log('[TapGesture] Handle Hit:', handleHit);

        if (handleHit) {
          // Tapped a handle, do nothing (don't deselect)
          return;
        }
      }

      const hitLayer = findTopmostLayerAtPoint(document.layers, contentPoint);
      console.log('[TapGesture] Hit Layer:', hitLayer?.id);

      if (hitLayer && !hitLayer.isLocked) {
        selectLayer(hitLayer.id);
        setInteractionMode('transform-layer');
        triggerHapticFeedback('light');
      } else {
        clearSelection();
        setInteractionMode('none');
      }
    },
    [document, selectLayer, clearSelection, setInteractionMode, triggerHapticFeedback, getSelectedLayers, stageScale, stageTranslateX, stageTranslateY]
  );

  const commitLayerTransforms = useCallback(
    (transforms: Record<string, number[]>, onComplete?: () => void) => {
      if (Object.keys(transforms).length > 0) {
        updateSelectedLayersMatrix(transforms);
      }
      if (onComplete) {
        setTimeout(onComplete, 0);
      }
    },
    [updateSelectedLayersMatrix]
  );

  const commitStageTransform = useCallback((transform: { scale: number; translateX: number; translateY: number }) => {
    useCollageStore.getState().setStageTransform(transform);
  }, []);

  const saveStateForUndo = useCallback(() => {
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  const handleDoubleTapZoomIn = useCallback(
    (scale: number, tx: number, ty: number) => {
      commitStageTransform({ scale, translateX: tx, translateY: ty });
    },
    [commitStageTransform]
  );

  const handleDoubleTapZoomReset = useCallback(
    (scale: number, tx: number, ty: number) => {
      commitStageTransform({ scale, translateX: tx, translateY: ty });
    },
    [commitStageTransform]
  );

  const clearActiveTransformsDelayed = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          activeLayerTransforms.value = {};
          initialTransformsShared.value = {};
        });
      });
    });
  }, [activeLayerTransforms, initialTransformsShared]);

  const composedGesture = useMemo(() => {
    try {
      const updateMultiTouchTransform = () => {
        'worklet';
        const activeIds = selectedLayerIdsShared.value;
        const initialTransforms = initialTransformsShared.value;
        const centroid = gestureCentroidShared.value;

        if (!centroid || activeIds.length === 0) return;

        const scale = currentGestureScale.value;
        const rotation = currentGestureRotation.value;

        // Create combined transform: Translate(C) * Rotate * Scale * Translate(-C)
        // Note: Matrix multiplication order matters. We want to Scale, then Rotate (or vice versa, same for uniform scale), relative to centroid.

        const toCentroid = createTranslationMatrixWorklet(-centroid.x, -centroid.y);
        const fromCentroid = createTranslationMatrixWorklet(centroid.x, centroid.y);
        const scaleMatrix = createScaleMatrixWorklet(scale, scale);
        const rotateMatrix = createRotationMatrixWorklet(rotation);

        // Combine: T_back * R * S * T_origin
        let deltaMatrix = multiplyMatricesWorklet(scaleMatrix, toCentroid);
        deltaMatrix = multiplyMatricesWorklet(rotateMatrix, deltaMatrix);
        deltaMatrix = multiplyMatricesWorklet(fromCentroid, deltaMatrix);

        // PERFORMANCE: Mutate in-place to reduce flickering
        // Instead of creating new object, update existing properties
        activeIds.forEach(layerId => {
          const initialMatrix = initialTransforms[layerId];
          if (initialMatrix) {
            activeLayerTransforms.value[layerId] = multiplyMatricesWorklet(deltaMatrix, initialMatrix);
          }
        });
        // Trigger reactivity with shallow copy
        activeLayerTransforms.value = { ...activeLayerTransforms.value };
      };

      // Single tap for selection
      const singleTap = Gesture.Tap()
        .numberOfTaps(1)
        .maxDuration(250)
        .onEnd((e) => {
          runOnJS(handleTapGesture)(e.x, e.y);
        });

      // Double tap for zoom
      const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDelay(300)
        .onEnd((e) => {
          'worklet';
          const { x, y } = e;
          const selectedIds = selectedLayerIdsShared.value;
          const currentScale = stageScale.value;

          if (selectedIds.length > 0) {
            const targetScale = Math.min(currentScale * 2, 5);

            const scaleDelta = targetScale / currentScale;
            const newTx = x - (x - stageTranslateX.value) * scaleDelta;
            const newTy = y - (y - stageTranslateY.value) * scaleDelta;

            stageScale.value = withSpring(targetScale, { damping: 15 });
            stageTranslateX.value = withSpring(newTx, { damping: 15 });
            stageTranslateY.value = withSpring(newTy, { damping: 15 });

            runOnJS(handleDoubleTapZoomIn)(targetScale, newTx, newTy);
          } else {
            const targetScale = 1.0;
            const targetX = 0;
            const targetY = 0;

            stageScale.value = withSpring(targetScale, { damping: 15 });
            stageTranslateX.value = withSpring(targetX, { damping: 15 });
            stageTranslateY.value = withSpring(targetY, { damping: 15 });

            runOnJS(handleDoubleTapZoomReset)(targetScale, targetX, targetY);
          }
        });

      // Long press gesture for resize mode
      const longPress = Gesture.LongPress()
        .minDuration(500) // 500ms minimum
        .maxDistance(10) // Allow 10px of movement
        .onEnd((e) => {
          'worklet';
          const mode = gestureMode.value;

          if (mode === 'transform-layer') {
            runOnJS(triggerHapticFeedback)('medium');
          }
        });

      const pan = Gesture.Pan()
        .minDistance(5) // Minimum 5px movement to start
        .onStart((e) => {
          'worklet';
          if (e.numberOfPointers > 1) return;

          gestureFrameCount.value = 0;
          gestureStartTime.value = performance.now();
          lastFrameLogTime.value = performance.now();

          // Reset shared gesture values
          currentGestureScale.value = 1;
          currentGestureRotation.value = 0;

          // Check for handle hits if a single layer is selected
          let handleHit: HandleType = null;
          if (selectedLayerIdsShared.value.length === 1) {
            const layerId = selectedLayerIdsShared.value[0];
            const layer = layersShared.value.find(l => l.id === layerId);
            if (layer) {
              // Hit test handles
              // We need the point in content space
              const scale = stageScale.value;
              const tx = stageTranslateX.value;
              const ty = stageTranslateY.value;
              const contentX = (e.x - tx) / scale;
              const contentY = (e.y - ty) / scale;

              handleHit = hitTestHandlesWorklet(layer, { x: contentX, y: contentY }, scale);

              if (handleHit) {
                activeHandleShared.value = handleHit;
                if (handleHit === 'rotate') {
                  gestureMode.value = 'rotate-layer';
                } else {
                  gestureMode.value = 'resize-layer';
                }

                // Initialize geometry for resize/rotate
                initialTransformsShared.value = { [layer.id]: layer.matrix };
                const corners = getLayerCornerPointsWorklet(layer.matrix, layer.naturalWidth, layer.naturalHeight);
                const bounds = calculateBoundsFromPointsWorklet(corners);
                if (bounds) {
                  const cx = bounds.x + bounds.width / 2;
                  const cy = bounds.y + bounds.height / 2;
                  gestureCentroidShared.value = { x: cx, y: cy };

                  // Store initial gesture metrics relative to center
                  const dx = contentX - cx;
                  const dy = contentY - cy;
                  initialGestureDistShared.value = Math.hypot(dx, dy);
                  initialGestureAngleShared.value = Math.atan2(dy, dx);
                }

                runOnJS(setInteractionMode)(gestureMode.value as any); // Cast as any if types aren't updated yet
                return; // Exit early, we are handling a handle
              }
            }
          }

          // Normal Pan Logic (Drag)
          if (!handleHit) {
            // Synchronous Hit Testing
            const scale = stageScale.value;
            const tx = stageTranslateX.value;
            const ty = stageTranslateY.value;
            const contentX = (e.x - tx) / scale;
            const contentY = (e.y - ty) / scale;

            const hitLayer = findTopmostLayerAtPointWorklet(layersShared.value, { x: contentX, y: contentY });

            if (hitLayer && !hitLayer.isLocked) {
              gestureMode.value = 'transform-layer';
              selectedLayerIdsShared.value = [hitLayer.id];
              initialTransformsShared.value = { [hitLayer.id]: hitLayer.matrix };

              const corners = getLayerCornerPointsWorklet(hitLayer.matrix, hitLayer.naturalWidth, hitLayer.naturalHeight);
              const bounds = calculateBoundsFromPointsWorklet(corners);
              if (bounds) {
                gestureCentroidShared.value = {
                  x: bounds.x + bounds.width / 2,
                  y: bounds.y + bounds.height / 2,
                };
              }

              // Calculate bounds of other layers for snapping
              const otherBounds: CollageBounds[] = [];
              layersShared.value.forEach(layer => {
                if (layer.id !== hitLayer.id && !layer.isHidden) {
                  const layerCorners = getLayerCornerPointsWorklet(layer.matrix, layer.naturalWidth, layer.naturalHeight);
                  const layerBounds = calculateBoundsFromPointsWorklet(layerCorners);
                  if (layerBounds) {
                    otherBounds.push(layerBounds);
                  }
                }
              });
              otherLayersBoundsShared.value = otherBounds;
              activeLayerDimensionsShared.value = { width: hitLayer.naturalWidth, height: hitLayer.naturalHeight };

              runOnJS(selectLayer)(hitLayer.id);
              runOnJS(setInteractionMode)('transform-layer');
            } else {
              gestureMode.value = 'transform-stage';
              initialStageScale.value = stageScale.value;
              initialStageTranslateX.value = stageTranslateX.value;
              initialStageTranslateY.value = stageTranslateY.value;

              runOnJS(clearSelection)();
              runOnJS(setInteractionMode)('transform-stage');
            }
          }
        })
        .onUpdate((e) => {
          'worklet';
          if (e.numberOfPointers > 1) return;

          gestureFrameCount.value++;
          const now = performance.now();

          // PERFORMANCE LOGGING: Calculate and log FPS every 500ms (dev only)
          if (__DEV__ && now - lastFrameLogTime.value > 500) {
            const elapsed = now - gestureStartTime.value;
            const fps = (gestureFrameCount.value / elapsed) * 1000;

            console.log(
              `[DRAG_FPS] ${fps.toFixed(1)} fps | Mode: ${gestureMode.value} | Frames: ${gestureFrameCount.value}`
            );

            lastFrameLogTime.value = now;
          }

          const mode = gestureMode.value;

          if (mode === 'resize-layer') {
            const activeIds = selectedLayerIdsShared.value;
            const initialTransforms = initialTransformsShared.value;
            const centroid = gestureCentroidShared.value;
            const initialDist = initialGestureDistShared.value;

            if (!centroid || activeIds.length === 0 || initialDist === 0) return;

            // Calculate current distance from center
            const scale = stageScale.value;
            const tx = stageTranslateX.value;
            const ty = stageTranslateY.value;
            const currentContentX = (e.x - tx) / scale;
            const currentContentY = (e.y - ty) / scale;

            const dx = currentContentX - centroid.x;
            const dy = currentContentY - centroid.y;
            const currentDist = Math.hypot(dx, dy);

            // Scale factor
            const scaleFactor = currentDist / initialDist;

            // Apply scale relative to centroid
            const scaleMatrix = createScaleMatrixWorklet(scaleFactor, scaleFactor);
            const toCentroid = createTranslationMatrixWorklet(-centroid.x, -centroid.y);
            const fromCentroid = createTranslationMatrixWorklet(centroid.x, centroid.y);

            let deltaMatrix = multiplyMatricesWorklet(scaleMatrix, toCentroid);
            deltaMatrix = multiplyMatricesWorklet(fromCentroid, deltaMatrix);

            // PERFORMANCE: Mutate in-place to reduce flickering
            activeIds.forEach(layerId => {
              const initialMatrix = initialTransforms[layerId];
              if (initialMatrix) {
                activeLayerTransforms.value[layerId] = multiplyMatricesWorklet(deltaMatrix, initialMatrix);
              }
            });
            // Trigger reactivity with shallow copy
            activeLayerTransforms.value = { ...activeLayerTransforms.value };

          } else if (mode === 'rotate-layer') {
            const activeIds = selectedLayerIdsShared.value;
            const initialTransforms = initialTransformsShared.value;
            const centroid = gestureCentroidShared.value;
            const initialAngle = initialGestureAngleShared.value;

            if (!centroid || activeIds.length === 0) return;

            const scale = stageScale.value;
            const tx = stageTranslateX.value;
            const ty = stageTranslateY.value;
            const currentContentX = (e.x - tx) / scale;
            const currentContentY = (e.y - ty) / scale;

            const dx = currentContentX - centroid.x;
            const dy = currentContentY - centroid.y;
            const currentAngle = Math.atan2(dy, dx);

            const deltaAngle = currentAngle - initialAngle;

            const rotationMatrix = createRotationMatrixWorklet(deltaAngle);
            const toCentroid = createTranslationMatrixWorklet(-centroid.x, -centroid.y);
            const fromCentroid = createTranslationMatrixWorklet(centroid.x, centroid.y);

            let deltaMatrix = multiplyMatricesWorklet(rotationMatrix, toCentroid);
            deltaMatrix = multiplyMatricesWorklet(fromCentroid, deltaMatrix);

            // PERFORMANCE: Mutate in-place to reduce flickering
            activeIds.forEach(layerId => {
              const initialMatrix = initialTransforms[layerId];
              if (initialMatrix) {
                activeLayerTransforms.value[layerId] = multiplyMatricesWorklet(deltaMatrix, initialMatrix);
              }
            });
            // Trigger reactivity with shallow copy
            activeLayerTransforms.value = { ...activeLayerTransforms.value };

          } else if (gestureMode.value === 'transform-layer') {
            const activeIds = selectedLayerIdsShared.value;
            const initialTransforms = initialTransformsShared.value;
            const scale = stageScale.value;

            const deltaX = e.translationX / scale;
            const deltaY = e.translationY / scale;

            // Apply snapping if moving a single layer
            let finalDeltaX = deltaX;
            let finalDeltaY = deltaY;

            if (activeIds.length === 1) {
              const layerId = activeIds[0];
              const initialMatrix = initialTransforms[layerId];
              const dimensions = activeLayerDimensionsShared.value;

              if (initialMatrix && dimensions) {
                // Calculate tentative new bounds
                const tempTranslation = createTranslationMatrixWorklet(deltaX, deltaY);
                const tempMatrix = multiplyMatricesWorklet(tempTranslation, initialMatrix);

                const corners = getLayerCornerPointsWorklet(tempMatrix, dimensions.width, dimensions.height);
                const bounds = calculateBoundsFromPointsWorklet(corners);

                if (bounds) {
                  // PERFORMANCE: Throttle snap calculations to every 2nd frame
                  // Reduces expensive snap algorithm (270+ comparisons) from 60fps to 30fps
                  // Visual smoothness is maintained while cutting computation in half
                  if (snapFrameCounter.value % 2 === 0) {
                    const snapResult = snapToNearbyEdgesWorklet(bounds, otherLayersBoundsShared.value, 3 / scale);

                    if (snapResult.snappedX) {
                      finalDeltaX += snapResult.deltaX;
                    }
                    if (snapResult.snappedY) {
                      finalDeltaY += snapResult.deltaY;
                    }
                    snapLinesShared.value = snapResult.snapLines;
                  }
                  snapFrameCounter.value += 1;
                }
              }
            }

            const translateMatrix = createTranslationMatrixWorklet(finalDeltaX, finalDeltaY);

            // PERFORMANCE: Mutate in-place to reduce flickering
            activeIds.forEach(layerId => {
              const initialMatrix = initialTransforms[layerId];
              if (initialMatrix) {
                activeLayerTransforms.value[layerId] = multiplyMatricesWorklet(translateMatrix, initialMatrix);
              }
            });
            // Trigger reactivity with shallow copy
            activeLayerTransforms.value = { ...activeLayerTransforms.value };
          } else if (gestureMode.value === 'transform-stage') {
            const newTranslateX = initialStageTranslateX.value + e.translationX;
            const newTranslateY = initialStageTranslateY.value + e.translationY;

            const clamped = clampStageTransformWorklet(
              stageScale.value,
              newTranslateX,
              newTranslateY,
              width,
              height,
              width,
              height
            );

            stageTranslateX.value = clamped.translateX;
            stageTranslateY.value = clamped.translateY;
          }

        })
        .onEnd((e) => {
          'worklet';
          const mode = gestureMode.value;

          if (mode === 'transform-layer' || mode === 'resize-layer' || mode === 'rotate-layer') {
            const transforms = activeLayerTransforms.value;
            if (Object.keys(transforms).length > 0) {
              runOnJS(commitLayerTransforms)(transforms);
              runOnJS(clearActiveTransformsDelayed)();
            } else {
              activeLayerTransforms.value = {};
              initialTransformsShared.value = {};
            }
          } else if (mode === 'transform-stage') {
            runOnJS(commitStageTransform)({
              scale: stageScale.value,
              translateX: stageTranslateX.value,
              translateY: stageTranslateY.value,
            });
          }

          gestureMode.value = 'none';
          activeHandleShared.value = null;
          selectedLayerIdsShared.value = [];
          // PERFORMANCE: Reset snap state for next gesture
          snapFrameCounter.value = 0;
          snapLinesShared.value = [];
          gestureCentroidShared.value = null;
          snapLinesShared.value = [];
          otherLayersBoundsShared.value = [];
          activeLayerDimensionsShared.value = null;
          runOnJS(setInteractionMode)('none');
          runOnJS(saveStateForUndo)();
        });


      const pinch = Gesture.Pinch()
        .onStart((e) => {
          'worklet';
          // Reset shared gesture values
          currentGestureScale.value = 1;
          currentGestureRotation.value = 0;

          // Synchronous Hit Testing for Pinch
          // ... (existing hit testing logic) ...

          let targetLayerId: string | null = null;
          if (selectedLayerIdsShared.value.length === 1) {
            targetLayerId = selectedLayerIdsShared.value[0];
          } else {
            const scale = stageScale.value;
            const tx = stageTranslateX.value;
            const ty = stageTranslateY.value;
            const contentX = (e.focalX - tx) / scale;
            const contentY = (e.focalY - ty) / scale;
            const hitLayer = findTopmostLayerAtPointWorklet(layersShared.value, { x: contentX, y: contentY });
            if (hitLayer && !hitLayer.isLocked) {
              targetLayerId = hitLayer.id;
            }
          }

          if (targetLayerId) {
            const layer = layersShared.value.find(l => l.id === targetLayerId);
            if (layer) {
              gestureMode.value = 'transform-layer';
              selectedLayerIdsShared.value = [layer.id];
              initialTransformsShared.value = { [layer.id]: layer.matrix };

              const corners = getLayerCornerPointsWorklet(layer.matrix, layer.naturalWidth, layer.naturalHeight);
              const bounds = calculateBoundsFromPointsWorklet(corners);
              if (bounds) {
                gestureCentroidShared.value = {
                  x: bounds.x + bounds.width / 2,
                  y: bounds.y + bounds.height / 2,
                };
              }
              runOnJS(selectLayer)(layer.id);
              runOnJS(setInteractionMode)('transform-layer');
            }
          } else {
            gestureMode.value = 'transform-stage';
            initialStageScale.value = stageScale.value;
            initialStageTranslateX.value = stageTranslateX.value;
            initialStageTranslateY.value = stageTranslateY.value;
            runOnJS(setInteractionMode)('transform-stage');
          }
        })
        .onUpdate((e) => {
          'worklet';
          const mode = gestureMode.value;

          if (mode === 'transform-stage') {
            // Get CURRENT transform values for focal point calculation
            const currentScale = stageScale.value;
            const currentTx = stageTranslateX.value;
            const currentTy = stageTranslateY.value;

            // Calculate new scale using initial scale (e.scale is relative to gesture start)
            const newScale = initialStageScale.value * e.scale;

            // Preserve the focal point during zoom
            const focalX = e.focalX;
            const focalY = e.focalY;

            // Convert focal point to content space using CURRENT transform
            const contentX = (focalX - currentTx) / currentScale;
            const contentY = (focalY - currentTy) / currentScale;

            // Calculate new translation to keep focal point fixed
            const newTranslateX = focalX - contentX * newScale;
            const newTranslateY = focalY - contentY * newScale;

            const clamped = clampStageTransformWorklet(
              newScale,
              newTranslateX,
              newTranslateY,
              width,
              height,
              width,
              height
            );

            stageScale.value = clamped.scale;
            stageTranslateX.value = clamped.translateX;
            stageTranslateY.value = clamped.translateY;
          } else if (mode === 'transform-layer') {
            currentGestureScale.value = e.scale;
            updateMultiTouchTransform();
          }
        })
        .onEnd(() => {
          'worklet';
          const mode = gestureMode.value;
          // Reset gesture values
          currentGestureScale.value = 1;
          currentGestureRotation.value = 0;

          if (mode === 'transform-layer') {
            const transforms = activeLayerTransforms.value;
            if (Object.keys(transforms).length > 0) {
              runOnJS(commitLayerTransforms)(transforms);
              runOnJS(clearActiveTransformsDelayed)();
            } else {
              activeLayerTransforms.value = {};
              initialTransformsShared.value = {};
            }
          } else if (mode === 'transform-stage') {
            runOnJS(commitStageTransform)({
              scale: stageScale.value,
              translateX: stageTranslateX.value,
              translateY: stageTranslateY.value,
            });
          }

          gestureMode.value = 'none';
          activeHandleShared.value = null;
          selectedLayerIdsShared.value = [];
          gestureCentroidShared.value = null;
          runOnJS(setInteractionMode)('none');
          runOnJS(saveStateForUndo)();
        });

      const rotation = Gesture.Rotation()
        .onStart((e) => {
          'worklet';
          // Reset shared gesture values if starting fresh (though pinch usually starts first or same time)
          if (gestureMode.value === 'none') {
            currentGestureScale.value = 1;
            currentGestureRotation.value = 0;
          }

          if (gestureMode.value === 'none') {
            // Rotation doesn't have focalX/Y in onStart event in all versions? 
            // It usually has anchorX/Y.
            let targetLayerId: string | null = null;
            if (selectedLayerIdsShared.value.length === 1) {
              targetLayerId = selectedLayerIdsShared.value[0];
            } else {
              const scale = stageScale.value;
              const tx = stageTranslateX.value;
              const ty = stageTranslateY.value;
              const contentX = (e.anchorX - tx) / scale;
              const contentY = (e.anchorY - ty) / scale;
              const hitLayer = findTopmostLayerAtPointWorklet(layersShared.value, { x: contentX, y: contentY });
              if (hitLayer && !hitLayer.isLocked) {
                targetLayerId = hitLayer.id;
              }
            }

            if (targetLayerId) {
              const layer = layersShared.value.find(l => l.id === targetLayerId);
              if (layer) {
                gestureMode.value = 'transform-layer';
                selectedLayerIdsShared.value = [layer.id];
                initialTransformsShared.value = { [layer.id]: layer.matrix };

                const corners = getLayerCornerPointsWorklet(layer.matrix, layer.naturalWidth, layer.naturalHeight);
                const bounds = calculateBoundsFromPointsWorklet(corners);
                if (bounds) {
                  gestureCentroidShared.value = {
                    x: bounds.x + bounds.width / 2,
                    y: bounds.y + bounds.height / 2,
                  };
                }
                runOnJS(selectLayer)(layer.id);
                runOnJS(setInteractionMode)('transform-layer');
              }
            }
          }
        })
        .onUpdate((e) => {
          'worklet';
          if (gestureMode.value === 'transform-layer') {
            currentGestureRotation.value = e.rotation;
            updateMultiTouchTransform();
          }
        })
        .onEnd(() => {
          'worklet';
          // We rely on Pinch.onEnd to clean up usually, as they are simultaneous.
          // But if Rotation ends last, we should clean up.
          // However, if Pinch is still active, we shouldn't kill the transform.
          // Gesture.Simultaneous doesn't guarantee common onEnd.
          // Actually, if one ends, the other might continue.
          // If Rotation ends but Pinch continues, we just want rotation to stick?
          // No, 'e.rotation' resets? No, onEnd means the gesture is over.
          // If I lift one finger, rotation ends but pinch might become pan?
          // This is complex.
          // Simplified approach: Just reset the rotation contribution to 0?
          // No, that would snap back.
          // Correct approach: Commit the transform so far, and restart the other gesture?
          // Or simpler: Just let them run. If one ends, we just stop updating that value.
          // BUT, if rotation ends, 'currentGestureRotation' is still holding the last value.
          // If I lift fingers, both end.
          // If I lift one finger, both End (usually).
          // So duplicate cleanup is fine as long as it's idempotent.

          // We will just do nothing here and let Pinch.onEnd handle the cleanup, 
          // OR if Pinch is not active, we handle it.
          // But Pinch is almost always active with Rotation (2 fingers).
          // Let's duplicate the cleanup just in case, but guard it?
          // Actually, if we clean up here, and Pinch is still running, we break Pinch.
          // So we should only clean up if Pinch is NOT running.
          // But we don't know that easily.
          // Safe bet: Do nothing in Rotation.onEnd and rely on Pinch.onEnd.
          // What if I only Rotate (is that possible without Pinch? No, 2 fingers = Pinch).
          // So Pinch is the master.

          // Wait, if I use 2 fingers, Pinch AND Rotation start.
          // If I lift both, both End.
          // If I lift one, both End (usually).
          // So duplicate cleanup is fine as long as it's idempotent.

          const mode = gestureMode.value;
          if (mode !== 'none') {
            // If we are the last one ending?
            // Let's just leave it empty and trust Pinch.onEnd.
            // Most 2-finger gestures trigger Pinch.
          }
        });

      // Compose gestures properly:
      // - Double tap takes priority over single tap
      // - Pinch and rotation can happen simultaneously (2+ fingers)
      // - Pan should NOT conflict with pinch/rotation
      // - Taps have priority (quick action)

      // Enable all gestures
      pan.enabled(true);
      pinch.enabled(true);
      rotation.enabled(true);
      singleTap.enabled(true);
      doubleTap.enabled(true);
      longPress.enabled(true);

      // Configure gesture relationships
      pan.shouldCancelWhenOutside(false);
      longPress.shouldCancelWhenOutside(false);

      // Compose taps: double-tap should be exclusive with single-tap
      const taps = Gesture.Exclusive(doubleTap, singleTap);

      // Multi-touch gestures (pinch + rotation)
      const multiTouchTransforms = Gesture.Simultaneous(pinch, rotation);

      // Main gestures that can work together
      const mainGestures = Gesture.Simultaneous(pan, multiTouchTransforms);

      // Compose with tap having priority (Race means first one wins)
      const composedGesture = Gesture.Race(
        taps,
        longPress,
        mainGestures
      );

      // Only enable gestures when ready
      return gesturesReady ? composedGesture : Gesture.Manual();
    } catch {
      // Return a manual gesture as fallback
      return Gesture.Manual();
    }
  }, [
    width,
    height,
    handleTapGesture,
    commitLayerTransforms,
    commitStageTransform,
    saveStateForUndo,
    setInteractionMode,
    activeLayerTransforms,
    gestureMode,
    selectedLayerIdsShared,
    initialTransformsShared,
    gestureCentroidShared,
    initialStageScale,
    initialStageTranslateX,
    initialStageTranslateY,
    stageScale,
    stageTranslateX,
    stageTranslateY,
    gestureFrameCount,
    gestureStartTime,
    lastFrameLogTime,
    gesturesReady,
    triggerHapticFeedback,
    handleDoubleTapZoomIn,
    handleDoubleTapZoomReset,
    clearActiveTransformsDelayed,
  ]);

  return {
    selectionBounds: null,
    isExporting,
    exportAsPng,
    composedGesture,
    restoreDraft,
    clearDraft,
    activeLayerTransforms,
    stageTransformShared: {
      scale: stageScale,
      translateX: stageTranslateX,
      translateY: stageTranslateY,
    },
    snapLinesShared,
  };
};

