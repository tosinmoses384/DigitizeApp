import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import {
  ImageMetadata,
  ImageOptimizerConfig,
  OptimizedImageResult,
} from "../types";
import { COMPRESSION_LEVELS } from "../config";
import {
  logBackgroundRemovalStats,
  processBackgroundRemoval,
  validateImageForBackgroundRemoval,
} from "./backgroundRemover";
import {
  getOptimalBackgroundRemovalSettings,
  isImageSuitableForBackgroundRemoval,
} from "../utils/backgroundUtils";
import { safeImageManipulator } from "../utils/safeImageManipulatorWrapper";

export class ImageProcessor {
  private config: ImageOptimizerConfig;
  private processingStats = {
    totalProcessed: 0,
    totalTime: 0,
    compressionRatios: [] as number[],
  };

  constructor(config: ImageOptimizerConfig) {
    this.config = config;
  }

  async processImage(
    uri: string,
    options: {
      removeBackground?: boolean;
      targetSize?: { width?: number; height?: number };
      quality?: number;
    } = {},
  ): Promise<OptimizedImageResult> {
    const startTime = Date.now();

    try {
      // Step 1: Analyze original image
      const originalInfo = await this.getImageInfo(uri);

      // Check if original image is already under the size limit
      if (originalInfo.fileSize <= this.config.maxFileSize) {
        console.log(`Original image (${originalInfo.fileSize} bytes) is already under maxFileSize (${this.config.maxFileSize} bytes)`);
        
        // Return original image if it's already small enough
        return {
          uri: uri,
          originalUri: uri,
          width: originalInfo.width,
          height: originalInfo.height,
          fileSize: originalInfo.fileSize,
          originalFileSize: originalInfo.fileSize,
          compressionRatio: 0,
          format: originalInfo.format as "jpeg" | "png" | "webp",
          metadata: await this.extractMetadata(uri),
          backgroundRemoved: false,
          orientationCorrected: false,
          enhancementApplied: false,
          processingTime: Date.now() - startTime,
          qualityScore: 1.0,
        };
      }

      // Step 2: Apply background removal if requested (check config)
      let processedUri = uri;
      let backgroundRemoved = false;
      let backgroundRemovalTime = 0;

      if (
        options.removeBackground !== false &&
        this.config.processing.enableBackgroundRemoval
      ) {
        const bgRemovalResult = await this.applyBackgroundRemoval(uri);
        processedUri = bgRemovalResult.uri;
        backgroundRemoved = bgRemovalResult.backgroundRemoved;
        backgroundRemovalTime = bgRemovalResult.processingTime;

        // Log background removal stats for monitoring
        const fullResult = {
          ...bgRemovalResult,
          originalUri: uri,
        };
        logBackgroundRemovalStats(fullResult);
      }

      // Step 3: Apply enhancement if enabled
      let enhancementApplied = false;
      if (
        this.config.processing.enableEnhancement &&
        this.config.enhancement.enableAutoEnhancement
      ) {
        try {
          processedUri = await this.applyEnhancement(processedUri);
          enhancementApplied = true;
        } catch (error) {
          console.warn("Enhancement failed, continuing without:", error);
        }
      }

      // Step 4: Apply compression and optimization
      const optimizedResult = await this.optimizeImage(
        processedUri,
        originalInfo,
        options,
      );

      // Step 5: Clean up temporary files (but preserve the final result)
      // Only cleanup intermediate files, not the final optimized result
      if (processedUri !== uri && processedUri !== optimizedResult.uri) {
        // Delay cleanup to ensure React Native has time to load the image
        setTimeout(async () => {
          try {
            await this.cleanupTempFile(processedUri);
          } catch (error) {
            console.warn("Failed to cleanup temp file:", error);
          }
        }, 5000); // 5 second delay
      }

      // Step 6: Update processing stats and create final result
      const processingTime = Date.now() - startTime;
      this.updateStats(processingTime, optimizedResult.compressionRatio);

      // Add enhanced metadata and validate final URI
      const enhancedResult: OptimizedImageResult = {
        ...optimizedResult,
        backgroundRemoved,
        backgroundRemovalTime,
        orientationCorrected: this.config.exifProcessing.orientationCorrection,
        enhancementApplied,
        processingTime,
        qualityScore: this.calculateQualityScore(optimizedResult),
      };

      // Validate that the final URI exists and is accessible
      try {
        const finalFileInfo = await FileSystem.getInfoAsync(enhancedResult.uri);
        if (!finalFileInfo.exists) {
          console.error(
            "Final processed file does not exist:",
            enhancedResult.uri,
          );
          // Fallback to original URI if processed file is missing
          enhancedResult.uri = uri;
        } else {
          console.log("Final processed file validated:", enhancedResult.uri);
        }
      } catch (error) {
        console.warn("Failed to validate final URI, using original:", error);
        enhancedResult.uri = uri;
      }

      return enhancedResult;
    } catch (error) {
      throw this.createProcessingError(error, "Image processing failed");
    }
  }

