import { useRef, useCallback, useMemo } from 'react';
import { useSharedValue, runOnJS, useDerivedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { SharedValue } from 'react-native-reanimated';

export interface LayerTransformState {
  layerId: string;
  matrix: number[];
  initialMatrix: number[];
  isActive: boolean;
}

export interface GestureState {
  mode: 'none' | 'transform-layer' | 'transform-stage';
  activeLayerIds: string[];
  centroid: { x: number; y: number } | null;
}

interface UseCollageGestureStateResult {
  gestureState: SharedValue<GestureState>;
  activeLayerTransforms: SharedValue<Record<string, number[]>>;
  stageTransformShared: {
    scale: SharedValue<number>;
    translateX: SharedValue<number>;
    translateY: SharedValue<number>;
  };
  setGestureState: (state: Partial<GestureState>) => void;
  updateActiveLayerTransform: (layerId: string, matrix: number[]) => void;
  resetActiveTransforms: () => void;
  commitTransformsToStore: () => void;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => void;
}

interface UseCollageGestureStateOptions {
  onCommit: (transforms: Record<string, number[]>) => void;
  onStageTransformCommit: (transform: { scale: number; translateX: number; translateY: number }) => void;
}

export const useCollageGestureState = (
  options: UseCollageGestureStateOptions
): UseCollageGestureStateResult => {
  const { onCommit, onStageTransformCommit } = options;

  const gestureState = useSharedValue<GestureState>({
    mode: 'none',
    activeLayerIds: [],
    centroid: null,
  });

  const activeLayerTransforms = useSharedValue<Record<string, number[]>>({});

  const stageScale = useSharedValue(1);
  const stageTranslateX = useSharedValue(0);
  const stageTranslateY = useSharedValue(0);

  const initialTransformsRef = useRef<Record<string, number[]>>({});

  const setGestureState = useCallback((state: Partial<GestureState>) => {
    'worklet';
    gestureState.value = {
      ...gestureState.value,
      ...state,
    };
  }, [gestureState]);

  const updateActiveLayerTransform = useCallback((layerId: string, matrix: number[]) => {
    'worklet';
    activeLayerTransforms.value = {
      ...activeLayerTransforms.value,
      [layerId]: matrix,
    };
  }, [activeLayerTransforms]);

  const resetActiveTransforms = useCallback(() => {
    'worklet';
    activeLayerTransforms.value = {};
    initialTransformsRef.current = {};
  }, [activeLayerTransforms]);

  const commitTransformsToStore = useCallback(() => {
    const transforms = activeLayerTransforms.value;
    if (Object.keys(transforms).length > 0) {
      runOnJS(onCommit)(transforms);
      resetActiveTransforms();
    }

    const stageTransform = {
      scale: stageScale.value,
      translateX: stageTranslateX.value,
      translateY: stageTranslateY.value,
    };
    runOnJS(onStageTransformCommit)(stageTransform);
  }, [activeLayerTransforms, stageScale, stageTranslateX, stageTranslateY, onCommit, onStageTransformCommit, resetActiveTransforms]);

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    const feedbackStyle = 
      type === 'light' ? Haptics.ImpactFeedbackStyle.Light :
      type === 'medium' ? Haptics.ImpactFeedbackStyle.Medium :
      Haptics.ImpactFeedbackStyle.Heavy;
    
    runOnJS(Haptics.impactAsync)(feedbackStyle);
  }, []);

  const result: UseCollageGestureStateResult = useMemo(() => ({
    gestureState,
    activeLayerTransforms,
    stageTransformShared: {
      scale: stageScale,
      translateX: stageTranslateX,
      translateY: stageTranslateY,
    },
    setGestureState,
    updateActiveLayerTransform,
    resetActiveTransforms,
    commitTransformsToStore,
    triggerHaptic,
  }), [
    gestureState,
    activeLayerTransforms,
    stageScale,
    stageTranslateX,
    stageTranslateY,
    setGestureState,
    updateActiveLayerTransform,
    resetActiveTransforms,
    commitTransformsToStore,
    triggerHaptic,
  ]);

  return result;
};

