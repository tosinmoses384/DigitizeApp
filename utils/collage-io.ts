import * as FileSystem from 'expo-file-system';
import type { CollageDocument } from '../types/collage';

const COLLAGE_DRAFT_KEY = 'collage_draft';
const COLLAGE_DRAFT_FILE = `${FileSystem.documentDirectory}collage_draft.json`;

export const serializeCollageDocument = (
  document: CollageDocument
): string => {
  return JSON.stringify(document, null, 2);
};

export const deserializeCollageDocument = (
  json: string
): CollageDocument | null => {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.id || !parsed.layers || !Array.isArray(parsed.layers)) {
      return null;
    }
    return parsed as CollageDocument;
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to deserialize collage document:', error);
    }
    return null;
  }
};

export const saveDraftToFile = async (
  document: CollageDocument
): Promise<{ success: boolean; error?: string }> => {
  try {
    const json = serializeCollageDocument(document);
    await FileSystem.writeAsStringAsync(COLLAGE_DRAFT_FILE, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (__DEV__) {
      console.error('Failed to save draft:', error);
    }
    return { success: false, error: errorMessage };
  }
};

export const loadDraftFromFile = async (): Promise<{
  success: boolean;
  document?: CollageDocument;
  error?: string;
}> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(COLLAGE_DRAFT_FILE);
    
    if (!fileInfo.exists) {
      return { success: false, error: 'No draft found' };
    }

    const json = await FileSystem.readAsStringAsync(COLLAGE_DRAFT_FILE, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const document = deserializeCollageDocument(json);
    
    if (!document) {
      return { success: false, error: 'Invalid draft format' };
    }

    return { success: true, document };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (__DEV__) {
      console.error('Failed to load draft:', error);
    }
    return { success: false, error: errorMessage };
  }
};

export const deleteDraftFile = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(COLLAGE_DRAFT_FILE);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(COLLAGE_DRAFT_FILE, { idempotent: true });
    }
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (__DEV__) {
      console.error('Failed to delete draft:', error);
    }
    return { success: false, error: errorMessage };
  }
};

export const exportCollageToJSON = (document: CollageDocument): string => {
  const exportData = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    document,
  };
  return JSON.stringify(exportData, null, 2);
};

export const importCollageFromJSON = (
  json: string
): { success: boolean; document?: CollageDocument; error?: string } => {
  try {
    const parsed = JSON.parse(json);
    
    if (!parsed.document) {
      return { success: false, error: 'Invalid export format' };
    }

    const document = parsed.document as CollageDocument;
    
    if (!document.id || !document.layers || !Array.isArray(document.layers)) {
      return { success: false, error: 'Invalid document structure' };
    }

    return { success: true, document };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

export const validateCollageDocument = (
  document: CollageDocument
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!document.id || typeof document.id !== 'string') {
    errors.push('Missing or invalid document ID');
  }

  if (!document.layers || !Array.isArray(document.layers)) {
    errors.push('Missing or invalid layers array');
  }

  if (typeof document.width !== 'number' || document.width <= 0) {
    errors.push('Invalid document width');
  }

  if (typeof document.height !== 'number' || document.height <= 0) {
    errors.push('Invalid document height');
  }

  if (!Array.isArray(document.selection)) {
    errors.push('Invalid selection array');
  }

  document.layers?.forEach((layer, index) => {
    if (!layer.id || typeof layer.id !== 'string') {
      errors.push(`Layer ${index}: Missing or invalid ID`);
    }

    if (!layer.uri || typeof layer.uri !== 'string') {
      errors.push(`Layer ${index}: Missing or invalid URI`);
    }

    if (!layer.matrix || !Array.isArray(layer.matrix) || layer.matrix.length !== 9) {
      errors.push(`Layer ${index}: Invalid transform matrix`);
    }

    if (typeof layer.naturalWidth !== 'number' || layer.naturalWidth <= 0) {
      errors.push(`Layer ${index}: Invalid natural width`);
    }

    if (typeof layer.naturalHeight !== 'number' || layer.naturalHeight <= 0) {
      errors.push(`Layer ${index}: Invalid natural height`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

