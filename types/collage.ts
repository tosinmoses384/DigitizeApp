export interface CollageTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  anchorX: number;
  anchorY: number;
}

export interface CollageLayer {
  id: string;
  type: 'image' | 'shape' | 'text';
  uri: string;
  naturalWidth: number;
  naturalHeight: number;
  transform: CollageTransform;
  matrix: number[];
  cachedUri: string | null;
  cachedSize: { width: number; height: number } | null;
  cachedThumbUri: string | null;
  backgroundRemoved: boolean;
  wardrobeItemId?: string;
  zIndex: number;
  opacity: number;
  isLocked: boolean;
  isHidden: boolean;
}

export interface CollageDocument {
  id: string;
  width: number;
  height: number;
  transparent: boolean;
  backgroundColor: string;
  layers: CollageLayer[];
  selection: string[];
  historyPointer: number;
  history: CollageHistoryEntry[];
}

export interface CollageHistoryEntry {
  type: 'addLayer' | 'removeLayer' | 'updateLayer' | 'reorderLayers' | 'updateSelection';
  timestamp: number;
  before: Partial<CollageDocument>;
  after: Partial<CollageDocument>;
}

export interface CollageSelection {
  layerIds: string[];
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export interface CollageStageTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

export type InteractionMode =
  | 'none'
  | 'transform-layer'
  | 'transform-stage'
  | 'resizing'
  | 'resize-layer'
  | 'rotate-layer'
  | 'marquee';

export interface CollageBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollagePoint {
  x: number;
  y: number;
}

export interface CollageExportResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export interface CollageImportData {
  uri: string;
  width: number;
  height: number;
}

export interface SnapLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'vertical' | 'horizontal';
}
