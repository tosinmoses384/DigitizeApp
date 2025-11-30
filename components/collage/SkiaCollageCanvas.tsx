import React, { useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Group, Image, Rect, useImage, useCanvasRef, Path, Skia, Paint, Circle, Shader } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withSpring } from 'react-native-reanimated';
import type { CanvasRef } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';
import type { CollageLayer, SnapLine } from '../../types/collage';
import { composeStageMatrixWorklet, getLayerCornerPointsWorklet, calculateBoundsFromPointsWorklet } from '../../utils/collage-geometry-worklets';

interface SkiaCollageCanvasProps {
  width: number;
  height: number;
  layers: CollageLayer[];
  backgroundColor?: string;
  transparent?: boolean;
  onCanvasReady?: () => void;
  onLayerDimensionsDetected?: (layerId: string, width: number, height: number) => void;
  stageTransform?: { scale: number; translateX: number; translateY: number };
  stageTransformShared?: {
    scale: SharedValue<number>;
    translateX: SharedValue<number>;
    translateY: SharedValue<number>;
  };
  activeLayerTransforms?: SharedValue<Record<string, number[]>>;
  selectedLayerIds?: string[];
  snapLinesShared?: SharedValue<SnapLine[]>;
}

interface LayerImageProps {
  layer: CollageLayer;
  isSelected: boolean;
  activeLayerTransforms?: SharedValue<Record<string, number[]>>;
  onDimensionsDetected?: (layerId: string, width: number, height: number) => void;
}

const checkerboardSource = Skia.RuntimeEffect.Make(`
uniform float size;
uniform vec4 color1;
uniform vec4 color2;

vec4 main(vec2 pos) {
  vec2 coord = floor(pos / size);
  float mask = mod(coord.x + coord.y, 2.0);
  return mix(color1, color2, mask);
}
`)!;

// PERFORMANCE: Pre-define shader uniforms to avoid recreation on every render
const checkerboardUniforms = {
  size: 8,
  color1: Float32Array.from([0.91, 0.91, 0.91, 1]), // #E8E8E8
  color2: Float32Array.from([0.96, 0.96, 0.96, 1]), // #F5F5F5
};

// Material Design "rotate-right" icon path (24x24 viewbox)
const ROTATION_ICON_PATH = Skia.Path.MakeFromSVGString(
  'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z'
)!;

