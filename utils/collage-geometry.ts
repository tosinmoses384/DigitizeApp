import type {
  CollageLayer,
  CollageBounds,
  CollagePoint,
  CollageTransform,
} from '../types/collage';

export const createIdentityMatrix = (): number[] => {
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
};

export const createTranslationMatrix = (x: number, y: number): number[] => {
  return [1, 0, x, 0, 1, y, 0, 0, 1];
};

export const createScaleMatrix = (sx: number, sy: number): number[] => {
  return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
};

export const createRotationMatrix = (angle: number): number[] => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [cos, -sin, 0, sin, cos, 0, 0, 0, 1];
};

export const multiplyMatrices = (a: number[], b: number[]): number[] => {
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

export const transformPointByMatrix = (
  point: CollagePoint,
  matrix: number[]
): CollagePoint => {
  const x = matrix[0] * point.x + matrix[1] * point.y + matrix[2];
  const y = matrix[3] * point.x + matrix[4] * point.y + matrix[5];
  return { x, y };
};

export const decomposeMatrix = (matrix: number[]): CollageTransform => {
  const a = matrix[0];
  const b = matrix[3];
  const c = matrix[1];
  const d = matrix[4];
  const tx = matrix[2];
  const ty = matrix[5];

  const scaleX = Math.sqrt(a * a + b * b);
  const scaleY = Math.sqrt(c * c + d * d);
  const rotation = Math.atan2(b, a);

  return {
    x: tx,
    y: ty,
    scale: (scaleX + scaleY) / 2,
    rotation,
    anchorX: 0.5,
    anchorY: 0.5,
  };
};

export const composeMatrix = (transform: CollageTransform, naturalWidth = 200, naturalHeight = 200): number[] => {
  const { x, y, scale, rotation, anchorX, anchorY } = transform;

  const anchorPixelX = naturalWidth * anchorX;
  const anchorPixelY = naturalHeight * anchorY;

  const translateToOrigin = createTranslationMatrix(-anchorPixelX, -anchorPixelY);
  const scaleMatrix = createScaleMatrix(scale, scale);
  const rotateMatrix = createRotationMatrix(rotation);
  const translateBack = createTranslationMatrix(x, y);

  let matrix = translateToOrigin;
  matrix = multiplyMatrices(scaleMatrix, matrix);
  matrix = multiplyMatrices(rotateMatrix, matrix);
  matrix = multiplyMatrices(translateBack, matrix);

  return matrix;
};

export const getLayerBounds = (layer: CollageLayer): CollageBounds => {
  const { transform, naturalWidth, naturalHeight } = layer;
  const { x, y, scale } = transform;

  const width = naturalWidth * scale;
  const height = naturalHeight * scale;

  return {
    x: x - width / 2,
    y: y - height / 2,
    width,
    height,
  };
};

export const getLayerWorldBounds = (layer: CollageLayer): CollageBounds => {
  const { matrix, naturalWidth, naturalHeight } = layer;

  const corners: CollagePoint[] = [
    { x: 0, y: 0 },
    { x: naturalWidth, y: 0 },
    { x: naturalWidth, y: naturalHeight },
    { x: 0, y: naturalHeight },
  ];

  const transformedCorners = corners.map((corner) =>
    transformPointByMatrix(corner, matrix)
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

export const calculateUnionBoundingBox = (
  layers: CollageLayer[]
): CollageBounds | null => {
  if (layers.length === 0) {
    return null;
  }

  const bounds = layers.map(getLayerWorldBounds);

  const minX = Math.min(...bounds.map((b) => b.x));
  const minY = Math.min(...bounds.map((b) => b.y));
  const maxX = Math.max(...bounds.map((b) => b.x + b.width));
  const maxY = Math.max(...bounds.map((b) => b.y + b.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const isPointInBounds = (
  point: CollagePoint,
  bounds: CollageBounds
): boolean => {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
};

export const hitTestLayer = (
  layer: CollageLayer,
  point: CollagePoint
): boolean => {
  const bounds = getLayerWorldBounds(layer);
  return isPointInBounds(point, bounds);
};

export const findTopmostLayerAtPoint = (
  layers: CollageLayer[],
  point: CollagePoint
): CollageLayer | null => {
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  for (const layer of sortedLayers) {
    if (!layer.isHidden && hitTestLayer(layer, point)) {
      return layer;
    }
  }

  return null;
};

export const snapToGrid = (
  value: number,
  gridSize: number,
  threshold: number
): { snapped: boolean; value: number } => {
  const remainder = value % gridSize;
  const distanceToGrid = Math.min(remainder, gridSize - remainder);

  if (distanceToGrid <= threshold) {
    const snappedValue =
      remainder < gridSize / 2
        ? value - remainder
        : value + (gridSize - remainder);
    return { snapped: true, value: snappedValue };
  }

  return { snapped: false, value };
};

export const snapToNearbyEdges = (
  bounds: CollageBounds,
  otherBounds: CollageBounds[],
  threshold: number
): {
  snappedX: boolean;
  snappedY: boolean;
  deltaX: number;
  deltaY: number;
} => {
  let minDeltaX = Infinity;
  let minDeltaY = Infinity;
  let snappedX = false;
  let snappedY = false;

  const edges = [
    bounds.x,
    bounds.x + bounds.width,
    bounds.x + bounds.width / 2,
  ];
  const verticalEdges = [
    bounds.y,
    bounds.y + bounds.height,
    bounds.y + bounds.height / 2,
  ];

  for (const other of otherBounds) {
    const otherEdges = [
      other.x,
      other.x + other.width,
      other.x + other.width / 2,
    ];
    const otherVerticalEdges = [
      other.y,
      other.y + other.height,
      other.y + other.height / 2,
    ];

    for (const edge of edges) {
      for (const otherEdge of otherEdges) {
        const delta = otherEdge - edge;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaX)) {
          minDeltaX = delta;
          snappedX = true;
        }
      }
    }

    for (const vEdge of verticalEdges) {
      for (const otherVEdge of otherVerticalEdges) {
        const delta = otherVEdge - vEdge;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaY)) {
          minDeltaY = delta;
          snappedY = true;
        }
      }
    }
  }

  return {
    snappedX,
    snappedY,
    deltaX: snappedX ? minDeltaX : 0,
    deltaY: snappedY ? minDeltaY : 0,
  };
};

export const mapGroupTransformToLayerTransform = (
  layer: CollageLayer,
  groupDelta: Partial<CollageTransform>,
  groupCentroid: CollagePoint
): number[] => {
  const groupTranslate = createTranslationMatrix(
    groupDelta.x || 0,
    groupDelta.y || 0
  );
  const groupScale = createScaleMatrix(
    groupDelta.scale || 1,
    groupDelta.scale || 1
  );
  const groupRotate = createRotationMatrix(groupDelta.rotation || 0);

  const toCentroid = createTranslationMatrix(
    -groupCentroid.x,
    -groupCentroid.y
  );
  const fromCentroid = createTranslationMatrix(
    groupCentroid.x,
    groupCentroid.y
  );

  let deltaMatrix = multiplyMatrices(toCentroid, groupScale);
  deltaMatrix = multiplyMatrices(deltaMatrix, groupRotate);
  deltaMatrix = multiplyMatrices(deltaMatrix, groupTranslate);
  deltaMatrix = multiplyMatrices(deltaMatrix, fromCentroid);

  return multiplyMatrices(deltaMatrix, layer.matrix);
};

export const constrainBoundsToDocument = (
  bounds: CollageBounds,
  docWidth: number,
  docHeight: number,
  padding = 0
): { dx: number; dy: number } => {
  let dx = 0;
  let dy = 0;

  const left = bounds.x;
  const right = bounds.x + bounds.width;
  const top = bounds.y;
  const bottom = bounds.y + bounds.height;

  if (left < padding) dx = padding - left;
  if (right > docWidth - padding) dx = Math.min(dx, (docWidth - padding) - right);

  if (top < padding) dy = padding - top;
  if (bottom > docHeight - padding) dy = Math.min(dy, (docHeight - padding) - bottom);

  return { dx, dy };
};

export const clampStageTransform = (
  scale: number,
  translateX: number,
  translateY: number,
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number
): { scale: number; translateX: number; translateY: number } => {
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

export const rotateAngleToNearestCardinal = (
  angle: number,
  threshold: number
): { snapped: boolean; angle: number } => {
  const cardinalAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  for (const cardinal of cardinalAngles) {
    const distance = Math.abs(normalizedAngle - cardinal);
    if (distance <= threshold) {
      return { snapped: true, angle: cardinal };
    }
  }

  return { snapped: false, angle: normalizedAngle };
};


export type HandleType = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'rotate' | null;

export const hitTestHandles = (
  layer: CollageLayer,
  point: CollagePoint,
  scale: number // Current stage scale to adjust hit radius
): HandleType => {
  const { matrix, naturalWidth, naturalHeight } = layer;
  const hitRadius = 25 / scale; // 25px touch target, adjusted for zoom

  // Calculate handle positions in world space
  const corners = [
    { x: 0, y: 0 }, // Top-Left
    { x: naturalWidth, y: 0 }, // Top-Right
    { x: naturalWidth, y: naturalHeight }, // Bottom-Right
    { x: 0, y: naturalHeight }, // Bottom-Left
  ];

  const transformedCorners = corners.map(c => transformPointByMatrix(c, matrix));

  // Check corners
  if (Math.hypot(point.x - transformedCorners[0].x, point.y - transformedCorners[0].y) < hitRadius) return 'top-left';
  if (Math.hypot(point.x - transformedCorners[1].x, point.y - transformedCorners[1].y) < hitRadius) return 'top-right';
  if (Math.hypot(point.x - transformedCorners[2].x, point.y - transformedCorners[2].y) < hitRadius) return 'bottom-right';
  if (Math.hypot(point.x - transformedCorners[3].x, point.y - transformedCorners[3].y) < hitRadius) return 'bottom-left';

  // Check rotation handle (Top center - 20px)
  // We need to transform the point (width/2, -20) to world space
  const rotateHandleLocal = { x: naturalWidth / 2, y: -25 };
  const rotateHandleWorld = transformPointByMatrix(rotateHandleLocal, matrix);

  if (Math.hypot(point.x - rotateHandleWorld.x, point.y - rotateHandleWorld.y) < hitRadius) return 'rotate';

  return null;
};
