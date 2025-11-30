// utils/imageCompression.ts
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  fileName?: string;
}

export interface CompressionOptions {
  maxSizeInMB?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: ImageManipulator.SaveFormat;
}

/**
 * Compresses an image to ensure it's under the specified size limit
 * @param imageUri - The URI of the image to compress
 * @param options - Compression options
 * @returns Promise<CompressedImageResult>
 */
export const compressImage = async (
  imageUri: string,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> => {
  const {
    maxSizeInMB = 4, // Default 4MB limit
    quality = 0.8,
    maxWidth = 2048,
    maxHeight = 2048,
    format = ImageManipulator.SaveFormat.JPEG
  } = options;

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Convert MB to bytes

  try {
    // Get initial file info
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    const initialSize = (fileInfo.exists && 'size' in fileInfo) ? fileInfo.size : 0;

    console.log(`Initial image size: ${(initialSize / 1024 / 1024).toFixed(2)}MB`);

    // If image is already under the limit, return as is
    if (initialSize <= maxSizeInBytes) {
      const imageInfo = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { compress: quality, format }
      );
      
      const finalFileInfo = await FileSystem.getInfoAsync(imageInfo.uri);
      
      return {
        uri: imageInfo.uri,
        width: imageInfo.width,
        height: imageInfo.height,
        fileSize: (finalFileInfo.exists && 'size' in finalFileInfo) ? finalFileInfo.size : 0,
        mimeType: format === ImageManipulator.SaveFormat.JPEG ? 'image/jpeg' : 'image/png'
      };
    }

    // Start with initial compression
    let currentQuality = quality;
    let currentWidth = maxWidth;
    let currentHeight = maxHeight;
    let compressedImage = imageUri;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Calculate resize dimensions while maintaining aspect ratio
      const imageInfo = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      const aspectRatio = imageInfo.width / imageInfo.height;
      let resizeWidth = currentWidth;
      let resizeHeight = currentHeight;

      if (aspectRatio > 1) {
        // Landscape
        resizeHeight = Math.round(resizeWidth / aspectRatio);
      } else {
        // Portrait or square
        resizeWidth = Math.round(resizeHeight * aspectRatio);
      }

      // Apply compression with resize
      const manipulationActions: ImageManipulator.Action[] = [];
      
      if (imageInfo.width > resizeWidth || imageInfo.height > resizeHeight) {
        manipulationActions.push({
          resize: {
            width: resizeWidth,
            height: resizeHeight,
          },
        });
      }

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        manipulationActions,
        {
          compress: currentQuality,
          format,
        }
      );

      // Check the file size
      const resultFileInfo = await FileSystem.getInfoAsync(result.uri);
      const resultSize = (resultFileInfo.exists && 'size' in resultFileInfo) ? resultFileInfo.size : 0;

      console.log(`Attempt ${attempts + 1}: ${(resultSize / 1024 / 1024).toFixed(2)}MB (Quality: ${currentQuality}, Size: ${resizeWidth}x${resizeHeight})`);

      if (resultSize <= maxSizeInBytes) {
        // Success! Image is now under the limit
        return {
          uri: result.uri,
          width: result.width,
          height: result.height,
          fileSize: resultSize,
          mimeType: format === ImageManipulator.SaveFormat.JPEG ? 'image/jpeg' : 'image/png'
        };
      }

      // Adjust compression parameters for next attempt
      attempts++;
      
      if (currentQuality > 0.3) {
        // Reduce quality first
        currentQuality = Math.max(0.3, currentQuality - 0.1);
      } else {
        // If quality is already low, reduce dimensions
        currentWidth = Math.round(currentWidth * 0.8);
        currentHeight = Math.round(currentHeight * 0.8);
        currentQuality = 0.7; // Reset quality when reducing size
      }

      // Prevent infinite loop with very small dimensions
      if (currentWidth < 200 || currentHeight < 200) {
        break;
      }
    }

    // If we couldn't get under the limit, return the last attempt
    const finalResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: currentWidth, height: currentHeight } }],
      { compress: 0.3, format }
    );

    const finalFileInfo = await FileSystem.getInfoAsync(finalResult.uri);
    const finalSize = (finalFileInfo.exists && 'size' in finalFileInfo) ? finalFileInfo.size : 0;
    
    console.warn(`Could not compress image below ${maxSizeInMB}MB after ${maxAttempts} attempts. Final size: ${(finalSize / 1024 / 1024).toFixed(2)}MB`);

    return {
      uri: finalResult.uri,
      width: finalResult.width,
      height: finalResult.height,
      fileSize: finalSize,
      mimeType: format === ImageManipulator.SaveFormat.JPEG ? 'image/jpeg' : 'image/png'
    };

  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error(`Failed to compress image: ${error}`);
  }
};

/**
 * Compresses multiple images
 * @param imageUris - Array of image URIs to compress
 * @param options - Compression options
 * @returns Promise<CompressedImageResult[]>
 */
export const compressMultipleImages = async (
  imageUris: string[],
  options: CompressionOptions = {}
): Promise<CompressedImageResult[]> => {
  const results: CompressedImageResult[] = [];
  
  for (const uri of imageUris) {
    try {
      const compressed = await compressImage(uri, options);
      results.push(compressed);
    } catch (error) {
      console.error(`Failed to compress image ${uri}:`, error);
      // You might want to handle this differently based on your needs
      throw error;
    }
  }
  
  return results;
};

/**
 * Validates if an image is under the size limit
 * @param imageUri - The URI of the image to check
 * @param maxSizeInMB - Maximum size in MB
 * @returns Promise<boolean>
 */
export const isImageUnderSizeLimit = async (
  imageUri: string,
  maxSizeInMB: number = 4
): Promise<boolean> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    const fileSize = (fileInfo.exists && 'size' in fileInfo) ? fileInfo.size : 0;
    return fileSize <= maxSizeInBytes;
  } catch (error) {
    console.error('Error checking image size:', error);
    return false;
  }
};

/**
 * Gets the file size of an image in MB
 * @param imageUri - The URI of the image
 * @returns Promise<number> - Size in MB
 */
export const getImageSizeInMB = async (imageUri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    const fileSize = (fileInfo.exists && 'size' in fileInfo) ? fileInfo.size : 0;
    return fileSize / 1024 / 1024;
  } catch (error) {
    console.error('Error getting image size:', error);
    return 0;
  }
};