const LayerImage: React.FC<LayerImageProps> = ({
  layer,
  isSelected = false,
  activeLayerTransforms,
  onDimensionsDetected,
}) => {
  const imageUri = layer.cachedUri || layer.uri;
  const skiaImage = useImage(imageUri);

  const cachedWidth = layer.cachedSize?.width ?? layer.naturalWidth;
  const cachedHeight = layer.cachedSize?.height ?? layer.naturalHeight;

  const renderWidth = cachedWidth;
  const renderHeight = cachedHeight;

  const originX = -renderWidth * layer.transform.anchorX;
  const originY = -renderHeight * layer.transform.anchorY;

  const paint = useMemo(() => {
    const p = Skia.Paint();
    p.setAlphaf(layer.opacity);
    return p;
  }, [layer.opacity]);

  const entryScale = useSharedValue(0);

  // Track if we've already detected dimensions for this layer
  const dimensionsDetectedRef = React.useRef(false);

  const shouldShowCheckerboard = isSelected && layer.backgroundRemoved;

  useEffect(() => {
    entryScale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  // Detect actual dimensions for background-removed images (run only once)
  useEffect(() => {
    // Skip if already detected or conditions not met
    if (dimensionsDetectedRef.current) return;
    if (!skiaImage || !layer.backgroundRemoved || !onDimensionsDetected) return;

    const actualWidth = skiaImage.width();
    const actualHeight = skiaImage.height();

    // Only notify if dimensions are different from current layer dimensions
    if (actualWidth !== layer.naturalWidth || actualHeight !== layer.naturalHeight) {
      if (__DEV__) {
        console.log(`[SkiaCanvas] Detected dimensions for layer ${layer.id}:`, {
          skiaWidth: actualWidth,
          skiaHeight: actualHeight,
          layerWidth: layer.naturalWidth,
          layerHeight: layer.naturalHeight,
        });
      }

      onDimensionsDetected(layer.id, actualWidth, actualHeight);
      dimensionsDetectedRef.current = true;
    }
  }, [skiaImage, layer.backgroundRemoved, onDimensionsDetected, layer.id, layer.naturalWidth, layer.naturalHeight]);

  // PERFORMANCE: Only create useDerivedValue for actively selected layers
  // Non-selected layers use static matrix without creating unnecessary mappers
  const matrix = useDerivedValue(() => {
    'worklet';
    // Early return for non-selected layers - avoids unnecessary reactivity
    if (!isSelected || !activeLayerTransforms) {
      return layer.matrix;
    }
    // Only check activeLayerTransforms for selected layers
    const activeMatrix = activeLayerTransforms.value[layer.id];
    return activeMatrix ?? layer.matrix;
  }, [layer.id, layer.matrix, isSelected]);

  const opacity = useDerivedValue(() => {
    return layer.opacity * entryScale.value;
  }, [layer, entryScale]);

  if (!skiaImage) {
    return null;
  }

  return (
    <Group
      matrix={matrix}
      opacity={opacity}
    >
      {shouldShowCheckerboard && (
        <Rect x={0} y={0} width={renderWidth} height={renderHeight}>
          <Shader
            source={checkerboardSource}
            uniforms={checkerboardUniforms}
          />
        </Rect>
      )}
      <Image
        image={skiaImage}
        x={0}
        y={0}
        width={renderWidth}
        height={renderHeight}
        fit="contain"
      />
    </Group>
  );
};

LayerImage.displayName = 'LayerImage';

const SelectionOverlay: React.FC<{
  layer: CollageLayer;
  activeLayerTransforms?: SharedValue<Record<string, number[]>>;
  stageScale?: SharedValue<number>;
}> = ({ layer, activeLayerTransforms, stageScale }) => {
  const renderWidth = layer.cachedSize?.width || layer.naturalWidth;
  const renderHeight = layer.cachedSize?.height || layer.naturalHeight;

  // PERFORMANCE: Consolidated all geometry calculations into ONE useDerivedValue
  // This reduces from 8 separate mappers to 1, significantly improving UI thread performance
  const overlayGeometry = useDerivedValue(() => {
    'worklet';
    // Get current matrix (active or base)
    let currentMatrix = layer.matrix;
    if (activeLayerTransforms) {
      const active = activeLayerTransforms.value[layer.id];
      if (active) currentMatrix = active;
    }

    // Calculate scale-adjusted dimensions
    const scale = stageScale?.value ?? 1;
    const handleRadius = 10 / scale;
    const strokeWidth = 2 / scale;

    // Helper to transform point
    const transform = (x: number, y: number) => {
      const tx = currentMatrix[0] * x + currentMatrix[1] * y + currentMatrix[2];
      const ty = currentMatrix[3] * x + currentMatrix[4] * y + currentMatrix[5];
      return { x: tx, y: ty };
    };

    // Calculate all corner positions
    const tl = transform(0, 0);
    const tr = transform(renderWidth, 0);
    const br = transform(renderWidth, renderHeight);
    const bl = transform(0, renderHeight);

    // Rotation handle (top center - 40px up for better visibility/Canva-like feel)
    const rot = transform(renderWidth / 2, -40);
    const topCenter = transform(renderWidth / 2, 0);

    // Create paths once
    // Selection Box Path
    const selectionPath = Skia.Path.Make();
    selectionPath.moveTo(tl.x, tl.y);
    selectionPath.lineTo(tr.x, tr.y);
    selectionPath.lineTo(br.x, br.y);
    selectionPath.lineTo(bl.x, bl.y);
    selectionPath.close();

    // Connection Line Path (Hanger style)
    const rotationLinePath = Skia.Path.Make();
    rotationLinePath.moveTo(topCenter.x, topCenter.y);
    rotationLinePath.lineTo(rot.x, rot.y);

    return {
      corners: { tl, tr, br, bl },
      rotationHandle: rot,
      handleRadius,
      strokeWidth,
      selectionPath,
      rotationLinePath,
    };
  }, [layer, renderWidth, renderHeight, stageScale]);

  // Pre-defined corners array to avoid recreation
  const cornerKeys = useMemo(() => ['tl', 'tr', 'br', 'bl'] as const, []);

  return (
    <Group>
      {/* Selection Border */}
      <Path
        path={useDerivedValue(() => overlayGeometry.value.selectionPath)}
        style="stroke"
        strokeWidth={useDerivedValue(() => overlayGeometry.value.strokeWidth)}
        color="#007AFF"
      />

      {/* Connection Line */}
      <Path
        path={useDerivedValue(() => overlayGeometry.value.rotationLinePath)}
        style="stroke"
        strokeWidth={useDerivedValue(() => overlayGeometry.value.strokeWidth)}
        color="#007AFF"
      />

      {/* Corner Handles */}
      {cornerKeys.map((corner) => (
        <Group key={corner}>
          <Circle
            cx={useDerivedValue(() => overlayGeometry.value.corners[corner].x)}
            cy={useDerivedValue(() => overlayGeometry.value.corners[corner].y)}
            r={useDerivedValue(() => overlayGeometry.value.handleRadius)}
            color="white"
          />
          <Circle
            cx={useDerivedValue(() => overlayGeometry.value.corners[corner].x)}
            cy={useDerivedValue(() => overlayGeometry.value.corners[corner].y)}
            r={useDerivedValue(() => overlayGeometry.value.handleRadius)}
            color="#007AFF"
            style="stroke"
            strokeWidth={useDerivedValue(() => overlayGeometry.value.strokeWidth)}
          />
        </Group>
      ))}

      {/* Rotation Handle */}
      <Group>
        {/* White background circle */}
        <Circle
          cx={useDerivedValue(() => overlayGeometry.value.rotationHandle.x)}
          cy={useDerivedValue(() => overlayGeometry.value.rotationHandle.y)}
          r={useDerivedValue(() => overlayGeometry.value.handleRadius * 1.2)} // Slightly larger for the icon
          color="white"
        />
        {/* Blue border */}
        <Circle
          cx={useDerivedValue(() => overlayGeometry.value.rotationHandle.x)}
          cy={useDerivedValue(() => overlayGeometry.value.rotationHandle.y)}
          r={useDerivedValue(() => overlayGeometry.value.handleRadius * 1.2)}
          color="#007AFF"
          style="stroke"
          strokeWidth={useDerivedValue(() => overlayGeometry.value.strokeWidth)}
        />
        {/* Rotation Icon */}
        <Path
          path={ROTATION_ICON_PATH}
          color="#007AFF"
          style="fill"
          transform={useDerivedValue(() => {
            const { x, y } = overlayGeometry.value.rotationHandle;
            const scale = overlayGeometry.value.handleRadius * 0.08; // Scale down the 24x24 icon
            return [
              { translateX: x - 12 * scale }, // Center the 24x24 icon
              { translateY: y - 12 * scale },
              { scale: scale },
            ];
          })}
        />
      </Group>
    </Group>
  );
};

const SnapLinesRenderer: React.FC<{ lines: SharedValue<SnapLine[]>; stageScale?: SharedValue<number> }> = ({ lines, stageScale }) => {
  const strokeWidth = useDerivedValue(() => {
    const baseWidth = 1.5;
    const scale = stageScale?.value ?? 1;
    return baseWidth / scale;
  }, [stageScale]);

  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    lines.value.forEach(line => {
      p.moveTo(line.x1, line.y1);
      p.lineTo(line.x2, line.y2);
    });
    return p;
  }, [lines]);

  return (
    <Path
      path={path}
      style="stroke"
      strokeWidth={strokeWidth}
      color="#007AFF"
    />
  );
};

