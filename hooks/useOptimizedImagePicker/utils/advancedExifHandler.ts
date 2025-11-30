import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

interface ExifData {
  // Camera information
  make?: string;
  model?: string;
  software?: string;
  
  // Image settings
  orientation?: number;
  xResolution?: number;
  yResolution?: number;
  resolutionUnit?: number;
  
  // Photo settings
  exposureTime?: string;
  fNumber?: number;
  exposureProgram?: number;
  isoSpeedRatings?: number;
  dateTimeOriginal?: string;
  dateTimeDigitized?: string;
  shutterSpeedValue?: number;
  apertureValue?: number;
  brightnessValue?: number;
  exposureBiasValue?: number;
  maxApertureValue?: number;
  meteringMode?: number;
  lightSource?: number;
  flash?: number;
  focalLength?: number;
  
  // GPS information
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: number;
  gpsTimeStamp?: string;
  gpsDateStamp?: string;
  
  // Additional metadata
  colorSpace?: number;
  whiteBalance?: number;
  digitalZoomRatio?: number;
  focalLengthIn35mmFilm?: number;
  sceneCaptureType?: number;
  contrast?: number;
  saturation?: number;
  sharpness?: number;
  
  // Custom fields
  processingHistory?: ProcessingHistoryEntry[];
  customTags?: { [key: string]: any };
}

interface ProcessingHistoryEntry {
  timestamp: string;
  operation: string;
  parameters: any;
  software: string;
  version: string;
}

interface ExifProcessingOptions {
  preserveOriginalExif?: boolean;
  stripSensitiveData?: boolean;
  stripGpsData?: boolean;
  stripCameraInfo?: boolean;
  stripTimestamps?: boolean;
  addProcessingHistory?: boolean;
  customTags?: { [key: string]: any };
  orientationCorrection?: boolean;
  validateIntegrity?: boolean;
}

interface ExifProcessingResult {
  processedUri: string;
  originalExif?: ExifData;
  processedExif?: ExifData;
  orientationCorrected: boolean;
  sensitiveDataStripped: string[];
  processingTime: number;
  warnings: string[];
}

class AdvancedExifHandler {
  private static instance: AdvancedExifHandler;
  private exifCache: Map<string, ExifData> = new Map();
  private processingHistory: Map<string, ProcessingHistoryEntry[]> = new Map();

  public static getInstance(): AdvancedExifHandler {
    if (!AdvancedExifHandler.instance) {
      AdvancedExifHandler.instance = new AdvancedExifHandler();
    }
    return AdvancedExifHandler.instance;
  }

  public async processExifData(
    imageUri: string,
    options: ExifProcessingOptions = {}
  ): Promise<ExifProcessingResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const sensitiveDataStripped: string[] = [];

    const {
      preserveOriginalExif = false,
      stripSensitiveData = true,
      stripGpsData = true,
      stripCameraInfo = false,
      stripTimestamps = false,
      addProcessingHistory = true,
      customTags = {},
      orientationCorrection = true,
      validateIntegrity = true
    } = options;

