export interface OptimizedImageResult {
  uri: string;
  originalUri: string;
  width: number;
  height: number;
  fileSize: number;
  originalFileSize: number;
  compressionRatio: number;
  format: "jpeg" | "png" | "webp";
  metadata?: ImageMetadata;
  // Advanced results
  alternatives?: CropPreview[];
  qualityScore?: number;
  backgroundRemoved?: boolean;
  backgroundRemovalTime?: number;
  orientationCorrected?: boolean;
  enhancementApplied?: boolean;
  processingTime: number;
}

export interface OptimizedVideoResult {
  uri: string;
  originalUri: string;
  width: number;
  height: number;
  fileSize: number;
  originalFileSize: number;
  compressionRatio: number;
  format: "mp4" | "mov" | "avi";
  duration: number;
  mimeType: string;
  fileName?: string;
  metadata?: VideoMetadata;
  processingTime: number;
}

export interface VideoMetadata {
  duration?: number;
  bitrate?: number;
  frameRate?: number;
  codec?: string;
  orientation?: number;
  creationDate?: string;
  deviceMake?: string;
  deviceModel?: string;
}

export type OptimizedMediaResult = OptimizedImageResult | OptimizedVideoResult;

export interface ImageMetadata {
  orientation?: number;
  creationDate?: string;
  deviceMake?: string;
  deviceModel?: string;
  hasTransparency?: boolean;
  colorSpace?: string;
  processingHistory?: ProcessingHistoryEntry[];
  smartCropping?: SmartCropMetadata;
  enhancement?: EnhancementMetadata;
  exifData?: ExifData;
}

export interface ImagePickerOptions {
  mediaTypes: "images" | "videos" | "all";
  allowsEditing?: boolean;
  quality?: number;
  aspect?: [number, number];
  base64?: boolean;
}

export interface VideoPickerOptions {
  mediaTypes: "videos";
  allowsEditing?: boolean;
  quality?: number;
  base64?: boolean;
}

export interface MediaPickerOptions {
  mediaTypes: "mixed";
  allowsEditing?: boolean;
  quality?: number;
  base64?: boolean;
}

export interface CameraOptions extends ImagePickerOptions {
  cameraType: "front" | "back";
}

export interface MultiImagePickerOptions extends ImagePickerOptions {
  selectionLimit?: number;
  orderedSelection?: boolean;
}

export interface ImageOptimizerConfig {
  maxFileSize: number; // Default: 1MB
  maxResolution: { width: number; height: number } | null; // Default: 1920x1080 & "null" to explicitly declared that image size process not needed
  quality: number; // Default: 0.8
  format: "jpeg" | "png" | "webp" | "auto"; // Default: 'auto'
  enableCropping: boolean; // Default: true
  stripMetadata: boolean; // Default: true
  enableProgressTracking: boolean; // Default: true

  // Advanced processing options
  enableSmartCropping: boolean; // Default: false
  enableProgressiveEnhancement: boolean; // Default: false
  enableNativeThreading: boolean; // Default: false
  enableAdvancedRecovery: boolean; // Default: true
  enablePerformanceMonitoring: boolean; // Default: false

  threading: {
    useBackgroundThread: boolean;
    maxConcurrentOperations: number;
    priority: "low" | "normal" | "high";
    useWorkers: boolean;
    enableBackgroundProcessing: boolean;
  };

  storage: {
    location: "cache" | "documents" | "media_library";
    persistentStorage: boolean;
    autoCleanup: boolean;
    customDirectory?: string;
  };

  processing: {
    enableProgressiveJPEG: boolean;
    preserveTransparency: boolean;
    stripMetadata: boolean;
    enableSmartCropping: boolean;
    compressionAlgorithm: "fast" | "balanced" | "high_quality";
    enableEnhancement: boolean;
    enableBackgroundRemoval: boolean;
  };

  backgroundRemoval: {
    trim: boolean;
    timeout: number;
    enableDeviceCheck: boolean;
  };

  smartCropping: {
    enableFaceDetection: boolean;
    enableCompositionAnalysis: boolean;
    generatePreviews: boolean;
    targetAspectRatio: number;
    minFaceSize: number;
  };

  enhancement: {
    enableAutoEnhancement: boolean;
    enableColorCorrection: boolean;
    enableSharpening: boolean;
    enableNoiseReduction: boolean;
    adaptiveProcessing: boolean;
    qualityTarget: number;
  };

  exifProcessing: {
    stripSensitiveData: boolean;
    stripGpsData: boolean;
    stripCameraInfo: boolean;
    orientationCorrection: boolean;
    addProcessingHistory: boolean;
  };

  fallback: {
    enableFallbackCompression: boolean;
    fallbackQuality: number;
    maxRetryAttempts: number | null;
    enableParameterAdjustment: boolean;
    timeoutMs: number;
  };