/**
 * PERFORMANCE: Helper to check if a layer is visible in the viewport
 * Skips rendering off-screen layers to reduce GPU load
 */
const isLayerVisibleInViewport = (
  layer: CollageLayer,
  viewportBounds: { x: number; y: number; width: number; height: number },
  margin: number = 100 // Add margin to prevent pop-in during pan
): boolean => {
  'worklet';

  const corners = getLayerCornerPointsWorklet(
    layer.matrix,
    layer.naturalWidth,
    layer.naturalHeight
  );

  const layerBounds = calculateBoundsFromPointsWorklet(corners);

  // Safety: render if bounds calculation fails
  if (!layerBounds) return true;

  // Check if layer bounds intersect viewport (with margin)
  return !(
    layerBounds.x + layerBounds.width < viewportBounds.x - margin ||      // Layer is left of viewport
    layerBounds.y + layerBounds.height < viewportBounds.y - margin ||    // Layer is above viewport
    layerBounds.x > viewportBounds.x + viewportBounds.width + margin ||  // Layer is right of viewport
    layerBounds.y > viewportBounds.y + viewportBounds.height + margin    // Layer is below viewport
  );
};

const SkiaCollageCanvas = React.memo(
  forwardRef<CanvasRef, SkiaCollageCanvasProps>(
    (
      {
        width,
        height,
        layers,
        backgroundColor = '#FFFFFF',
        transparent = true,
        onCanvasReady,
        onLayerDimensionsDetected,
        stageTransform,
        stageTransformShared,
        activeLayerTransforms,
        selectedLayerIds = [],
        snapLinesShared,
      },
      forwardedRef
    ) => {
      const internalRef = useCanvasRef();

      useImperativeHandle(forwardedRef, () => internalRef.current as CanvasRef);

      useEffect(() => {
        if (internalRef.current && onCanvasReady) {
          onCanvasReady();
        }
      }, [internalRef, onCanvasReady]);

      const sortedLayers = layers.slice().sort((a, b) => a.zIndex - b.zIndex);

      // PERFORMANCE: Calculate viewport bounds for culling off-screen layers
      const viewportBounds = useDerivedValue(() => {
        'worklet';
        const scale = stageTransformShared?.scale.value ?? 1;
        const tx = stageTransformShared?.translateX.value ?? 0;
        const ty = stageTransformShared?.translateY.value ?? 0;

        return {
          x: -tx / scale,
          y: -ty / scale,
          width: width / scale,
          height: height / scale,
        };
      }, [stageTransformShared?.scale, stageTransformShared?.translateX, stageTransformShared?.translateY, width, height]);

      // PERFORMANCE: Filter out layers that are not visible in viewport
      // Exception: Always render selected layers (even if off-screen) for UX
      const visibleLayers = useMemo(() => {
        return sortedLayers.filter(layer => {
          if (layer.isHidden) return false;

          // Always render selected layers (they might be off-screen but need handles visible)
          if (selectedLayerIds.includes(layer.id)) return true;

          // Check if layer is in viewport
          return isLayerVisibleInViewport(layer, viewportBounds.value);
        });
      }, [sortedLayers, viewportBounds, selectedLayerIds]);

      const stageMatrixDerived = useDerivedValue(() => {
        'worklet';
        if (stageTransformShared) {
          const scale = stageTransformShared.scale.value;
          const tx = stageTransformShared.translateX.value;
          const ty = stageTransformShared.translateY.value;

          return composeStageMatrixWorklet(scale, tx, ty);
        } else {
          const scale = stageTransform?.scale ?? 1;
          const tx = stageTransform?.translateX ?? 0;
          const ty = stageTransform?.translateY ?? 0;

          return composeStageMatrixWorklet(scale, tx, ty);
        }
      }, [stageTransform, stageTransformShared]);

      return (
        <Canvas
          style={[styles.canvas, { width, height }]}
          ref={internalRef}
        >
          <Group matrix={stageMatrixDerived}>
            {!transparent && (
              <Rect
                x={0}
                y={0}
                width={width}
                height={height}
                color={backgroundColor}
              />
            )}

            {visibleLayers.map((layer) => (
              <LayerImage
                key={layer.id}
                layer={layer}
                isSelected={selectedLayerIds.includes(layer.id)}
                activeLayerTransforms={activeLayerTransforms}
                onDimensionsDetected={onLayerDimensionsDetected}
              />
            ))}

            {/* Selection Overlays (Rendered on top of all layers) */}
            {sortedLayers.filter(l => selectedLayerIds.includes(l.id)).map(layer => (
              <SelectionOverlay
                key={`selection-${layer.id}`}
                layer={layer}
                activeLayerTransforms={activeLayerTransforms}
                stageScale={stageTransformShared?.scale}
              />
            ))}

            {/* Snap Lines */}
            {snapLinesShared && <SnapLinesRenderer lines={snapLinesShared} stageScale={stageTransformShared?.scale} />}
          </Group>
        </Canvas>
      );
    }
  )
);

SkiaCollageCanvas.displayName = 'SkiaCollageCanvas';

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: 'transparent',
  },
});

export default SkiaCollageCanvas;
