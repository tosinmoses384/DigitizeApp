import React, { useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { useCollageCanvasOptimized } from '../../hooks/use-collage-canvas-optimized';
import { useCollageStore } from '../../stores/collage-store';
import type { CanvasRef } from '@shopify/react-native-skia';

interface CollageCanvasProps {
  width?: number;
  height?: number;
  onExportReady?: (uri: string) => void;
  onExportError?: (error: string) => void;
  useOptimizedGestures?: boolean;
  onCanvasReady?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CollageCanvas = React.memo(
  forwardRef<CanvasRef, CollageCanvasProps>(
    (
      {
        width = SCREEN_WIDTH,
        height = SCREEN_HEIGHT * 0.7,
        onExportReady,
        onExportError,
        useOptimizedGestures = true,
        onCanvasReady,
      },
      forwardedRef
    ) => {
      const canvasViewRef = useAnimatedRef<View>();
      const skiaCanvasRef = React.useRef<CanvasRef>(null);

      useImperativeHandle(forwardedRef, () => skiaCanvasRef.current as CanvasRef);

      const {
        document,
        initializeDocument,
        stageTransform,
        updateLayerDimensions,
      } = useCollageStore();

      const {
        composedGesture,
        activeLayerTransforms,
        stageTransformShared,
      } = useCollageCanvasOptimized({
        width,
        height,
        enableAutoSave: true,
        autoSaveInterval: 3000,
      });

      useEffect(() => {
        if (!document) {
          initializeDocument(width, height);
        }
      }, [document, initializeDocument, width, height]);

      const layers = useMemo(() => {
        return document?.layers || [];
      }, [document?.layers]);

      if (!document) {
        return null;
      }

      return (
        <View style={[styles.container, { width, height }]}>
          <GestureDetector gesture={composedGesture}>
            <Animated.View ref={canvasViewRef} style={styles.canvasContainer}>
              {(() => {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  const SkiaCollageCanvas = require('./SkiaCollageCanvas').default as React.ComponentType<any>;
                  return (
                    <SkiaCollageCanvas
                      ref={skiaCanvasRef}
                      width={width}
                      height={height}
                      layers={layers}
                      backgroundColor={document.backgroundColor}
                      transparent={document.transparent}
                      onCanvasReady={onCanvasReady}
                      onLayerDimensionsDetected={updateLayerDimensions}
                      stageTransform={useOptimizedGestures ? undefined : stageTransform}
                      stageTransformShared={useOptimizedGestures ? stageTransformShared : undefined}
                      activeLayerTransforms={useOptimizedGestures ? activeLayerTransforms : undefined}
                      selectedLayerIds={document.selection}
                    />
                  );
                } catch {
                  return null;
                }
              })()}
            </Animated.View>
          </GestureDetector>
        </View>
      );
    }
  )
);

CollageCanvas.displayName = 'CollageCanvas';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
});

export default CollageCanvas;

