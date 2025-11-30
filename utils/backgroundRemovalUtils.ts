import { processBackgroundRemoval, validateImageForBackgroundRemoval, BackgroundRemovalOptions } from '../hooks/useOptimizedImagePicker/core/backgroundRemover';

export interface BackgroundRemovalResult {
  uri: string;
  originalUri: string;
  backgroundRemoved: boolean;
  processingTime: number;
  error?: any;
}

/**
 * Process background removal with optimized settings for outfit selection
 * @param imageUri - The URI of the image to process
 * @param options - Optional background removal settings
 * @returns Promise<BackgroundRemovalResult>
 */
export const removeImageBackground = async (
  imageUri: string,
  options: BackgroundRemovalOptions = {}
): Promise<BackgroundRemovalResult> => {
  try {
    // Validate image first
    if (!validateImageForBackgroundRemoval(imageUri)) {
      if (__DEV__) {
        console.warn('Image not suitable for background removal:', imageUri);
      }
      return {
        uri: imageUri,
        originalUri: imageUri,
        backgroundRemoved: false,
        processingTime: 0,
        error: new Error('Image validation failed')
      };
    }

    // Set optimized options for outfit selection
    const optimizedOptions: BackgroundRemovalOptions = {
      trim: true,
      timeout: 25000, // 25 seconds timeout for better UX
      ...options
    };

    if (__DEV__) {
      console.log('Starting local background removal for:', imageUri);
    }
    const result = await processBackgroundRemoval(imageUri, optimizedOptions);
    
    if (__DEV__) {
      console.log('Background removal result:', {
        success: result.backgroundRemoved,
        processingTime: result.processingTime,
        hasError: !!result.error
      });
    }

    return result;

  } catch (error: any) {
    if (__DEV__) {
      console.error('Background removal failed:', error);
    }
    
    return {
      uri: imageUri,
      originalUri: imageUri,
      backgroundRemoved: false,
      processingTime: 0,
      error
    };
  }
};

/**
 * Check if an image URI is suitable for background removal
 * @param imageUri - The URI to validate
 * @returns boolean indicating if the image can be processed
 */
export const canProcessImageForBackgroundRemoval = (imageUri: string): boolean => {
  return validateImageForBackgroundRemoval(imageUri);
};
