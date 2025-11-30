import ImageResizer from 'react-native-image-resizer';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { ImageOptimizerConfig } from '../types';

export interface FallbackCompressionResult {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
  compressionRatio: number;
  method: 'expo' | 'resizer' | 'custom';
}

export class FallbackCompressionEngine {
  private config: ImageOptimizerConfig;

  constructor(config: ImageOptimizerConfig) {
    this.config = config;
  }

  /**
   * Primary compression using expo-image-manipulator
   */
  async compressWithExpo(
    uri: string,
    targetWidth: number,
    targetHeight: number,
    quality: number
  ): Promise<FallbackCompressionResult> {
    try {
      const originalInfo = await FileSystem.getInfoAsync(uri);
      const originalSize = originalInfo.size || 0;

      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: targetWidth, height: targetHeight } }],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false
        }
      );

      const finalInfo = await FileSystem.getInfoAsync(result.uri);
      const finalSize = finalInfo.size || 0;

      return {
        uri: result.uri,
        width: result.width || targetWidth,
        height: result.height || targetHeight,
        fileSize: finalSize,
        compressionRatio: originalSize > 0 ? (originalSize - finalSize) / originalSize : 0,
        method: 'expo'
      };
    } catch (error) {
      throw new Error(`Expo compression failed: ${error}`);
    }
  }

  /**
   * Fallback compression using react-native-image-resizer
   */
  async compressWithResizer(
    uri: string,
    targetWidth: number,
    targetHeight: number,
    quality: number
  ): Promise<FallbackCompressionResult> {
    try {
      const originalInfo = await FileSystem.getInfoAsync(uri);
      const originalSize = originalInfo.size || 0;

      const result = await ImageResizer.createResizedImage(
        uri,
        targetWidth,
        targetHeight,
        'JPEG',
        Math.round(quality * 100), // ImageResizer expects 0-100
        0, // rotation
        undefined, // outputPath
        false, // keepMeta
        {
          mode: 'contain',
          onlyScaleDown: true
        }
      );

      const finalInfo = await FileSystem.getInfoAsync(result.uri);
      const finalSize = finalInfo.size || 0;

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        fileSize: finalSize,
        compressionRatio: originalSize > 0 ? (originalSize - finalSize) / originalSize : 0,
        method: 'resizer'
      };
    } catch (error) {
      throw new Error(`ImageResizer compression failed: ${error}`);
    }
  }

  /**
   * Custom progressive compression for extreme cases
   */
  async compressWithCustomAlgorithm(
    uri: string,
    targetFileSize: number,
    maxAttempts: number = 5
  ): Promise<FallbackCompressionResult> {
    let currentUri = uri;
    let currentQuality = 0.9;
    let currentScale = 1.0;
    let attempt = 0;

    const originalInfo = await FileSystem.getInfoAsync(uri);
    const originalSize = originalInfo.size || 0;

    // Get original dimensions
    const originalImage = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG
    });

    let currentWidth = originalImage.width || 1920;
    let currentHeight = originalImage.height || 1080;

    while (attempt < maxAttempts) {
      try {
        const targetWidth = Math.round(currentWidth * currentScale);
        const targetHeight = Math.round(currentHeight * currentScale);

        const result = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: targetWidth, height: targetHeight } }],
          {
            compress: currentQuality,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: false
          }
        );

        const resultInfo = await FileSystem.getInfoAsync(result.uri);
        const resultSize = resultInfo.size || 0;

        // If we've reached the target size, return
        if (resultSize <= targetFileSize) {
          return {
            uri: result.uri,
            width: result.width || targetWidth,
            height: result.height || targetHeight,
            fileSize: resultSize,
            compressionRatio: originalSize > 0 ? (originalSize - resultSize) / originalSize : 0,
            method: 'custom'
          };
        }

        // Adjust parameters for next attempt
        if (resultSize > targetFileSize * 1.5) {
          // Too large, reduce scale more aggressively
          currentScale *= 0.8;
        } else {
          // Close to target, reduce quality
          currentQuality *= 0.85;
        }

        // Clean up intermediate file
        if (currentUri !== uri) {
          await FileSystem.deleteAsync(currentUri, { idempotent: true });
        }
        currentUri = result.uri;

        attempt++;
      } catch (error) {
        console.warn(`Custom compression attempt ${attempt + 1} failed:`, error);
        attempt++;
      }
    }

    // Return the best result we achieved
    const finalInfo = await FileSystem.getInfoAsync(currentUri);
    const finalSize = finalInfo.size || 0;

    return {
      uri: currentUri,
      width: Math.round(currentWidth * currentScale),
      height: Math.round(currentHeight * currentScale),
      fileSize: finalSize,
      compressionRatio: originalSize > 0 ? (originalSize - finalSize) / originalSize : 0,
      method: 'custom'
    };
  }

  /**
   * Intelligent compression with automatic fallback
   */
  async compressWithFallback(
    uri: string,
    targetWidth: number,
    targetHeight: number,
    quality: number,
    targetFileSize?: number
  ): Promise<FallbackCompressionResult> {
    const methods = [
      () => this.compressWithExpo(uri, targetWidth, targetHeight, quality),
      () => this.compressWithResizer(uri, targetWidth, targetHeight, quality)
    ];

    // If we have a target file size and it's very small, add custom compression
    if (targetFileSize && targetFileSize < 500 * 1024) { // Less than 500KB
      methods.push(() => this.compressWithCustomAlgorithm(uri, targetFileSize));
    }

    let lastError: Error | null = null;

    for (const method of methods) {
      try {
        const result = await method();
        
        // If we have a target file size, check if we met it
        if (targetFileSize && result.fileSize > targetFileSize) {
          // Try the next method if this one didn't meet the target
          continue;
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn('Compression method failed, trying next:', error);
      }
    }

    // If all methods failed, throw the last error
    throw lastError || new Error('All compression methods failed');
  }

  /**
   * Adaptive quality selection based on file size
   */
  getAdaptiveQuality(originalFileSize: number): number {
    if (originalFileSize < 1024 * 1024) { // < 1MB
      return 0.95;
    } else if (originalFileSize < 5 * 1024 * 1024) { // < 5MB
      return 0.85;
    } else if (originalFileSize < 10 * 1024 * 1024) { // < 10MB
      return 0.75;
    } else {
      return 0.65;
    }
  }

  /**
   * Calculate optimal dimensions while preserving aspect ratio
   */
  calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    if (aspectRatio > 1) {
      // Landscape
      const width = Math.min(maxWidth, originalWidth);
      const height = Math.round(width / aspectRatio);
      return { width, height };
    } else {
      // Portrait or square
      const height = Math.min(maxHeight, originalHeight);
      const width = Math.round(height * aspectRatio);
      return { width, height };
    }
  }

  /**
   * Estimate compression ratio based on parameters
   */
  estimateCompressionRatio(
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number,
    quality: number
  ): number {
    const dimensionRatio = (targetWidth * targetHeight) / (originalWidth * originalHeight);
    const qualityFactor = quality;
    
    // Empirical formula based on typical compression behavior
    return 1 - (dimensionRatio * qualityFactor * 0.8);
  }

  /**
   * Validate compression result
   */
  async validateCompressionResult(result: FallbackCompressionResult): Promise<boolean> {
    try {
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      if (!fileInfo.exists) {
        return false;
      }

      // Check if dimensions are reasonable
      if (result.width < 10 || result.height < 10) {
        return false;
      }

      // Check if file size is reasonable
      if (result.fileSize < 1000) { // Less than 1KB is suspicious
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  updateConfig(newConfig: ImageOptimizerConfig): void {
    this.config = newConfig;
  }
}

export default FallbackCompressionEngine;
