import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CacheInfo,
  CameraOptions,
  ImageMetadata,
  ImageOptimizerConfig,
  ImagePickerOptions,
  ImageProcessingError,
  ImageValidationResult,
  MediaPickerOptions,
  MultiImagePickerOptions,
  OptimizedImageResult,
  OptimizedMediaResult,
  OptimizedVideoResult,
  PresetName,
  ProcessingStats,
  UseOptimizedImagePickerReturn,
  VideoPickerOptions,
} from "./types";
import { DEFAULT_CONFIG, PRESET_CONFIGS } from "./config";
import { ImagePickerCore } from "./core/imagePicker";
import { PermissionManager } from "./core/permissionManager";
import { StorageManager } from "./utils/storageManager";
import { ImageValidator } from "./utils/validation";
import {
  EnhancedErrorHandler,
  ImageProcessingCircuitBreaker,
  withAutoRetry,
} from "./utils/enhancedErrorHandling";
import {
  MemoryPressureDetector,
  PerformanceMonitor,
} from "./utils/performanceMonitor";

export function useOptimizedImagePicker(
  initialConfig?: Partial<ImageOptimizerConfig>,
): UseOptimizedImagePickerReturn {
  // Merge initial config with defaults
  const config = useMemo(
    () => ({
      ...DEFAULT_CONFIG,
      ...initialConfig,
    }),
    [initialConfig],
  );

  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<ImageProcessingError | null>(null);
  const [currentConfig, setCurrentConfig] =
    useState<ImageOptimizerConfig>(config);

  // Core instances
  const imagePickerRef = useRef<ImagePickerCore>(
    new ImagePickerCore(currentConfig),
  );
  const permissionManager = useRef(PermissionManager.getInstance());
  const storageManager = useRef(StorageManager.getInstance());
  const errorHandler = useRef(EnhancedErrorHandler.getInstance());
  const performanceMonitor = useRef(
    PerformanceMonitor.getInstance(
      100, // maxMetricsHistory
      currentConfig.performance.memoryThreshold,
      currentConfig.performance.processingTimeThreshold,
    ),
  );
  const circuitBreaker = useRef(new ImageProcessingCircuitBreaker());
  const processingCancelRef = useRef<(() => void) | null>(null);

  // Memory pressure monitoring
  useEffect(() => {
    if (currentConfig.performance.enableMonitoring) {
      const memoryDetector = MemoryPressureDetector.getInstance();
      const cleanup = memoryDetector.onMemoryPressure((pressure) => {
        if (pressure === "high" && currentConfig.performance.enableAlerts) {
          console.warn(
            "High memory pressure detected - consider reducing processing load",
          );
        }
      });
      return cleanup;
    }
  }, [
    currentConfig.performance.enableMonitoring,
    currentConfig.performance.enableAlerts,
  ]);

  // Update config when it changes
  useEffect(() => {
    imagePickerRef.current.updateConfig(currentConfig);
  }, [currentConfig]);

  // Primary Functions
  const pickImageFromGallery = useCallback(
    async (
      options: ImagePickerOptions = { mediaTypes: "images" },
      configOverrides?: Partial<ImageOptimizerConfig>,
    ): Promise<OptimizedImageResult> => {
      const operationId = currentConfig.performance.enableMonitoring
        ? performanceMonitor.current.startOperation("pickImageFromGallery")
        : "";

      setIsProcessing(true);
      setProcessingProgress(0);
      setError(null);

      try {
        // Enhanced error handling with circuit breaker
        return await circuitBreaker.current.execute(async () => {
          // Check permissions first
          setProcessingProgress(10);
          const permissionResult =
            await permissionManager.current.requestMediaLibraryPermission();
          if (!permissionResult.granted) {
            throw new Error("Media library permission denied");
          }

          setProcessingProgress(30);

          // Merge config overrides
          const effectiveConfig = configOverrides
            ? { ...currentConfig, ...configOverrides }
            : currentConfig;
          if (configOverrides) {
            imagePickerRef.current.updateConfig(effectiveConfig);
          }

          // Auto-retry wrapper for the main operation
          const result = await withAutoRetry(
            async () => {
              const pickResult = await imagePickerRef.current.pickFromGallery(
                options,
                configOverrides,
              );
              setProcessingProgress(80);
              return pickResult;
            },
            errorHandler.current,
            effectiveConfig.fallback.maxRetryAttempts,
          );

          // Store processed image if caching is enabled
          if (effectiveConfig.storage.autoCleanup) {
            await storageManager.current.storeProcessedImage(
              result.originalUri,
              result.uri,
            );
          }

          setProcessingProgress(100);

          // Mark operation as successful
          if (operationId) {
            performanceMonitor.current.endOperation(operationId, true);
          }

          return result;
        });
      } catch (err: any) {
        const processingError = errorHandler.current.createImageProcessingError(
          err,
          "selection",
        );
        setError(processingError);

        // Mark operation as failed
        if (operationId) {
          performanceMonitor.current.endOperation(
            operationId,
            false,
            err.message,
          );
        }

        throw processingError;
      } finally {
        setIsProcessing(false);
        setProcessingProgress(0);
      }
    },
    [currentConfig],
  );

  const captureImageFromCamera = useCallback(
    async (
      options: CameraOptions = { mediaTypes: "images", cameraType: "back" },
      configOverrides?: Partial<ImageOptimizerConfig>,
    ): Promise<OptimizedImageResult> => {
      setIsProcessing(true);
      setProcessingProgress(0);
      setError(null);

      try {
        // Check permissions first
        setProcessingProgress(10);
        const permissionResult =
          await permissionManager.current.requestCameraPermission();
        if (!permissionResult.granted) {
          throw new Error("Camera permission denied");
        }

        setProcessingProgress(30);

        // Merge config overrides
        const effectiveConfig = configOverrides
          ? { ...currentConfig, ...configOverrides }
          : currentConfig;
        if (configOverrides) {
          imagePickerRef.current.updateConfig(effectiveConfig);
        }

        // Capture and process image
        const result = await imagePickerRef.current.captureFromCamera(
          options,
          configOverrides,
        );

        setProcessingProgress(80);

        // Store processed image if caching is enabled
        if (effectiveConfig.storage.autoCleanup) {
          await storageManager.current.storeProcessedImage(
            result.originalUri,
            result.uri,
          );
        }

        setProcessingProgress(100);
        return result;
      } catch (err: any) {
        const processingError = errorHandler.current.createImageProcessingError(
          err,
          "selection",
        );
        setError(processingError);
        throw processingError;
      } finally {
        setIsProcessing(false);
        setProcessingProgress(0);
      }
    },
    [currentConfig],
  );

  const pickVideoFromGallery = useCallback(
    async (
      options: VideoPickerOptions = { mediaTypes: "videos" },
      configOverrides?: Partial<ImageOptimizerConfig>,
    ): Promise<OptimizedVideoResult> => {
      const operationId = currentConfig.performance.enableMonitoring
        ? performanceMonitor.current.startOperation("pickVideoFromGallery")
        : "";

      setIsProcessing(true);
      setProcessingProgress(0);
      setError(null);

      try {
        // Enhanced error handling with circuit breaker
        return await circuitBreaker.current.execute(async () => {
          // Check permissions first
          setProcessingProgress(10);
          const permissionResult =
            await permissionManager.current.requestMediaLibraryPermission();
          if (!permissionResult.granted) {
            throw new Error("Media library permission denied");
          }

          setProcessingProgress(30);

          // Merge config overrides
          const effectiveConfig = configOverrides
            ? { ...currentConfig, ...configOverrides }
            : currentConfig;
          if (configOverrides) {
            imagePickerRef.current.updateConfig(effectiveConfig);
          }

          // Auto-retry wrapper for the main operation
          const result = await withAutoRetry(
            async () => {
              const pickResult =
                await imagePickerRef.current.pickVideoFromGallery(
                  options,
                  configOverrides,
                );
              setProcessingProgress(80);
              return pickResult;
            },
            errorHandler.current,
            effectiveConfig.fallback.maxRetryAttempts,
          );

          // Store processed video if caching is enabled
          if (effectiveConfig.storage.autoCleanup) {
            await storageManager.current.storeProcessedVideo(
              result.originalUri,
              result.uri,
            );
          }

          setProcessingProgress(100);

          // Mark operation as successful
          if (operationId) {
            performanceMonitor.current.endOperation(operationId, true);
          }

          return result;
        });
      } catch (err: any) {
        const processingError = errorHandler.current.createImageProcessingError(
          err,
          "selection",
        );
        setError(processingError);

        // Mark operation as failed
        if (operationId) {
          performanceMonitor.current.endOperation(operationId, false);
        }

        throw processingError;
      } finally {
        setIsProcessing(false);
        setProcessingProgress(0);
      }
    },
    [currentConfig],
  );

  const pickMediaFromGallery = useCallback(
    async (
      options: MediaPickerOptions = { mediaTypes: "mixed" },
      configOverrides?: Partial<ImageOptimizerConfig>,
    ): Promise<OptimizedMediaResult> => {
      const operationId = currentConfig.performance.enableMonitoring
        ? performanceMonitor.current.startOperation("pickMediaFromGallery")
        : "";

      setIsProcessing(true);
      setProcessingProgress(0);
      setError(null);

      try {
        // Enhanced error handling with circuit breaker
        return await circuitBreaker.current.execute(async () => {
          // Check permissions first
          setProcessingProgress(10);
          const permissionResult =
            await permissionManager.current.requestMediaLibraryPermission();
          if (!permissionResult.granted) {
            throw new Error("Media library permission denied");
          }

          setProcessingProgress(30);

          // Merge config overrides
          const effectiveConfig = configOverrides
            ? { ...currentConfig, ...configOverrides }
            : currentConfig;
          if (configOverrides) {
            imagePickerRef.current.updateConfig(effectiveConfig);
          }

          // Auto-retry wrapper for the main operation
          const result = await withAutoRetry(
            async () => {
              const pickResult =
                await imagePickerRef.current.pickMediaFromGallery(
                  options,
                  configOverrides,
                );
              setProcessingProgress(80);
              return pickResult;
            },
            errorHandler.current,
            effectiveConfig.fallback.maxRetryAttempts,
          );

          // Store processed media if caching is enabled
          if (effectiveConfig.storage.autoCleanup) {
            if ("duration" in result) {
              // It's a video
              await storageManager.current.storeProcessedVideo(
                result.originalUri,
                result.uri,
              );
            } else {
              // It's an image
              await storageManager.current.storeProcessedImage(
                result.originalUri,
                result.uri,
              );
            }
          }

          setProcessingProgress(100);

          // Mark operation as successful
          if (operationId) {
            performanceMonitor.current.endOperation(operationId, true);
          }

          return result;
        });
      } catch (err: any) {
        const processingError = errorHandler.current.createImageProcessingError(
          err,
          "selection",
        );
        setError(processingError);

        // Mark operation as failed
        if (operationId) {
          performanceMonitor.current.endOperation(operationId, false);
        }
        throw processingError;
      } finally {
        setIsProcessing(false);
        setProcessingProgress(0);
      }
    },
    [currentConfig],
  );

  const pickMultipleImages = useCallback(
    async (
      options: MultiImagePickerOptions = { mediaTypes: "images" },
      configOverrides?: Partial<ImageOptimizerConfig>,
    ): Promise<OptimizedImageResult[]> => {
      setIsProcessing(true);
      setProcessingProgress(0);
      setError(null);

      try {
        // Check permissions first
        setProcessingProgress(5);
        const permissionResult =
          await permissionManager.current.requestMediaLibraryPermission();
        if (!permissionResult.granted) {
          throw new Error("Media library permission denied");
        }

        setProcessingProgress(15);

        // Merge config overrides
        const effectiveConfig = configOverrides
          ? { ...currentConfig, ...configOverrides }
          : currentConfig;
        if (configOverrides) {
          imagePickerRef.current.updateConfig(effectiveConfig);
        }

        // Pick and process images
        const results = await imagePickerRef.current.pickMultipleImages(
          options,
          configOverrides,
        );

        setProcessingProgress(80);

        // Store processed images if caching is enabled
        if (effectiveConfig.storage.autoCleanup) {
          for (const result of results) {
            await storageManager.current.storeProcessedImage(
              result.originalUri,
              result.uri,
            );
          }
        }

        setProcessingProgress(100);
        return results;
      } catch (err: any) {
        const processingError = errorHandler.current.createImageProcessingError(
          err,
          "selection",
        );
        setError(processingError);
        throw processingError;
      } finally {
        setIsProcessing(false);
        setProcessingProgress(0);
      }
    },
    [currentConfig],
  );

  // Utility Functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cancelProcessing = useCallback(() => {
    if (processingCancelRef.current) {
      processingCancelRef.current();
      processingCancelRef.current = null;
    }
    setIsProcessing(false);
    setProcessingProgress(0);
  }, []);

  // Preset management
  const usePreset = useCallback((presetName: PresetName) => {
    const presetConfig = PRESET_CONFIGS[presetName];
    if (presetConfig) {
      setCurrentConfig((prev) => ({ ...prev, ...presetConfig }));
    }
  }, []);

  const createCustomPreset = useCallback(
    (name: string, config: ImageOptimizerConfig) => {
      // In a real implementation, you might want to persist this to storage
      if (__DEV__) {
        console.log(`Creating custom preset "${name}" with config:`, config);
      }
      setCurrentConfig(config);
    },
    [],
  );

  // Advanced utility functions
  const validateImage = useCallback(
    async (uri: string): Promise<ImageValidationResult> => {
      try {
        return await ImageValidator.validateImage(uri);
      } catch (error) {
        return {
          isValid: false,
          errors: [`Validation failed: ${error}`],
        };
      }
    },
    [],
  );

  const getImageMetadata = useCallback(
    async (uri: string): Promise<ImageMetadata> => {
      try {
        const result = await imagePickerRef.current.getImageMetadata?.(uri);
        return result || {};
      } catch (error) {
        if (__DEV__) {
          console.warn("Failed to get image metadata:", error);
        }
        return {};
      }
    },
    [],
  );

  const estimateProcessingTime = useCallback((imageSize: number): number => {
    // Basic estimation: ~1ms per 10KB
    return Math.max(100, imageSize / 10000);
  }, []);

  // Storage management
  const getCacheInfo = useCallback(async (): Promise<CacheInfo> => {
    return storageManager.current.getCacheInfo();
  }, []);

  const clearCache = useCallback(async (olderThan?: Date): Promise<void> => {
    return storageManager.current.clearCache(olderThan);
  }, []);

  // Performance monitoring
  const getProcessingStats = useCallback((): ProcessingStats => {
    if (currentConfig.performance.enableMonitoring) {
      return performanceMonitor.current.getProcessingStats();
    } else {
      return imagePickerRef.current.getProcessingStats();
    }
  }, [currentConfig.performance.enableMonitoring]);

  return {
    // Primary Functions
    pickImageFromGallery,
    captureImageFromCamera,
    pickMultipleImages,
    pickVideoFromGallery,
    pickMediaFromGallery,

    // State Management
    isProcessing,
    processingProgress,
    error,

    // Utility Functions
    clearError,
    cancelProcessing,

    // Preset configuration methods
    usePreset,
    createCustomPreset,

    // Advanced utility functions
    validateImage,
    getImageMetadata,
    estimateProcessingTime,

    // Storage management
    getCacheInfo,
    clearCache,

    // Performance monitoring
    getProcessingStats,
  };
}

// Export types and config for external use
export * from "./types";
export * from "./config";