    try {
      // Extract original EXIF data
      const originalExif = await this.extractExifData(imageUri);
      
      if (validateIntegrity) {
        const integrityWarnings = this.validateExifIntegrity(originalExif);
        warnings.push(...integrityWarnings);
      }

      // Create processed EXIF data
      let processedExif = preserveOriginalExif 
        ? { ...originalExif } 
        : this.createMinimalExif(originalExif);

      // Apply orientation correction if needed
      let orientationCorrected = false;
      let processedUri = imageUri;

      if (orientationCorrection && originalExif.orientation && originalExif.orientation !== 1) {
        processedUri = await this.correctOrientation(imageUri, originalExif.orientation);
        processedExif.orientation = 1; // Reset to normal orientation
        orientationCorrected = true;
      }

      // Strip sensitive data
      if (stripSensitiveData) {
        const stripped = this.stripSensitiveExifData(processedExif, {
          stripGpsData,
          stripCameraInfo,
          stripTimestamps
        });
        processedExif = stripped.exif;
        sensitiveDataStripped.push(...stripped.strippedFields);
      }

      // Add processing history
      if (addProcessingHistory) {
        this.addToProcessingHistory(processedExif, {
          operation: 'exif_processing',
          parameters: options,
          timestamp: new Date().toISOString()
        });
      }

      // Add custom tags
      if (Object.keys(customTags).length > 0) {
        processedExif.customTags = { ...processedExif.customTags, ...customTags };
      }

      // Apply EXIF data to processed image
      if (processedUri !== imageUri || Object.keys(processedExif).length > 0) {
        processedUri = await this.applyExifData(processedUri, processedExif);
      }

      const processingTime = Date.now() - startTime;

      return {
        processedUri,
        originalExif: preserveOriginalExif ? originalExif : undefined,
        processedExif,
        orientationCorrected,
        sensitiveDataStripped,
        processingTime,
        warnings
      };

    } catch (error) {
      throw new Error(`EXIF processing failed: ${error}`);
    }
  }

  private async extractExifData(imageUri: string): Promise<ExifData> {
    const cacheKey = `exif_${imageUri}`;
    
    if (this.exifCache.has(cacheKey)) {
      return this.exifCache.get(cacheKey)!;
    }

    // Mock EXIF extraction - in real implementation, use a proper EXIF library
    const mockExif: ExifData = {
      make: 'Apple',
      model: 'iPhone 14 Pro',
      software: 'iOS 17.0',
      orientation: Math.floor(Math.random() * 8) + 1,
      xResolution: 72,
      yResolution: 72,
      resolutionUnit: 2,
      exposureTime: '1/120',
      fNumber: 1.78,
      exposureProgram: 2,
      isoSpeedRatings: Math.floor(Math.random() * 800) + 100,
      dateTimeOriginal: new Date().toISOString(),
      dateTimeDigitized: new Date().toISOString(),
      focalLength: 26,
      colorSpace: 1,
      whiteBalance: 0,
      flash: 16,
      meteringMode: 5,
      gpsLatitude: Math.random() > 0.5 ? 37.7749 + Math.random() * 0.1 : undefined,
      gpsLongitude: Math.random() > 0.5 ? -122.4194 + Math.random() * 0.1 : undefined,
      processingHistory: [],
      customTags: {}
    };

    this.exifCache.set(cacheKey, mockExif);
    return mockExif;
  }

  private validateExifIntegrity(exif: ExifData): string[] {
    const warnings: string[] = [];

    // Check for suspicious or corrupted data
    if (exif.orientation && (exif.orientation < 1 || exif.orientation > 8)) {
      warnings.push('Invalid orientation value detected');
    }

    if (exif.isoSpeedRatings && (exif.isoSpeedRatings < 25 || exif.isoSpeedRatings > 102400)) {
      warnings.push('Unusual ISO value detected');
    }

    if (exif.fNumber && (exif.fNumber < 0.5 || exif.fNumber > 32)) {
      warnings.push('Unusual f-number detected');
    }

    // Check for timestamp consistency
    if (exif.dateTimeOriginal && exif.dateTimeDigitized) {
      const original = new Date(exif.dateTimeOriginal);
      const digitized = new Date(exif.dateTimeDigitized);
      const diff = Math.abs(original.getTime() - digitized.getTime());
      
      if (diff > 24 * 60 * 60 * 1000) { // More than 24 hours difference
        warnings.push('Large timestamp difference between original and digitized dates');
      }
    }

    // Check GPS coordinates validity
    if (exif.gpsLatitude && (exif.gpsLatitude < -90 || exif.gpsLatitude > 90)) {
      warnings.push('Invalid GPS latitude');
    }

    if (exif.gpsLongitude && (exif.gpsLongitude < -180 || exif.gpsLongitude > 180)) {
      warnings.push('Invalid GPS longitude');
    }

    return warnings;
  }

  private createMinimalExif(originalExif: ExifData): ExifData {
    return {
      orientation: originalExif.orientation || 1,
      xResolution: originalExif.xResolution || 72,
      yResolution: originalExif.yResolution || 72,
      resolutionUnit: originalExif.resolutionUnit || 2,
      colorSpace: originalExif.colorSpace || 1,
      processingHistory: [],
      customTags: {}
    };
  }

  private async correctOrientation(imageUri: string, orientation: number): Promise<string> {
    const transformations: any[] = [];

    switch (orientation) {
      case 2:
        transformations.push({ flip: { vertical: true } });
        break;
      case 3:
        transformations.push({ rotate: 180 });
        break;
      case 4:
        transformations.push({ flip: { horizontal: true } });
        break;
      case 5:
        transformations.push({ rotate: 90 }, { flip: { vertical: true } });
        break;
      case 6:
        transformations.push({ rotate: 90 });
        break;
      case 7:
        transformations.push({ rotate: 270 }, { flip: { vertical: true } });
        break;
      case 8:
        transformations.push({ rotate: 270 });
        break;
      default:
        return imageUri; // No correction needed
    }

    const result = await manipulateAsync(
      imageUri,
      transformations,
      {
        compress: 1.0, // No compression for orientation correction
        format: SaveFormat.JPEG
      }
    );

    return result.uri;
  }

  private stripSensitiveExifData(
    exif: ExifData,
    options: {
      stripGpsData: boolean;
      stripCameraInfo: boolean;
      stripTimestamps: boolean;
    }
  ): { exif: ExifData; strippedFields: string[] } {
    const strippedExif = { ...exif };
    const strippedFields: string[] = [];

    if (options.stripGpsData) {
      if (strippedExif.gpsLatitude) {
        delete strippedExif.gpsLatitude;
        strippedFields.push('GPS Latitude');
      }
      if (strippedExif.gpsLongitude) {
        delete strippedExif.gpsLongitude;
        strippedFields.push('GPS Longitude');
      }
      if (strippedExif.gpsAltitude) {
        delete strippedExif.gpsAltitude;
        strippedFields.push('GPS Altitude');
      }
      if (strippedExif.gpsTimeStamp) {
        delete strippedExif.gpsTimeStamp;
        strippedFields.push('GPS Timestamp');
      }
      if (strippedExif.gpsDateStamp) {
        delete strippedExif.gpsDateStamp;
        strippedFields.push('GPS Date');
      }
    }

    if (options.stripCameraInfo) {
      if (strippedExif.make) {
        delete strippedExif.make;
        strippedFields.push('Camera Make');
      }
      if (strippedExif.model) {
        delete strippedExif.model;
        strippedFields.push('Camera Model');
      }
      if (strippedExif.software) {
        delete strippedExif.software;
        strippedFields.push('Software');
      }
    }

    if (options.stripTimestamps) {
      if (strippedExif.dateTimeOriginal) {
        delete strippedExif.dateTimeOriginal;
        strippedFields.push('Original Date/Time');
      }
      if (strippedExif.dateTimeDigitized) {
        delete strippedExif.dateTimeDigitized;
        strippedFields.push('Digitized Date/Time');
      }
    }

    return { exif: strippedExif, strippedFields };
  }

  private addToProcessingHistory(exif: ExifData, entry: Partial<ProcessingHistoryEntry>): void {
    if (!exif.processingHistory) {
      exif.processingHistory = [];
    }

    const historyEntry: ProcessingHistoryEntry = {
      timestamp: entry.timestamp || new Date().toISOString(),
      operation: entry.operation || 'unknown',
      parameters: entry.parameters || {},
      software: entry.software || 'DigitizeAppImagePicker',
      version: entry.version || '1.0.0'
    };

    exif.processingHistory.push(historyEntry);

    // Limit history to last 10 entries
    if (exif.processingHistory.length > 10) {
      exif.processingHistory = exif.processingHistory.slice(-10);
    }
  }

  private async applyExifData(imageUri: string, exif: ExifData): Promise<string> {
    // Note: expo-image-manipulator doesn't support writing EXIF data
    // In a real implementation, you'd use a library that can write EXIF data
    // For now, we'll just return the URI as-is
    
    // Store the EXIF data in our cache for later retrieval
    this.exifCache.set(`processed_${imageUri}`, exif);
    
    return imageUri;
  }

  public async getProcessingHistory(imageUri: string): Promise<ProcessingHistoryEntry[]> {
    const exif = await this.extractExifData(imageUri);
    return exif.processingHistory || [];
  }

  public async compareExifData(uri1: string, uri2: string): Promise<{
    differences: Array<{ field: string; value1: any; value2: any }>;
    similarity: number;
  }> {
    const exif1 = await this.extractExifData(uri1);
    const exif2 = await this.extractExifData(uri2);

    const differences: Array<{ field: string; value1: any; value2: any }> = [];
    const allFields = new Set([...Object.keys(exif1), ...Object.keys(exif2)]);
    
    let matchingFields = 0;
    let totalFields = allFields.size;

    for (const field of allFields) {
      const value1 = (exif1 as any)[field];
      const value2 = (exif2 as any)[field];

      if (JSON.stringify(value1) !== JSON.stringify(value2)) {
        differences.push({ field, value1, value2 });
      } else {
        matchingFields++;
      }
    }

    const similarity = totalFields > 0 ? matchingFields / totalFields : 1;

    return { differences, similarity };
  }

  public async generateExifReport(imageUri: string): Promise<{
    summary: string;
    details: ExifData;
    privacy: {
      hasGpsData: boolean;
      hasCameraInfo: boolean;
      hasTimestamps: boolean;
      privacyScore: number; // 0-1, higher is more private
    };
    recommendations: string[];
  }> {
    const exif = await this.extractExifData(imageUri);
    
    const hasGpsData = !!(exif.gpsLatitude || exif.gpsLongitude);
    const hasCameraInfo = !!(exif.make || exif.model);
    const hasTimestamps = !!(exif.dateTimeOriginal || exif.dateTimeDigitized);
    
    let privacyScore = 1.0;
    if (hasGpsData) privacyScore -= 0.4;
    if (hasCameraInfo) privacyScore -= 0.2;
    if (hasTimestamps) privacyScore -= 0.2;
    
    const recommendations: string[] = [];
    if (hasGpsData) recommendations.push('Consider removing GPS location data');
    if (hasCameraInfo) recommendations.push('Camera information reveals device details');
    if (hasTimestamps) recommendations.push('Timestamps can reveal when photo was taken');
    
    const summary = `Image contains ${Object.keys(exif).length} EXIF fields. ` +
                   `Privacy score: ${(privacyScore * 100).toFixed(0)}%`;

    return {
      summary,
      details: exif,
      privacy: {
        hasGpsData,
        hasCameraInfo,
        hasTimestamps,
        privacyScore
      },
      recommendations
    };
  }

  public clearCache(): void {
    this.exifCache.clear();
    this.processingHistory.clear();
  }

  public getCacheStats(): { exifCache: number; processingHistory: number } {
    return {
      exifCache: this.exifCache.size,
      processingHistory: this.processingHistory.size
    };
  }
}