  private async getImageInfo(uri: string): Promise<{
    width: number;
    height: number;
    fileSize: number;
    format: string;
  }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error("Image file does not exist");
      }

      // Validate URI format and accessibility
      await this.validateImageUri(uri);

      // Get image dimensions using safe ImageManipulator wrapper
      const imageInfo = await safeImageManipulator.manipulateAsync(uri, [], {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return {
        width: imageInfo.width || 0,
        height: imageInfo.height || 0,
        fileSize: (fileInfo as any).size || 0,
        format: this.detectImageFormat(uri),
      };
    } catch (error) {
      throw new Error(`Failed to get image info: ${error}`);
    }
  }

  private async applyBackgroundRemoval(uri: string): Promise<{
    uri: string;
    backgroundRemoved: boolean;
    processingTime: number;
  }> {
    try {
      // Validate image before processing
      if (!validateImageForBackgroundRemoval(uri)) {
        console.warn(
          "Image not suitable for background removal, using original",
        );
        return {
          uri,
          backgroundRemoved: false,
          processingTime: 0,
        };
      }

      // Check if image is suitable for background removal
      const suitabilityCheck = await isImageSuitableForBackgroundRemoval(uri);
      if (!suitabilityCheck.suitable) {
        console.warn(
          "Image not suitable for background removal:",
          suitabilityCheck.reason,
        );
        return {
          uri,
          backgroundRemoved: false,
          processingTime: 0,
        };
      }

      // Get optimal settings for this device
      const optimalSettings = getOptimalBackgroundRemovalSettings();

      // Apply background removal with device-specific timeout
      const backgroundRemovalOptions = {
        trim: this.config.backgroundRemoval.trim,
        timeout:
          this.config.backgroundRemoval.timeout || optimalSettings.timeout,
      };

      const result = await processBackgroundRemoval(
        uri,
        backgroundRemovalOptions,
      );

      return {
        uri: result.uri,
        backgroundRemoved: result.backgroundRemoved,
        processingTime: result.processingTime,
      };
    } catch (error) {
      console.warn("Background removal failed, using original image:", error);
      return {
        uri,
        backgroundRemoved: false,
        processingTime: 0,
      };
    }
  }

  private async optimizeImage(
    uri: string,
    originalInfo: {
      width: number;
      height: number;
      fileSize: number;
      format: string;
    },
    options: {
      targetSize?: { width?: number; height?: number };
      quality?: number;
    },
  ): Promise<OptimizedImageResult> {
    const targetQuality =
      options.quality || this.determineOptimalQuality(originalInfo.fileSize);
    const targetSize =
      options.targetSize === null
        ? originalInfo
        : options.targetSize || this.calculateTargetSize(originalInfo);

    // Determine output format
    const outputFormat = this.determineOutputFormat(originalInfo.format, uri);

    // Prepare manipulation actions
    const actions: ImageManipulator.Action[] = [];

    // Add resize action if needed
    if (
      targetSize.width !== originalInfo.width ||
      targetSize.height !== originalInfo.height
    ) {
      actions.push({
        resize: {
          width: targetSize.width,
          height: targetSize.height,
        },
      });
    }

    // Process the image using safe wrapper
    const result = await safeImageManipulator.manipulateAsync(uri, actions, {
      compress: targetQuality,
      format: outputFormat,
      base64: false,
    });

    // Get final file info
    const finalFileInfo = await FileSystem.getInfoAsync(result.uri);
    let finalFileSize = (finalFileInfo as any).size || 0;
    
    // Check if the processed image exceeds the configured maxFileSize
    if (finalFileSize > this.config.maxFileSize) {
      console.warn(`Processed image (${finalFileSize} bytes) exceeds maxFileSize (${this.config.maxFileSize} bytes). Applying additional compression.`);
      
      // Apply additional compression to meet the file size limit
      const additionalCompressionResult = await this.applyAdditionalCompression(
        result.uri,
        this.config.maxFileSize,
        outputFormat
      );
      
      if (additionalCompressionResult) {
        // Update result with the additional compressed version
        const compressedFileInfo = await FileSystem.getInfoAsync(additionalCompressionResult.uri);
        finalFileSize = (compressedFileInfo as any).size || 0;
        
        return {
          uri: additionalCompressionResult.uri,
          originalUri: uri,
          width: additionalCompressionResult.width,
          height: additionalCompressionResult.height,
          fileSize: finalFileSize,
          originalFileSize: originalInfo.fileSize,
          compressionRatio: originalInfo.fileSize > 0 
            ? (originalInfo.fileSize - finalFileSize) / originalInfo.fileSize 
            : 0,
          format: this.mapExpoFormatToString(outputFormat),
          metadata: await this.extractMetadata(uri),
          backgroundRemoved: false,
          orientationCorrected: false,
          enhancementApplied: false,
          processingTime: 0,
          qualityScore: 0,
        };
      }
    }
    
    const compressionRatio =
      originalInfo.fileSize > 0
        ? (originalInfo.fileSize - finalFileSize) / originalInfo.fileSize
        : 0;

    // Extract metadata if needed
    const metadata = await this.extractMetadata(uri);

    return {
      uri: result.uri,
      originalUri: uri,
      width: result.width || targetSize?.width!,
      height: result.height || targetSize?.height!,
      fileSize: finalFileSize,
      originalFileSize: originalInfo.fileSize,
      compressionRatio: Math.max(0, compressionRatio),
      format: this.mapExpoFormatToString(outputFormat),
      metadata,
      backgroundRemoved: false, // Will be set by caller
      orientationCorrected: false, // Will be set by caller
      enhancementApplied: false, // Will be set by caller
      processingTime: 0, // Will be set by caller
      qualityScore: 0, // Will be set by caller
    };
  }

  private determineOptimalQuality(fileSize: number): number {
    if (fileSize < COMPRESSION_LEVELS.MINIMAL.maxFileSize) {
      return COMPRESSION_LEVELS.MINIMAL.quality;
    } else if (fileSize < COMPRESSION_LEVELS.STANDARD.maxFileSize) {
      return COMPRESSION_LEVELS.STANDARD.quality;
    } else if (fileSize < COMPRESSION_LEVELS.AGGRESSIVE.maxFileSize) {
      return COMPRESSION_LEVELS.AGGRESSIVE.quality;
    } else {
      return COMPRESSION_LEVELS.MAXIMUM.quality;
    }
  }

  private calculateTargetSize(originalInfo: {
    width: number;
    height: number;
  }): { width: number; height: number } {
    const maxWidth = this.config.maxResolution?.width!;
    const maxHeight = this.config.maxResolution?.height!;

    if (originalInfo.width <= maxWidth && originalInfo.height <= maxHeight) {
      return { width: originalInfo.width, height: originalInfo.height };
    }

    const aspectRatio = originalInfo.width / originalInfo.height;

    if (aspectRatio > 1) {
      // Landscape
      const width = Math.min(maxWidth, originalInfo.width);
      const height = Math.round(width / aspectRatio);
      return { width, height };
    } else {
      // Portrait or square
      const height = Math.min(maxHeight, originalInfo.height);
      const width = Math.round(height * aspectRatio);
      return { width, height };
    }
  }

  private determineOutputFormat(
    originalFormat: string,
    uri: string,
  ): ImageManipulator.SaveFormat {
    if (this.config.format !== "auto") {
      return this.stringFormatToExpoFormat(this.config.format);
    }

    // Check if image has transparency
    const hasTransparency =
      originalFormat.toLowerCase() === "png" || uri.includes(".png");

    if (hasTransparency && this.config.processing.preserveTransparency) {
      return ImageManipulator.SaveFormat.PNG;
    }

    return ImageManipulator.SaveFormat.JPEG;
  }

  private detectImageFormat(uri: string): string {
    const extension = uri.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
        return "jpeg";
      case "png":
        return "png";
      case "webp":
        return "webp";
      case "heic":
      case "heif":
        return "heic";
      default:
        return "unknown";
    }
  }

  private stringFormatToExpoFormat(
    format: string,
  ): ImageManipulator.SaveFormat {
    switch (format) {
      case "png":
        return ImageManipulator.SaveFormat.PNG;
      case "jpeg":
        return ImageManipulator.SaveFormat.JPEG;
      case "webp":
        return ImageManipulator.SaveFormat.WEBP;
      default:
        return ImageManipulator.SaveFormat.JPEG;
    }
  }

  private mapExpoFormatToString(
    format: ImageManipulator.SaveFormat,
  ): "jpeg" | "png" | "webp" {
    switch (format) {
      case ImageManipulator.SaveFormat.PNG:
        return "png";
      case ImageManipulator.SaveFormat.WEBP:
        return "webp";
      default:
        return "jpeg";
    }
  }

  private async extractMetadata(
    uri: string,
  ): Promise<ImageMetadata | undefined> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const modTime = (fileInfo as any).modificationTime || Date.now();

      const metadata: ImageMetadata = {
        creationDate: new Date(modTime).toISOString(),
        hasTransparency: this.detectTransparency(uri),
      };

      // Add processing history if enabled
      if (this.config.exifProcessing.addProcessingHistory) {
        metadata.processingHistory = [
          {
            timestamp: new Date().toISOString(),
            operation: "image_processing",
            parameters: {
              quality: this.config.quality,
              format: this.config.format,
              maxResolution: this.config.maxResolution,
            },
            software: "useOptimizedImagePicker",
            version: "1.0.0",
          },
        ];
      }

      // Strip sensitive data if configured
      if (this.config.exifProcessing.stripSensitiveData) {
        delete metadata.exifData?.gpsLatitude;
        delete metadata.exifData?.gpsLongitude;
        delete metadata.exifData?.gpsAltitude;
      }

      return metadata;
    } catch (error) {
      console.warn("Failed to extract metadata:", error);
      return undefined;
    }
  }

  private detectTransparency(uri: string): boolean {
    const extension = uri.split(".").pop()?.toLowerCase();
    return extension === "png";
  }

  private async applyEnhancement(uri: string): Promise<string> {
    // Basic enhancement implementation - could be enhanced with native modules
    try {
      if (!this.config.enhancement.enableAutoEnhancement) {
        return uri;
      }

      // Apply basic enhancement using safe ImageManipulator wrapper
      const result = await safeImageManipulator.manipulateAsync(uri, [], {
        compress: Math.min(1.0, this.config.enhancement.qualityTarget + 0.1),
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return result.uri;
    } catch (error) {
      console.warn("Enhancement failed:", error);
      return uri;
    }
  }

  private calculateQualityScore(result: OptimizedImageResult): number {
    // Calculate a quality score based on compression ratio and file size
    const sizeScore = Math.min(1.0, result.fileSize / (512 * 1024)); // Normalize to 512KB
    const compressionScore = 1.0 - Math.min(1.0, result.compressionRatio);

    return Math.round((sizeScore * 0.4 + compressionScore * 0.6) * 100) / 100;
  }

  private async cleanupTempFile(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      console.warn("Failed to cleanup temp file:", error);
    }
  }

  private updateStats(processingTime: number, compressionRatio: number): void {
    this.processingStats.totalProcessed++;
    this.processingStats.totalTime += processingTime;
    this.processingStats.compressionRatios.push(compressionRatio);
  }

  private createProcessingError(originalError: any, message: string): Error {
    const error = new Error(
      `${message}: ${originalError?.message || originalError}`,
    );
    error.stack = originalError?.stack;
    return error;
  }

  getProcessingStats() {
    const avgTime =
      this.processingStats.totalProcessed > 0
        ? this.processingStats.totalTime / this.processingStats.totalProcessed
        : 0;

    const avgCompression =
      this.processingStats.compressionRatios.length > 0
        ? this.processingStats.compressionRatios.reduce((a, b) => a + b) /
          this.processingStats.compressionRatios.length
        : 0;

    return {
      totalImagesProcessed: this.processingStats.totalProcessed,
      averageProcessingTime: avgTime,
      averageCompressionRatio: avgCompression,
      memoryUsage: {
        peak: 0, // Would need native monitoring
        average: 0,
        current: 0,
      },
      errorRate: 0, // Would need error tracking
      cacheHitRate: 0, // Would need cache tracking
    };
  }

  updateConfig(newConfig: ImageOptimizerConfig): void {
    this.config = newConfig;
  }

  /**
   * Validate image URI format and accessibility
   */
  private async validateImageUri(uri: string): Promise<void> {
    if (!uri || typeof uri !== 'string') {
      throw new Error('Invalid image URI: URI is null or not a string');
    }

    // Check URI format
    const validUriPattern = /^(file:\/\/|content:\/\/|data:image\/|https?:\/\/)/;
    if (!validUriPattern.test(uri)) {
      throw new Error(`Invalid image URI format: ${uri}`);
    }

    // Check file accessibility
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error(`Image file does not exist: ${uri}`);
      }
    } catch (error) {
      throw new Error(`Cannot access image file: ${error}`);
    }
  }

  /**
   * Fallback method to get image info when ImageManipulator fails
   */
  private async getImageInfoFallback(uri: string): Promise<{
    width: number;
    height: number;
  }> {
    try {
      // Try using expo-image to get dimensions
      const { Image } = await import('expo-image');
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.naturalWidth || 300,
            height: img.naturalHeight || 300,
          });
        };
        img.onerror = () => {
          // Final fallback: return default dimensions
          resolve({
            width: 300,
            height: 300,
          });
        };
        img.src = uri;
      });
    } catch (error) {
      console.warn('Fallback image info method failed:', error);
      // Return default dimensions as last resort
      return {
        width: 300,
        height: 300,
      };
    }
  }

  /**
   * Apply additional compression to meet file size requirements
   */
  private async applyAdditionalCompression(
    uri: string,
    maxFileSize: number,
    format: ImageManipulator.SaveFormat
  ): Promise<{ uri: string; width: number; height: number } | null> {
    try {
      // Progressive compression strategy
      const compressionLevels = [0.6, 0.5, 0.4, 0.3, 0.2];
      
      for (const quality of compressionLevels) {
        try {
          const result = await safeImageManipulator.manipulateAsync(uri, [], {
            compress: quality,
            format: format,
            base64: false,
          });

          const fileInfo = await FileSystem.getInfoAsync(result.uri);
          const fileSize = (fileInfo as any).size || 0;

          if (fileSize <= maxFileSize) {
            console.log(`Additional compression successful: ${fileSize} bytes (quality: ${quality})`);
            return {
              uri: result.uri,
              width: result.width,
              height: result.height,
            };
          }
        } catch (error) {
          console.warn(`Compression attempt with quality ${quality} failed:`, error);
          continue;
        }
      }

      // If all compression attempts failed, try resizing
      console.warn('All compression attempts failed, trying resizing...');
      
      // Get current dimensions
      const currentInfo = await safeImageManipulator.manipulateAsync(uri, [], {
        compress: 1,
        format: format,
        base64: false,
      });

      const resizeFactors = [0.8, 0.6, 0.5, 0.4];
      
      for (const factor of resizeFactors) {
        try {
          const newWidth = Math.round(currentInfo.width * factor);
          const newHeight = Math.round(currentInfo.height * factor);
          
          const result = await safeImageManipulator.manipulateAsync(uri, [
            { resize: { width: newWidth, height: newHeight } }
          ], {
            compress: 0.3,
            format: format,
            base64: false,
          });

          const fileInfo = await FileSystem.getInfoAsync(result.uri);
          const fileSize = (fileInfo as any).size || 0;

          if (fileSize <= maxFileSize) {
            console.log(`Resize + compression successful: ${fileSize} bytes (${newWidth}x${newHeight})`);
            return {
              uri: result.uri,
              width: result.width,
              height: result.height,
            };
          }
        } catch (error) {
          console.warn(`Resize attempt with factor ${factor} failed:`, error);
          continue;
        }
      }

      console.error('All additional compression attempts failed');
      return null;
    } catch (error) {
      console.error('Additional compression failed:', error);
      return null;
    }
  }
}
