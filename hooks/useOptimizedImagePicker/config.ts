import { ImageOptimizerConfig, PresetName } from './types';

export const DEFAULT_CONFIG: ImageOptimizerConfig = {
  maxFileSize: 1024 * 1024, // 1MB
  maxResolution: { width: 1920, height: 1080 },
  quality: 0.8,
  format: 'auto',
  enableCropping: true,
  stripMetadata: true,
  enableProgressTracking: true,
  
  // Advanced processing options
  enableSmartCropping: false,
  enableProgressiveEnhancement: false,
  enableNativeThreading: false,
  enableAdvancedRecovery: true,
  enablePerformanceMonitoring: false,
  
  threading: {
    useBackgroundThread: true,
    maxConcurrentOperations: 2,
    priority: 'normal',
    useWorkers: false,
    enableBackgroundProcessing: false
  },
  
  storage: {
    location: 'cache',
    persistentStorage: false,
    autoCleanup: true,
    customDirectory: undefined
  },
  
  processing: {
    enableProgressiveJPEG: true,
    preserveTransparency: true,
    stripMetadata: true,
    enableSmartCropping: false,
    compressionAlgorithm: 'balanced',
    enableEnhancement: false,
    enableBackgroundRemoval: false
  },
  
  backgroundRemoval: {
    trim: true,
    timeout: 30000,
    enableDeviceCheck: true
  },
  
  smartCropping: {
    enableFaceDetection: false,
    enableCompositionAnalysis: false,
    generatePreviews: false,
    targetAspectRatio: 1.0,
    minFaceSize: 50
  },
  
  enhancement: {
    enableAutoEnhancement: false,
    enableColorCorrection: false,
    enableSharpening: false,
    enableNoiseReduction: false,
    adaptiveProcessing: false,
    qualityTarget: 0.85
  },
  
  exifProcessing: {
    stripSensitiveData: true,
    stripGpsData: true,
    stripCameraInfo: false,
    orientationCorrection: true,
    addProcessingHistory: false
  },
  
  fallback: {
    enableFallbackCompression: true,
    fallbackQuality: 0.6,
    maxRetryAttempts: 3,
    enableParameterAdjustment: true,
    timeoutMs: 30000
  },
  
  performance: {
    enableMonitoring: false,
    enableAlerts: false,
    memoryThreshold: 100 * 1024 * 1024, // 100MB
    processingTimeThreshold: 15000 // 15 seconds
  }
};

export const PRESET_CONFIGS: Record<PresetName, Partial<ImageOptimizerConfig>> = {
  profile: {
    maxResolution: { width: 512, height: 512 },
    quality: 0.9,
    format: 'jpeg',
    enableCropping: true,
    enableSmartCropping: true,
    processing: {
      ...DEFAULT_CONFIG.processing,
      enableSmartCropping: true,
      compressionAlgorithm: 'high_quality',
      enableBackgroundRemoval: true
    },
    smartCropping: {
      ...DEFAULT_CONFIG.smartCropping,
      enableFaceDetection: true,
      generatePreviews: true,
      targetAspectRatio: 1.0
    }
  },
  
  document: {
    quality: 0.95,
    format: 'jpeg',
    enableCropping: false,
    stripMetadata: false,
    processing: {
      ...DEFAULT_CONFIG.processing,
      enableSmartCropping: false,
      compressionAlgorithm: 'high_quality',
      enableBackgroundRemoval: false
    },
    exifProcessing: {
      ...DEFAULT_CONFIG.exifProcessing,
      stripSensitiveData: false,
      stripGpsData: false,
      stripCameraInfo: false
    }
  },
  
  social: {
    maxResolution: { width: 1080, height: 1080 },
    quality: 0.85,
    format: 'jpeg',
    enableProgressiveEnhancement: true,
    processing: {
      ...DEFAULT_CONFIG.processing,
      enableProgressiveJPEG: true,
      compressionAlgorithm: 'balanced',
      enableEnhancement: true,
      enableBackgroundRemoval: true
    },
    enhancement: {
      ...DEFAULT_CONFIG.enhancement,
      enableAutoEnhancement: true,
      enableColorCorrection: true,
      qualityTarget: 0.85
    }
  },
  
  storage_saver: {
    maxFileSize: 512 * 1024, // 512KB
    maxResolution: { width: 800, height: 600 },
    quality: 0.65,
    format: 'jpeg',
    processing: {
      ...DEFAULT_CONFIG.processing,
      compressionAlgorithm: 'fast',
      enableBackgroundRemoval: false
    },
    performance: {
      ...DEFAULT_CONFIG.performance,
      enableMonitoring: true
    }
  },
  
  high_performance: {
    enableNativeThreading: true,
    enablePerformanceMonitoring: true,
    threading: {
      ...DEFAULT_CONFIG.threading,
      useWorkers: true,
      enableBackgroundProcessing: true,
      maxConcurrentOperations: 4,
      priority: 'high'
    },
    performance: {
      ...DEFAULT_CONFIG.performance,
      enableMonitoring: true,
      enableAlerts: true
    }
  },
  
  quality_focused: {
    quality: 0.95,
    format: 'png',
    enableProgressiveEnhancement: true,
    enableSmartCropping: true,
    processing: {
      ...DEFAULT_CONFIG.processing,
      enableProgressiveJPEG: false,
      preserveTransparency: true,
      enableSmartCropping: true,
      compressionAlgorithm: 'high_quality',
      enableEnhancement: true
    },
    enhancement: {
      ...DEFAULT_CONFIG.enhancement,
      enableAutoEnhancement: true,
      enableColorCorrection: true,
      enableSharpening: true,
      enableNoiseReduction: true,
      qualityTarget: 0.95
    }
  }
};

export const COMPRESSION_LEVELS = {
  MINIMAL: { quality: 0.95, maxFileSize: 2 * 1024 * 1024 },
  STANDARD: { quality: 0.85, maxFileSize: 1024 * 1024 },
  AGGRESSIVE: { quality: 0.75, maxFileSize: 512 * 1024 },
  MAXIMUM: { quality: 0.65, maxFileSize: 256 * 1024 }
};

export const STORAGE_CONFIG = {
  CACHE_DIRECTORY: 'optimized_images',
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_CACHE_FILES: 50,
  MAX_FILE_AGE: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  CLEANUP_INTERVAL: 60 * 60 * 1000 // 1 hour in milliseconds
};