// Batch EXIF processor
class BatchExifProcessor {
  private processingQueue: Array<{
    imageUri: string;
    options: ExifProcessingOptions;
    resolve: (result: ExifProcessingResult) => void;
    reject: (error: Error) => void;
  }> = [];
  
  private isProcessing = false;
  private maxConcurrent = 3;

  public async processMultipleImages(
    imageUris: string[],
    options: ExifProcessingOptions = {}
  ): Promise<ExifProcessingResult[]> {
    const promises = imageUris.map(uri => 
      new Promise<ExifProcessingResult>((resolve, reject) => {
        this.processingQueue.push({ imageUri: uri, options, resolve, reject });
      })
    );

    this.processQueue();
    return Promise.all(promises);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;
    const handler = AdvancedExifHandler.getInstance();

    while (this.processingQueue.length > 0) {
      const batch = this.processingQueue.splice(0, this.maxConcurrent);
      
      await Promise.all(
        batch.map(async ({ imageUri, options, resolve, reject }) => {
          try {
            const result = await handler.processExifData(imageUri, options);
            resolve(result);
          } catch (error) {
            reject(error as Error);
          }
        })
      );
    }

    this.isProcessing = false;
  }
}

// Export instances and types
export const advancedExifHandler = AdvancedExifHandler.getInstance();
export const batchExifProcessor = new BatchExifProcessor();

export type {
  ExifData,
  ExifProcessingOptions,
  ExifProcessingResult,
  ProcessingHistoryEntry
};
