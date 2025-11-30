import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { ImageMetadata } from '../types';

export interface ExtendedImageMetadata extends ImageMetadata {
  exif?: {
    make?: string;
    model?: string;
    software?: string;
    dateTime?: string;
    dateTimeOriginal?: string;
    dateTimeDigitized?: string;
    orientation?: number;
    xResolution?: number;
    yResolution?: number;
    resolutionUnit?: number;
    colorSpace?: number;
    pixelXDimension?: number;
    pixelYDimension?: number;
    exposureTime?: number;
    fNumber?: number;
    iso?: number;
    focalLength?: number;
    flash?: number;
    whiteBalance?: number;
    gps?: {
      latitude?: number;
      longitude?: number;
      altitude?: number;
      timestamp?: string;
    };
  };
  technical?: {
    fileSize: number;
    format: string;
    compression: string;
    bitDepth: number;
    channels: number;
  };
  processing?: {
    backgroundRemoved: boolean;
    compressed: boolean;
    resized: boolean;
    formatConverted: boolean;
    optimizationApplied: string[];
  };
}

export interface MetadataStrippingConfig {
  stripGPS: boolean;
  stripDeviceInfo: boolean;
  stripDateTime: boolean;
  stripCameraSettings: boolean;
  preserveOrientation: boolean;
  preserveColorProfile: boolean;
}

export class AdvancedMetadataHandler {
  private static instance: AdvancedMetadataHandler;

  private constructor() {}

  static getInstance(): AdvancedMetadataHandler {
    if (!AdvancedMetadataHandler.instance) {
      AdvancedMetadataHandler.instance = new AdvancedMetadataHandler();
    }
    return AdvancedMetadataHandler.instance;
  }

  /**
   * Extract comprehensive metadata from image
   */
  async extractMetadata(uri: string): Promise<ExtendedImageMetadata> {
    try {
      const [fileInfo, imageInfo, exifData] = await Promise.all([
        this.getFileInfo(uri),
        this.getImageInfo(uri),
        this.extractEXIFData(uri)
      ]);

      const metadata: ExtendedImageMetadata = {
        orientation: exifData?.orientation || 1,
        creationDate: this.extractCreationDate(exifData, fileInfo),
        deviceMake: exifData?.make,
        deviceModel: exifData?.model,
        hasTransparency: this.detectTransparency(uri),
        colorSpace: this.mapColorSpace(exifData?.colorSpace),
        exif: exifData,
        technical: {
          fileSize: fileInfo.size || 0,
          format: this.detectFormat(uri),
          compression: this.detectCompression(uri),
          bitDepth: 8, // Default assumption
          channels: this.detectChannels(uri)
        },
        processing: {
          backgroundRemoved: false,
          compressed: false,
          resized: false,
          formatConverted: false,
          optimizationApplied: []
        }
      };

      return metadata;
    } catch (error) {
      console.warn('Failed to extract metadata:', error);
      return this.createMinimalMetadata(uri);
    }
  }

  /**
   * Strip sensitive metadata based on configuration
   */
  async stripSensitiveMetadata(
    uri: string,
    config: MetadataStrippingConfig
  ): Promise<{ uri: string; metadata: ExtendedImageMetadata }> {
    try {
      const originalMetadata = await this.extractMetadata(uri);
      const cleanedMetadata = this.cleanMetadata(originalMetadata, config);

      // Process image to remove metadata
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: 1,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false
        }
      );

