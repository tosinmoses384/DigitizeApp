import type { CollagePoint, CollageLayer, CollageBounds } from '../types/collage';

export const createIdentityMatrixWorklet = (): number[] => {
  'worklet';
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
};

export const createTranslationMatrixWorklet = (x: number, y: number): number[] => {
  'worklet';
  return [1, 0, x, 0, 1, y, 0, 0, 1];
};

export const createScaleMatrixWorklet = (sx: number, sy: number): number[] => {
  'worklet';
  return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
};

export const createRotationMatrixWorklet = (angle: number): number[] => {
  'worklet';
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [cos, -sin, 0, sin, cos, 0, 0, 0, 1];
};

export const multiplyMatricesWorklet = (a: number[], b: number[]): number[] => {
  'worklet';
  const result = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        result[i * 3 + j] += a[i * 3 + k] * b[k * 3 + j];
      }
    }
  }
  return result;
};

export const transformPointByMatrixWorklet = (
  point: CollagePoint,
  matrix: number[]
): CollagePoint => {
  'worklet';
  const x = matrix[0] * point.x + matrix[1] * point.y + matrix[2];
  const y = matrix[3] * point.x + matrix[4] * point.y + matrix[5];
  return { x, y };
};

export const clampStageTransformWorklet = (
  scale: number,
  translateX: number,
  translateY: number,
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number
): { scale: number; translateX: number; translateY: number } => {
  'worklet';
  const clampedScale = Math.max(0.4, Math.min(4.0, scale));

  const scaledContentWidth = contentWidth * clampedScale;
  const scaledContentHeight = contentHeight * clampedScale;

  const maxOffsetX = viewportWidth * 0.3;
  const maxOffsetY = viewportHeight * 0.3;

  const minTranslateX = -scaledContentWidth + viewportWidth - maxOffsetX;
  const maxTranslateX = maxOffsetX;
  const minTranslateY = -scaledContentHeight + viewportHeight - maxOffsetY;
  const maxTranslateY = maxOffsetY;

  const clampedTranslateX = Math.max(
    minTranslateX,
    Math.min(maxTranslateX, translateX)
  );
  const clampedTranslateY = Math.max(
    minTranslateY,
    Math.min(maxTranslateY, translateY)
  );

  return {
    scale: clampedScale,
    translateX: clampedTranslateX,
    translateY: clampedTranslateY,
  };
};

export const composeMatrixWorklet = (
  x: number,
  y: number,
  scale: number,
  rotation: number,
  anchorX: number,
  anchorY: number,
  naturalWidth: number,
  naturalHeight: number
): number[] => {
  'worklet';
  const anchorPixelX = naturalWidth * anchorX;
  const anchorPixelY = naturalHeight * anchorY;

  const translateToOrigin = createTranslationMatrixWorklet(-anchorPixelX, -anchorPixelY);
  const scaleMatrix = createScaleMatrixWorklet(scale, scale);
  const rotateMatrix = createRotationMatrixWorklet(rotation);
  const translateBack = createTranslationMatrixWorklet(x, y);

  let matrix = translateToOrigin;
  matrix = multiplyMatricesWorklet(scaleMatrix, matrix);
  matrix = multiplyMatricesWorklet(rotateMatrix, matrix);
  matrix = multiplyMatricesWorklet(translateBack, matrix);

  return matrix;
};

export const getLayerCornerPointsWorklet = (
  matrix: number[],
  naturalWidth: number,
  naturalHeight: number
): CollagePoint[] => {
  'worklet';
  const corners: CollagePoint[] = [
    { x: 0, y: 0 },
    { x: naturalWidth, y: 0 },
    { x: naturalWidth, y: naturalHeight },
    { x: 0, y: naturalHeight },
  ];

  return corners.map((corner) => transformPointByMatrixWorklet(corner, matrix));
};

