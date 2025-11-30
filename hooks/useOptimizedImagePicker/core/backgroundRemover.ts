import { Platform } from 'react-native';
import { removeBackground } from '@jacobjmc/react-native-background-remover';
import { ImageProcessingError, ErrorCode } from '../types';

export interface BackgroundRemovalOptions {
  trim?: boolean;
  timeout?: number;
}

export interface BackgroundRemovalResult {
  uri: string;
  originalUri: string;
  backgroundRemoved: boolean;
  processingTime: number;
  width?: number;
  height?: number;
  error?: ImageProcessingError;
}

export interface DeviceCapability {
  isSupported: boolean;
  platform: 'ios' | 'android';
  osVersion?: string;
  reason?: string;
}

/**
 * Check if background removal is supported on the current device
 */
export const checkBackgroundRemovalSupport = async (): Promise<DeviceCapability> => {
  try {
    // For @jacobjmc/react-native-background-remover, check iOS version and device
    let isSupported = false;

    if (Platform.OS === 'ios') {
      // Requires iOS 17.0+ and physical device
      const iosVersion = parseInt(Platform.Version.toString(), 10);
      isSupported = iosVersion >= 17;
    } else if (Platform.OS === 'android') {
      // Requires Android API 24+
      const androidVersion = parseInt(Platform.Version.toString(), 10);
      isSupported = androidVersion >= 24;
    }

    return {
      isSupported,
      platform: Platform.OS as 'ios' | 'android',
      osVersion: Platform.Version.toString(),
      reason: isSupported ? undefined : getUnsupportedReason()
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('Background removal capability check failed:', error);
    }
    return {
      isSupported: false,
      platform: Platform.OS as 'ios' | 'android',
      reason: 'Capability check failed'
    };
  }
};

/**
 * Get reason why background removal is not supported
 */
const getUnsupportedReason = (): string => {
  if (Platform.OS === 'ios') {
    return 'Requires iOS 17+ with Vision framework';
  } else if (Platform.OS === 'android') {
    return 'Requires Android API 24+ with MLKit';
  }
  return 'Platform not supported';
};

/**
 * Remove background from image using native ML processing
 */
export const processBackgroundRemoval = async (
  imageUri: string,
  options: BackgroundRemovalOptions = {}
): Promise<BackgroundRemovalResult> => {
  const startTime = Date.now();
  const { trim = true, timeout = 30000 } = options;

  try {
    // Check device capability first
    const capability = await checkBackgroundRemovalSupport();

    if (!capability.isSupported) {
      if (__DEV__) {
        console.warn('Background removal not supported:', capability.reason);
      }
      return {
        uri: imageUri, // Return original image
        originalUri: imageUri,
        backgroundRemoved: false,
        processingTime: Date.now() - startTime,
        error: createBackgroundRemovalError(
          'BACKGROUND_REMOVAL_UNSUPPORTED',
          `Background removal not supported: ${capability.reason}`,
          'low',
          false,
          ['Use a supported device (iOS 17+, Android API 24+)', 'Continue with original image']
        )
      };
    }

    // Set up timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(createBackgroundRemovalError(
          'BACKGROUND_REMOVAL_TIMEOUT',
          `Background removal timed out after ${timeout}ms`,
          'medium',
          true,
          ['Try with a smaller image', 'Increase timeout value', 'Check device performance']
        ));
      }, timeout);
    });

    // Process background removal with timeout
    const removalPromise = removeBackground(imageUri, { trim });

    const processedUri = await Promise.race([removalPromise, timeoutPromise]);

    const processingTime = Date.now() - startTime;

    if (__DEV__) {
      console.log(`Background removal completed in ${processingTime}ms`);
    }

    return {
      uri: processedUri,
      originalUri: imageUri,
      backgroundRemoved: true,
      processingTime
    };

  } catch (error: any) {
    const processingTime = Date.now() - startTime;

    if (__DEV__) {
      console.error('Background removal failed:', error);
    }

    // Handle specific error types
    let processedError: ImageProcessingError;

    if (error.code === 'BACKGROUND_REMOVAL_TIMEOUT') {
      processedError = error;
    } else if (error.message?.includes('REQUIRES_API_FALLBACK')) {
      processedError = createBackgroundRemovalError(
        'BACKGROUND_REMOVAL_UNSUPPORTED',
        'Device requires API fallback (iOS 15.1-16.x)',
        'low',
        false,
        ['Update to iOS 17+', 'Continue with original image']
      );
    } else if (error.message?.includes('Invalid URL') || error.message?.includes('Unable to load image')) {
      processedError = createBackgroundRemovalError(
        'BACKGROUND_REMOVAL_FAILED',
        'Invalid image or unable to load image',
        'medium',
        true,
        ['Check image file integrity', 'Try with a different image', 'Ensure image format is supported']
      );
    } else {
      processedError = createBackgroundRemovalError(
        'BACKGROUND_REMOVAL_FAILED',
        error.message || 'Unknown background removal error',
        'medium',
        true,
        ['Try again', 'Check device memory', 'Use a smaller image']
      );
    }

    // Return original image on any error
    return {
      uri: imageUri,
      originalUri: imageUri,
      backgroundRemoved: false,
      processingTime,
      error: processedError
    };
  }
};

/**
 * Create a standardized background removal error
 */
const createBackgroundRemovalError = (
  code: ErrorCode,
  message: string,
  severity: 'low' | 'medium' | 'high',
  retryable: boolean,
  recoverySuggestions: string[]
): ImageProcessingError => {
  const error = new Error(message) as ImageProcessingError;
  error.code = code;
  error.category = 'processing';
  error.severity = severity;
  error.retryable = retryable;
  error.recoverySuggestions = recoverySuggestions;

  return error;
};

/**
 * Validate image for background removal processing
 */
export const validateImageForBackgroundRemoval = (imageUri: string): boolean => {
  if (!imageUri || typeof imageUri !== 'string') {
    return false;
  }

  // Check if it's a valid URI format
  const uriPattern = /^(file:\/\/|content:\/\/|data:image\/|https?:\/\/)/;
  if (!uriPattern.test(imageUri)) {
    return false;
  }

  // Check for supported image formats
  const supportedFormats = /\.(jpg|jpeg|png|webp)(\?.*)?$/i;
  if (!supportedFormats.test(imageUri) && !imageUri.startsWith('data:image/')) {
    return false;
  }

  return true;
};

/**
 * Log background removal statistics for monitoring
 */
export const logBackgroundRemovalStats = (result: BackgroundRemovalResult): void => {
  const stats = {
    success: result.backgroundRemoved,
    processingTime: result.processingTime,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    error: result.error?.code
  };

  if (__DEV__) {
    console.log('Background removal stats:', stats);
  }

  // Here you could send to analytics service if needed
  // Analytics.track('background_removal_processed', stats);
};
