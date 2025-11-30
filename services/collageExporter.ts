import * as FileSystem from 'expo-file-system';
import type { SkImage } from '@shopify/react-native-skia';
import type { CollageExportResult } from '../types/collage';
import fileServerServices from './features/file-server/fileServer';

const MAX_EXPORT_SIZE = 4096;
const EXPORT_QUALITY = 1.0;

export interface ExportOptions {
  maxSize?: number;
  quality?: number;
  format?: 'png' | 'jpeg';
}

export const encodeSkiaImageToPNG = async (
  image: SkImage | null,
  options: ExportOptions = {}
): Promise<CollageExportResult> => {
  try {
    if (!image) {
      return {
        success: false,
        error: 'No image provided for export',
      };
    }

    const base64Data = image.encodeToBase64();
    
    if (!base64Data) {
      return {
        success: false,
        error: 'Failed to encode image to base64',
      };
    }

    const fileName = `collage_${Date.now()}.png`;
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      success: true,
      uri: fileUri,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown export error';
    
    if (__DEV__) {
      console.error('Failed to export Skia image:', error);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

export const calculateExportScale = (
  documentWidth: number,
  documentHeight: number,
  maxSize: number = MAX_EXPORT_SIZE
): number => {
  const maxDimension = Math.max(documentWidth, documentHeight);
  
  if (maxDimension <= maxSize) {
    return 1.0;
  }

  return maxSize / maxDimension;
};

export const cleanupExportFile = async (uri: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to cleanup export file:', error);
    }
  }
};

export const uploadCollageImage = async (
  imageUri: string,
  token: string,
  refNumber: string
): Promise<{ success: boolean; error?: string; data?: unknown }> => {
  try {
    const imageData = {
      imageUri,
      type: 'image/png',
    };

    const result = await fileServerServices.outfitImageUpload(
      [imageData],
      false,
      refNumber,
      token
    );

    if (result?.status === 200) {
      return {
        success: true,
        data: result,
      };
    }

    return {
      success: false,
      error: result?.message || result?.detail || 'Upload failed',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload error';
    
    if (__DEV__) {
      console.error('Failed to upload collage image:', error);
    }

    return {
      success: false,
      error: errorMessage,
    };
  } finally {
    await cleanupExportFile(imageUri);
  }
};

export const exportAndUploadCollage = async (
  image: SkImage | null,
  token: string,
  refNumber: string,
  options: ExportOptions = {}
): Promise<{ success: boolean; error?: string; data?: unknown }> => {
  let exportedUri: string | undefined;

  try {
    const exportResult = await encodeSkiaImageToPNG(image, options);

    if (!exportResult.success || !exportResult.uri) {
      return {
        success: false,
        error: exportResult.error || 'Export failed',
      };
    }

    exportedUri = exportResult.uri;

    const uploadResult = await uploadCollageImage(
      exportedUri,
      token,
      refNumber
    );

    return uploadResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (__DEV__) {
      console.error('Export and upload failed:', error);
    }

    if (exportedUri) {
      await cleanupExportFile(exportedUri);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

export const validateExportImage = (
  image: SkImage | null
): { valid: boolean; error?: string } => {
  if (!image) {
    return {
      valid: false,
      error: 'No image to export',
    };
  }

  const width = image.width();
  const height = image.height();

  if (width <= 0 || height <= 0) {
    return {
      valid: false,
      error: 'Invalid image dimensions',
    };
  }

  if (width > 8192 || height > 8192) {
    return {
      valid: false,
      error: 'Image dimensions exceed maximum size (8192x8192)',
    };
  }

  return { valid: true };
};