export const calculateBoundsFromPointsWorklet = (
  points: CollagePoint[]
): { x: number; y: number; width: number; height: number } | null => {
  'worklet';
  if (points.length === 0) {
    return null;
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const composeStageMatrixWorklet = (
  scale: number,
  translateX: number,
  translateY: number
): number[] => {
  'worklet';

  const scaleMatrix = [scale, 0, 0, 0, scale, 0, 0, 0, 1];
  const translateMatrix = [1, 0, translateX, 0, 1, translateY, 0, 0, 1];

  const result = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        result[i * 3 + j] += translateMatrix[i * 3 + k] * scaleMatrix[k * 3 + j];
      }
    }
  }

  return result;
};


export const getLayerWorldBoundsWorklet = (layer: CollageLayer): CollageBounds => {
  'worklet';
  const { matrix, naturalWidth, naturalHeight } = layer;

  const corners: CollagePoint[] = [
    { x: 0, y: 0 },
    { x: naturalWidth, y: 0 },
    { x: naturalWidth, y: naturalHeight },
    { x: 0, y: naturalHeight },
  ];

  const transformedCorners = corners.map((corner) =>
    transformPointByMatrixWorklet(corner, matrix)
  );

  const xs = transformedCorners.map((p) => p.x);
  const ys = transformedCorners.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const isPointInBoundsWorklet = (
  point: CollagePoint,
  bounds: CollageBounds
): boolean => {
  'worklet';
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
};

export const hitTestLayerWorklet = (
  layer: CollageLayer,
  point: CollagePoint
): boolean => {
  'worklet';
  const bounds = getLayerWorldBoundsWorklet(layer);
  return isPointInBoundsWorklet(point, bounds);
};

export const findTopmostLayerAtPointWorklet = (
  layers: CollageLayer[],
  point: CollagePoint
): CollageLayer | null => {
  'worklet';
  // We need to sort manually or assume they are sorted. 
  // Array.sort might not be available or efficient in worklet if complex.
  // But layers is a JS array passed via shared value.
  // Let's assume we iterate in reverse order (top to bottom) if they are render-ordered.
  // Render order: index 0 is bottom.
  // So we iterate from end to start.

  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    if (!layer.isHidden && hitTestLayerWorklet(layer, point)) {
      return layer;
    }
  }

  return null;
};

export type HandleType = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'rotate' | null;

export const hitTestHandlesWorklet = (
  layer: CollageLayer,
  point: CollagePoint,
  scale: number // Current stage scale to adjust hit radius
): HandleType => {
  'worklet';
  const { matrix, naturalWidth, naturalHeight } = layer;
  const hitRadius = 25 / scale; // 25px touch target for corners, adjusted for zoom
  const rotateHitRadius = 44 / scale; // 44px touch target for rotation, adjusted for zoom

  // Calculate handle positions in world space
  const corners = [
    { x: 0, y: 0 }, // Top-Left
    { x: naturalWidth, y: 0 }, // Top-Right
    { x: naturalWidth, y: naturalHeight }, // Bottom-Right
    { x: 0, y: naturalHeight }, // Bottom-Left
  ];

  const transformedCorners = corners.map(c => transformPointByMatrixWorklet(c, matrix));

  // Check corners
  if (Math.hypot(point.x - transformedCorners[0].x, point.y - transformedCorners[0].y) < hitRadius) return 'top-left';
  if (Math.hypot(point.x - transformedCorners[1].x, point.y - transformedCorners[1].y) < hitRadius) return 'top-right';
  if (Math.hypot(point.x - transformedCorners[2].x, point.y - transformedCorners[2].y) < hitRadius) return 'bottom-right';
  if (Math.hypot(point.x - transformedCorners[3].x, point.y - transformedCorners[3].y) < hitRadius) return 'bottom-left';

  // Check rotation handle (Top center - 20px)
  // We need to transform the point (width/2, -20) to world space
  const rotateHandleLocal = { x: naturalWidth / 2, y: -25 };
  const rotateHandleWorld = transformPointByMatrixWorklet(rotateHandleLocal, matrix);

  if (Math.hypot(point.x - rotateHandleWorld.x, point.y - rotateHandleWorld.y) < rotateHitRadius) return 'rotate';

  return null;
};
