import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Get optimal background removal settings based on device capabilities
 */
export const getOptimalBackgroundRemovalSettings = () => {
  const isLowEndDevice = Platform.OS === 'android' && Platform.constants.Release < '10';
  
  return {
    trim: true,
    timeout: isLowEndDevice ? 45000 : 30000, // Longer timeout for older devices
  };
};

/**
 * Estimate processing time based on image size
 */
export const estimateBackgroundRemovalTime = (fileSize: number): number => {
  // Base processing time estimates (in milliseconds)
  const baseTime = 2000; // 2 seconds base
  const sizeMultiplier = fileSize / (1024 * 1024); // Per MB
  const timePerMB = Platform.OS === 'ios' ? 1500 : 2000; // iOS is typically faster
  
  return Math.min(baseTime + (sizeMultiplier * timePerMB), 30000); // Cap at 30 seconds
};

/**
 * Check if image size is suitable for background removal
 */
export const isImageSuitableForBackgroundRemoval = async (imageUri: string): Promise<{
  suitable: boolean;
  reason?: string;
  fileSize?: number;
}> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    
    if (!fileInfo.exists) {
      return {
        suitable: false,
        reason: 'Image file does not exist'
      };
    }
    
    const fileSize = fileInfo.size || 0;
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    const minSize = 1024; // 1KB minimum
    
    if (fileSize > maxSize) {
      return {
        suitable: false,
        reason: `Image too large (${(fileSize / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`,
        fileSize
      };
    }
    
    if (fileSize < minSize) {
      return {
        suitable: false,
        reason: 'Image too small for processing',
        fileSize
      };
    }
    
    return {
      suitable: true,
      fileSize
    };
    
  } catch (error) {
    console.warn('Failed to check image suitability:', error);
    return {
      suitable: false,
      reason: 'Unable to access image file'
    };
  }
};

/**
 * Generate a unique filename for processed images
 */
export const generateProcessedImageName = (originalUri: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalUri.split('.').pop() || 'jpg';
  
  return `bg_removed_${timestamp}_${random}.${extension}`;
};

/**
 * Clean up temporary background removal files
 */
export const cleanupBackgroundRemovalFiles = async (uris: string[]): Promise<void> => {
  try {
    const cleanupPromises = uris.map(async (uri) => {
      try {
        if (uri.startsWith('file://')) {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
            console.log('Cleaned up background removal file:', uri);
          }
        }
      } catch (error) {
        console.warn('Failed to cleanup file:', uri, error);
      }
    });
    
    await Promise.all(cleanupPromises);
  } catch (error) {
    console.warn('Background removal cleanup failed:', error);
  }
};

/**
 * Get device performance tier for background removal optimization
 */
export const getDevicePerformanceTier = (): 'low' | 'medium' | 'high' => {
  if (Platform.OS === 'ios') {
    // iOS devices are generally high performance for ML tasks
    return 'high';
  }
  
  // Android performance estimation based on API level and available info
  const apiLevel = Platform.Version;
  
  if (typeof apiLevel === 'number' && apiLevel >= 30) {
    return 'high';
  } else if (typeof apiLevel === 'number' && apiLevel >= 26) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Get memory usage estimate for background removal
 */
export const estimateMemoryUsage = (imageWidth: number, imageHeight: number): number => {
  // Rough estimation: width * height * 4 bytes per pixel * processing overhead
  const pixelCount = imageWidth * imageHeight;
  const bytesPerPixel = 4; // RGBA
  const processingOverhead = 2.5; // Background removal requires additional memory
  
  return pixelCount * bytesPerPixel * processingOverhead;
};

/**
 * Check if device has sufficient memory for background removal
 */
export const checkMemoryAvailability = (estimatedUsage: number): boolean => {
  // Conservative memory check - assume we need at least 100MB free
  const requiredFreeMemory = 100 * 1024 * 1024; // 100MB
  const safetyMargin = 1.5;
  
  return estimatedUsage * safetyMargin < requiredFreeMemory;
};