      return {
        uri: result.uri,
        metadata: cleanedMetadata
      };
    } catch (error) {
      throw new Error(`Failed to strip metadata: ${error}`);
    }
  }

  /**
   * Handle orientation correction
   */
  async correctOrientation(
    uri: string,
    metadata: ExtendedImageMetadata
  ): Promise<{ uri: string; corrected: boolean }> {
    const orientation = metadata.orientation || 1;

    // No correction needed for normal orientation
    if (orientation === 1) {
      return { uri, corrected: false };
    }

    try {
      const rotationAngle = this.getRotationAngleFromOrientation(orientation);
      const flipHorizontal = this.shouldFlipHorizontal(orientation);

      const actions: ImageManipulator.Action[] = [];

      if (rotationAngle !== 0) {
        actions.push({ rotate: rotationAngle });
      }

      if (flipHorizontal) {
        actions.push({ flip: ImageManipulator.FlipType.Horizontal });
      }

      if (actions.length === 0) {
        return { uri, corrected: false };
      }

      const result = await ImageManipulator.manipulateAsync(
        uri,
        actions,
        {
          compress: 1,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false
        }
      );

      return { uri: result.uri, corrected: true };
    } catch (error) {
      console.warn('Orientation correction failed:', error);
      return { uri, corrected: false };
    }
  }

  /**
   * Add processing metadata
   */
  addProcessingMetadata(
    metadata: ExtendedImageMetadata,
    operation: string,
    details?: any
  ): ExtendedImageMetadata {
    const updatedMetadata = { ...metadata };
    
    if (!updatedMetadata.processing) {
      updatedMetadata.processing = {
        backgroundRemoved: false,
        compressed: false,
        resized: false,
        formatConverted: false,
        optimizationApplied: []
      };
    }

    switch (operation) {
      case 'background_removal':
        updatedMetadata.processing.backgroundRemoved = true;
        break;
      case 'compression':
        updatedMetadata.processing.compressed = true;
        break;
      case 'resize':
        updatedMetadata.processing.resized = true;
        break;
      case 'format_conversion':
        updatedMetadata.processing.formatConverted = true;
        break;
    }

    updatedMetadata.processing.optimizationApplied.push(
      `${operation}${details ? `:${JSON.stringify(details)}` : ''}`
    );

    return updatedMetadata;
  }

  /**
   * Extract EXIF data (simplified implementation)
   */
  private async extractEXIFData(uri: string): Promise<any> {
    try {
      // In a real implementation, you'd use a library like react-native-exif
      // For now, we'll simulate basic EXIF extraction
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      return {
        orientation: 1,
        make: 'Unknown',
        model: 'Unknown',
        dateTimeOriginal: new Date(fileInfo.modificationTime || Date.now()).toISOString(),
        colorSpace: 1 // sRGB
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get file information
   */
  private async getFileInfo(uri: string): Promise<any> {
    return await FileSystem.getInfoAsync(uri);
  }

  /**
   * Get image information
   */
  private async getImageInfo(uri: string): Promise<any> {
    return await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG
    });
  }

  /**
   * Extract creation date from various sources
   */
  private extractCreationDate(exifData: any, fileInfo: any): string {
    if (exifData?.dateTimeOriginal) {
      return exifData.dateTimeOriginal;
    }
    if (exifData?.dateTime) {
      return exifData.dateTime;
    }
    if (fileInfo?.modificationTime) {
      return new Date(fileInfo.modificationTime).toISOString();
    }
    return new Date().toISOString();
  }

  /**
   * Detect if image has transparency
   */
  private detectTransparency(uri: string): boolean {
    const extension = uri.split('.').pop()?.toLowerCase();
    return extension === 'png' || extension === 'webp';
  }

  /**
   * Map EXIF color space to string
   */
  private mapColorSpace(colorSpace?: number): string | undefined {
    if (!colorSpace) return undefined;
    
    switch (colorSpace) {
      case 1: return 'sRGB';
      case 2: return 'Adobe RGB';
      case 65535: return 'Uncalibrated';
      default: return 'Unknown';
    }
  }

  /**
   * Detect image format
   */
  private detectFormat(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  /**
   * Detect compression type
   */
  private detectCompression(uri: string): string {
    const format = this.detectFormat(uri);
    switch (format) {
      case 'jpg':
      case 'jpeg':
        return 'JPEG';
      case 'png':
        return 'PNG';
      case 'webp':
        return 'WebP';
      default:
        return 'Unknown';
    }
  }

  /**
   * Detect number of channels
   */
  private detectChannels(uri: string): number {
    const hasTransparency = this.detectTransparency(uri);
    return hasTransparency ? 4 : 3; // RGBA vs RGB
  }

  /**
   * Clean metadata based on configuration
   */
  private cleanMetadata(
    metadata: ExtendedImageMetadata,
    config: MetadataStrippingConfig
  ): ExtendedImageMetadata {
    const cleaned = { ...metadata };

    if (cleaned.exif) {
      const cleanedExif = { ...cleaned.exif };

      if (config.stripGPS) {
        delete cleanedExif.gps;
      }

      if (config.stripDeviceInfo) {
        delete cleanedExif.make;
        delete cleanedExif.model;
        delete cleanedExif.software;
      }

      if (config.stripDateTime) {
        delete cleanedExif.dateTime;
        delete cleanedExif.dateTimeOriginal;
        delete cleanedExif.dateTimeDigitized;
      }

      if (config.stripCameraSettings) {
        delete cleanedExif.exposureTime;
        delete cleanedExif.fNumber;
        delete cleanedExif.iso;
        delete cleanedExif.focalLength;
        delete cleanedExif.flash;
        delete cleanedExif.whiteBalance;
      }

      if (!config.preserveOrientation) {
        delete cleanedExif.orientation;
        cleaned.orientation = 1;
      }

      if (!config.preserveColorProfile) {
        delete cleanedExif.colorSpace;
        cleaned.colorSpace = undefined;
      }

      cleaned.exif = cleanedExif;
    }

    return cleaned;
  }

  /**
   * Create minimal metadata when extraction fails
   */
  private createMinimalMetadata(uri: string): ExtendedImageMetadata {
    return {
      orientation: 1,
      creationDate: new Date().toISOString(),
      hasTransparency: this.detectTransparency(uri),
      technical: {
        fileSize: 0,
        format: this.detectFormat(uri),
        compression: this.detectCompression(uri),
        bitDepth: 8,
        channels: this.detectChannels(uri)
      },
      processing: {
        backgroundRemoved: false,
        compressed: false,
        resized: false,
        formatConverted: false,
        optimizationApplied: []
      }
    };
  }

  /**
   * Get rotation angle from EXIF orientation
   */
  private getRotationAngleFromOrientation(orientation: number): number {
    switch (orientation) {
      case 3: return 180;
      case 6: return 90;
      case 8: return 270;
      default: return 0;
    }
  }

  /**
   * Check if image should be flipped horizontally
   */
  private shouldFlipHorizontal(orientation: number): boolean {
    return orientation === 2 || orientation === 4 || orientation === 5 || orientation === 7;
  }

  /**
   * Validate metadata completeness
   */
  validateMetadata(metadata: ExtendedImageMetadata): {
    isValid: boolean;
    missingFields: string[];
    warnings: string[];
  } {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!metadata.technical?.fileSize) {
      missingFields.push('fileSize');
    }

    if (!metadata.technical?.format) {
      missingFields.push('format');
    }

    if (!metadata.creationDate) {
      missingFields.push('creationDate');
    }

    if (metadata.exif?.gps && (!metadata.exif.gps.latitude || !metadata.exif.gps.longitude)) {
      warnings.push('Incomplete GPS data');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings
    };
  }

  /**
   * Get metadata summary for debugging
   */
  getMetadataSummary(metadata: ExtendedImageMetadata): string {
    const summary: string[] = [];

    if (metadata.technical) {
      summary.push(`Format: ${metadata.technical.format}`);
      summary.push(`Size: ${(metadata.technical.fileSize / 1024).toFixed(1)}KB`);
    }

    if (metadata.orientation && metadata.orientation !== 1) {
      summary.push(`Orientation: ${metadata.orientation}`);
    }

    if (metadata.exif?.make && metadata.exif?.model) {
      summary.push(`Device: ${metadata.exif.make} ${metadata.exif.model}`);
    }

    if (metadata.processing?.optimizationApplied.length) {
      summary.push(`Processed: ${metadata.processing.optimizationApplied.join(', ')}`);
    }

    return summary.join(' | ');
  }
}

export default AdvancedMetadataHandler;
