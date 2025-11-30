import { create } from 'zustand';
import type {
  CollageDocument,
  CollageLayer,
  CollageHistoryEntry,
  InteractionMode,
  CollageStageTransform,
} from '../types/collage';
import { createIdentityMatrix, composeMatrix } from '../utils/collage-geometry';

interface CollageStore {
  document: CollageDocument | null;
  interactionMode: InteractionMode;
  stageTransform: CollageStageTransform;
  isSnappingEnabled: boolean;
  maxHistoryEntries: number;

  initializeDocument: (width: number, height: number) => void;
  setDocument: (document: CollageDocument) => void;
  clearDocument: () => void;

  addLayer: (layer: Omit<CollageLayer, 'id' | 'zIndex'>) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<CollageLayer>) => void;
  updateLayerDimensions: (layerId: string, width: number, height: number) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  bringToFront: (layerId: string) => void;
  sendToBack: (layerId: string) => void;
  duplicateLayer: (layerId: string) => void;

  selectLayer: (layerId: string, multiSelect?: boolean) => void;
  deselectLayer: (layerId: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  toggleLayerSelection: (layerId: string) => void;

  updateSelectedLayersTransform: (
    updates: Partial<CollageLayer['transform']>
  ) => void;
  updateSelectedLayersMatrix: (layerUpdates: Record<string, number[]>) => void;

  setInteractionMode: (mode: InteractionMode) => void;
  setStageTransform: (transform: Partial<CollageStageTransform>) => void;
  resetStageTransform: () => void;

  toggleSnapping: () => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  getLayerById: (layerId: string) => CollageLayer | undefined;
  getSelectedLayers: () => CollageLayer[];
  hasSelection: () => boolean;
}

const createInitialDocument = (
  width: number,
  height: number
): CollageDocument => ({
  id: `collage_${Date.now()}`,
  width,
  height,
  transparent: true,
  backgroundColor: '#FFFFFF',
  layers: [],
  selection: [],
  historyPointer: -1,
  history: [],
});

const createHistoryEntry = (
  type: CollageHistoryEntry['type'],
  before: Partial<CollageDocument>,
  after: Partial<CollageDocument>
): CollageHistoryEntry => ({
  type,
  timestamp: Date.now(),
  before,
  after,
});