  performance: {
    enableMonitoring: boolean;
    enableAlerts: boolean;
    memoryThreshold: number;
    processingTimeThreshold: number;
  };
}

export interface ProcessingStats {
  totalImagesProcessed: number;
  averageProcessingTime: number;
  averageCompressionRatio: number;
  memoryUsage: {
    peak: number;
    average: number;
    current: number;
  };
  errorRate: number;
  cacheHitRate: number;
}

export interface CacheInfo {
  totalFiles: number;
  totalSize: number;
  oldestFile?: Date;
  newestFile?: Date;
}

export interface ImageValidationResult {
  isValid: boolean;
  format?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  errors: string[];
}

export type PresetName =
  | "profile"
  | "document"
  | "social"
  | "storage_saver"
  | "high_performance"
  | "quality_focused";

// Advanced feature interfaces
export interface ProcessingHistoryEntry {
  timestamp: string;
  operation: string;
  parameters: any;
  software: string;
  version: string;
}

export interface SmartCropMetadata {
  facesDetected: number;
  compositionScore: number;
  cropConfidence: number;
  alternativesGenerated: number;
}

export interface EnhancementMetadata {
  colorCorrectionApplied: boolean;
  sharpeningLevel: number;
  noiseReductionLevel: number;
  contrastAdjustment: number;
  brightnessAdjustment: number;
  qualityImprovement: number;
}

export interface ExifData {
  // Camera information
  make?: string;
  model?: string;
  software?: string;

  // Image settings
  orientation?: number;
  xResolution?: number;
  yResolution?: number;

  // Photo settings
  exposureTime?: string;
  fNumber?: number;
  isoSpeedRatings?: number;
  dateTimeOriginal?: string;
  focalLength?: number;

  // GPS information
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: number;

  // Processing history
  processingHistory?: ProcessingHistoryEntry[];
  customTags?: { [key: string]: any };
}

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  type: "face" | "composition" | "edge" | "content";
  priority: number;
}

export interface CropPreview {
  uri: string;
  region: CropRegion;
  width: number;
  height: number;
  quality: number;
}

export interface ImageProcessingError extends Error {
  code: ErrorCode;
  category: "selection" | "processing" | "storage" | "platform" | "memory";
  severity: "low" | "medium" | "high" | "critical";
  recoverySuggestions: string[];
  retryable: boolean;
  platformSpecific?: {
    ios?: string;
    android?: string;
  };
}

export type ErrorCode =
  | "PERMISSION_DENIED"
  | "USER_CANCELLED"
  | "IMAGE_TOO_LARGE"
  | "UNSUPPORTED_FORMAT"
  | "PROCESSING_FAILED"
  | "STORAGE_FULL"
  | "MEMORY_INSUFFICIENT"
  | "NETWORK_ERROR"
  | "BACKGROUND_REMOVAL_FAILED"
  | "BACKGROUND_REMOVAL_UNSUPPORTED"
  | "BACKGROUND_REMOVAL_TIMEOUT"
  | "UNKNOWN_ERROR";

export interface UseOptimizedImagePickerReturn {
  // Primary Functions
  pickImageFromGallery: (
    options?: ImagePickerOptions,
    configOverrides?: Partial<ImageOptimizerConfig>,
  ) => Promise<OptimizedImageResult>;

  captureImageFromCamera: (
    options?: CameraOptions,
    configOverrides?: Partial<ImageOptimizerConfig>,
  ) => Promise<OptimizedImageResult>;

  pickMultipleImages: (
    options?: MultiImagePickerOptions,
    configOverrides?: Partial<ImageOptimizerConfig>,
  ) => Promise<OptimizedImageResult[]>;

  // Video Functions
  pickVideoFromGallery: (
    options?: VideoPickerOptions,
    configOverrides?: Partial<ImageOptimizerConfig>,
  ) => Promise<OptimizedVideoResult>;

  // Mixed Media Functions
  pickMediaFromGallery: (
    options?: MediaPickerOptions,
    configOverrides?: Partial<ImageOptimizerConfig>,
  ) => Promise<OptimizedMediaResult>;

  // State Management
  isProcessing: boolean;
  processingProgress: number;
  error: ImageProcessingError | null;

  // Utility Functions
  clearError: () => void;
  cancelProcessing: () => void;

  // Preset configuration methods
  usePreset: (presetName: PresetName) => void;
  createCustomPreset: (name: string, config: ImageOptimizerConfig) => void;

  // Advanced utility functions
  validateImage: (uri: string) => Promise<ImageValidationResult>;
  getImageMetadata: (uri: string) => Promise<ImageMetadata>;
  estimateProcessingTime: (imageSize: number) => number;

  // Storage management
  getCacheInfo: () => Promise<CacheInfo>;
  clearCache: (olderThan?: Date) => Promise<void>;

  // Performance monitoring
  getProcessingStats: () => ProcessingStats;
}