export const useCollageStore = create<CollageStore>((set, get) => ({
  document: null,
  interactionMode: 'none',
  stageTransform: {
    scale: 1,
    translateX: 0,
    translateY: 0,
  },
  isSnappingEnabled: true,
  maxHistoryEntries: 50,

  initializeDocument: (width: number, height: number) => {
    set({ document: createInitialDocument(width, height) });
  },

  setDocument: (document: CollageDocument) => {
    set({ document });
  },

  clearDocument: () => {
    const { document } = get();
    if (!document) return;

    set({
      document: {
        ...document,
        layers: [],
        selection: [],
        historyPointer: -1,
        history: [],
      },
    });
  },

  addLayer: (layerData) => {
    const { document } = get();
    if (!document) return;

    const defaultTransform = {
      x: document.width / 2,
      y: document.height / 2,
      scale: 1,
      rotation: 0,
      anchorX: 0.5,
      anchorY: 0.5,
    };

    const transform = layerData.transform || defaultTransform;
    const naturalWidth = layerData.naturalWidth || 200;
    const naturalHeight = layerData.naturalHeight || 200;

    const newLayer: CollageLayer = {
      ...layerData,
      id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      zIndex: document.layers.length,
      naturalWidth,
      naturalHeight,
      matrix:
        layerData.matrix ||
        composeMatrix(transform, naturalWidth, naturalHeight),
      transform,
    };

    const newLayers = [...document.layers, newLayer];

    const historyEntry = createHistoryEntry(
      'addLayer',
      { layers: document.layers },
      { layers: newLayers }
    );

    set({
      document: {
        ...document,
        layers: newLayers,
        history: [
          ...document.history.slice(0, document.historyPointer + 1),
          historyEntry,
        ].slice(-get().maxHistoryEntries),
        historyPointer: Math.min(
          document.historyPointer + 1,
          get().maxHistoryEntries - 1
        ),
      },
    });
  },

  removeLayer: (layerId: string) => {
    const { document } = get();
    if (!document) return;

    const layerIndex = document.layers.findIndex((l) => l.id === layerId);
    if (layerIndex === -1) return;

    const newLayers = document.layers.filter((l) => l.id !== layerId);
    const newSelection = document.selection.filter((id) => id !== layerId);

    const historyEntry = createHistoryEntry(
      'removeLayer',
      { layers: document.layers, selection: document.selection },
      { layers: newLayers, selection: newSelection }
    );

    set({
      document: {
        ...document,
        layers: newLayers,
        selection: newSelection,
        history: [
          ...document.history.slice(0, document.historyPointer + 1),
          historyEntry,
        ].slice(-get().maxHistoryEntries),
        historyPointer: Math.min(
          document.historyPointer + 1,
          get().maxHistoryEntries - 1
        ),
      },
    });
  },

  updateLayer: (layerId: string, updates: Partial<CollageLayer>) => {
    const { document } = get();
    if (!document) return;

    const layerIndex = document.layers.findIndex((l) => l.id === layerId);
    if (layerIndex === -1) return;

    const oldLayer = document.layers[layerIndex];
    const newLayer = { ...oldLayer, ...updates };
    const newLayers = [...document.layers];
    newLayers[layerIndex] = newLayer;

    const historyEntry = createHistoryEntry(
      'updateLayer',
      { layers: [oldLayer] },
      { layers: [newLayer] }
    );

    set({
      document: {
        ...document,
        layers: newLayers,
        history: [
          ...document.history.slice(0, document.historyPointer + 1),
          historyEntry,
        ].slice(-get().maxHistoryEntries),
        historyPointer: Math.min(
          document.historyPointer + 1,
          get().maxHistoryEntries - 1
        ),
      },
    });
  },

  updateLayerDimensions: (layerId: string, width: number, height: number) => {
    const { document } = get();
    if (!document) return;

    const layerIndex = document.layers.findIndex((l) => l.id === layerId);
    if (layerIndex === -1) return;

    const layer = document.layers[layerIndex];

    // Don't update if dimensions haven't changed
    if (layer.naturalWidth === width && layer.naturalHeight === height) return;

    // Calculate appropriate scale to fit in canvas nicely
    // Target max dimension of 200px for good visibility
    const MAX_DISPLAY_SIZE = 200;
    const maxDimension = Math.max(width, height);
    const autoScale = maxDimension > MAX_DISPLAY_SIZE
      ? MAX_DISPLAY_SIZE / maxDimension
      : 1;

    // Import composeMatrix to recalculate the transformation matrix
    const { composeMatrix } = require('../utils/collage-geometry');

    const newTransform = {
      ...layer.transform,
      scale: autoScale,
    };

    if (__DEV__) {
      console.log(`[Store] Updating layer ${layerId} dimensions:`, {
        from: `${layer.naturalWidth}x${layer.naturalHeight}`,
        to: `${width}x${height}`,
        scale: autoScale.toFixed(3),
        displaySize: `${Math.round(width * autoScale)}x${Math.round(height * autoScale)}`,
      });
    }

    const newLayers = [...document.layers];
    newLayers[layerIndex] = {
      ...layer,
      naturalWidth: width,
      naturalHeight: height,
      cachedSize: { width, height },
      transform: newTransform,
      matrix: composeMatrix(newTransform, width, height),
    };

    // Update without creating history entry (this is an automatic correction)
    set({
      document: {
        ...document,
        layers: newLayers,
      },
    });
  },

  reorderLayers: (fromIndex: number, toIndex: number) => {
    const { document } = get();
    if (!document) return;

    const newLayers = [...document.layers];
    const [movedLayer] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, movedLayer);

    newLayers.forEach((layer, index) => {
      layer.zIndex = index;
    });

    const historyEntry = createHistoryEntry(
      'reorderLayers',
      { layers: document.layers },
      { layers: newLayers }
    );

    set({
      document: {
        ...document,
        layers: newLayers,
        history: [
          ...document.history.slice(0, document.historyPointer + 1),
          historyEntry,
        ].slice(-get().maxHistoryEntries),
        historyPointer: Math.min(
          document.historyPointer + 1,
          get().maxHistoryEntries - 1
        ),
      },
    });
  },

  bringToFront: (layerId: string) => {
    const { document } = get();
    if (!document) return;

    const layerIndex = document.layers.findIndex((l) => l.id === layerId);
    if (layerIndex === -1 || layerIndex === document.layers.length - 1) return;

    get().reorderLayers(layerIndex, document.layers.length - 1);
  },

  sendToBack: (layerId: string) => {
    const { document } = get();
    if (!document) return;

    const layerIndex = document.layers.findIndex((l) => l.id === layerId);
    if (layerIndex === -1 || layerIndex === 0) return;

    get().reorderLayers(layerIndex, 0);
  },

  duplicateLayer: (layerId: string) => {
    const { document } = get();
    if (!document) return;

    const layer = document.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const duplicatedLayer = {
      ...layer,
      transform: {
        ...layer.transform,
        x: layer.transform.x + 20,
        y: layer.transform.y + 20,
      },
    };

    get().addLayer(duplicatedLayer);
  },

  selectLayer: (layerId: string, multiSelect = false) => {
    const { document } = get();
    if (!document) return;

    const layer = document.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const newSelection = multiSelect
      ? [...document.selection, layerId]
      : [layerId];

    const historyEntry = createHistoryEntry(
      'updateSelection',
      { selection: document.selection },
      { selection: newSelection }
    );

    set({
      document: {
        ...document,
        selection: newSelection,
        history: [
          ...document.history.slice(0, document.historyPointer + 1),
          historyEntry,
        ].slice(-get().maxHistoryEntries),
        historyPointer: Math.min(
          document.historyPointer + 1,
          get().maxHistoryEntries - 1
        ),
      },
    });
  },

  deselectLayer: (layerId: string) => {
    const { document } = get();
    if (!document) return;

    const newSelection = document.selection.filter((id) => id !== layerId);

    const historyEntry = createHistoryEntry(
      'updateSelection',
      { selection: document.selection },
      { selection: newSelection }
    );

    set({
      document: {
        ...document,
        selection: newSelection,
        history: [
          ...document.history.slice(0, document.historyPointer + 1),
          historyEntry,
        ].slice(-get().maxHistoryEntries),
        historyPointer: Math.min(
          document.historyPointer + 1,
          get().maxHistoryEntries - 1
        ),
      },
    });
  },

  clearSelection: () => {
    const { document } = get();
    if (!document || document.selection.length === 0) return;

    const historyEntry = createHistoryEntry(
      'updateSelection',
      { selection: document.selection },
      { selection: [] }
    );

    set({
      document: {
        ...document,
        selection: [],
        history: [
          ...document.history.slice(0, document.historyPointer + 1),
          historyEntry,
        ].slice(-get().maxHistoryEntries),
        historyPointer: Math.min(
          document.historyPointer + 1,
          get().maxHistoryEntries - 1
        ),
      },
    });
  },

  selectAll: () => {
    const { document } = get();
    if (!document) return;

    const allLayerIds = document.layers.map((l) => l.id);

    const historyEntry = createHistoryEntry(
      'updateSelection',
      { selection: document.selection },
      { selection: allLayerIds }
    );

    set({
      document: {
        ...document,
        selection: allLayerIds,
        history: [
          ...document.history.slice(0, document.historyPointer + 1),
          historyEntry,
        ].slice(-get().maxHistoryEntries),
        historyPointer: Math.min(
          document.historyPointer + 1,
          get().maxHistoryEntries - 1
        ),
      },
    });
  },

  toggleLayerSelection: (layerId: string) => {
    const { document } = get();
    if (!document) return;

    const isSelected = document.selection.includes(layerId);

    if (isSelected) {
      get().deselectLayer(layerId);
    } else {
      get().selectLayer(layerId, true);
    }
  },

  updateSelectedLayersTransform: (updates: Partial<CollageLayer['transform']>) => {
    const { document } = get();
    if (!document || document.selection.length === 0) return;

    const newLayers = document.layers.map((layer) => {
      if (document.selection.includes(layer.id)) {
        return {
          ...layer,
          transform: {
            ...layer.transform,
            ...updates,
          },
        };
      }
      return layer;
    });

    set({
      document: {
        ...document,
        layers: newLayers,
      },
    });
  },

  updateSelectedLayersMatrix: (layerUpdates: Record<string, number[]>) => {
    const { document } = get();
    if (!document) return;

    if (Object.keys(layerUpdates).length === 0) return;

    const newLayers = document.layers.map((layer) => {
      if (layerUpdates[layer.id]) {
        return {
          ...layer,
          matrix: layerUpdates[layer.id],
        };
      }
      return layer;
    });

    set({
      document: {
        ...document,
        layers: newLayers,
      },
    });
  },

  setInteractionMode: (mode: InteractionMode) => {
    set({ interactionMode: mode });
  },

  setStageTransform: (transform: Partial<CollageStageTransform>) => {
    set((state) => ({
      stageTransform: {
        ...state.stageTransform,
        ...transform,
      },
    }));
  },

  resetStageTransform: () => {
    set({
      stageTransform: {
        scale: 1,
        translateX: 0,
        translateY: 0,
      },
    });
  },

  toggleSnapping: () => {
    set((state) => ({ isSnappingEnabled: !state.isSnappingEnabled }));
  },

  undo: () => {
    const { document } = get();
    if (!document || !get().canUndo()) return;

    const historyEntry = document.history[document.historyPointer];

    set({
      document: {
        ...document,
        ...historyEntry.before,
        historyPointer: document.historyPointer - 1,
      },
    });
  },

  redo: () => {
    const { document } = get();
    if (!document || !get().canRedo()) return;

    const historyEntry = document.history[document.historyPointer + 1];

    set({
      document: {
        ...document,
        ...historyEntry.after,
        historyPointer: document.historyPointer + 1,
      },
    });
  },

  canUndo: () => {
    const { document } = get();
    return document !== null && document.historyPointer >= 0;
  },

  canRedo: () => {
    const { document } = get();
    return (
      document !== null &&
      document.historyPointer < document.history.length - 1
    );
  },

  getLayerById: (layerId: string) => {
    const { document } = get();
    if (!document) return undefined;
    return document.layers.find((l) => l.id === layerId);
  },

  getSelectedLayers: () => {
    const { document } = get();
    if (!document) return [];
    return document.layers.filter((l) => document.selection.includes(l.id));
  },

  hasSelection: () => {
    const { document } = get();
    return document !== null && document.selection.length > 0;
  },
}));

