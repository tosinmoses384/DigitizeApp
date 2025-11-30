import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export interface PlatformCapabilities {
  heicSupport: boolean;
  heifSupport: boolean;
  webpSupport: boolean;
  avifSupport: boolean;
  nativeDecoding: boolean;
  scopedStorage: boolean;
}

export interface PlatformOptimizationResult {
  uri: string;
  format: string;
  optimized: boolean;
  platformSpecific: boolean;
}

export class PlatformOptimizer {
  private static instance: PlatformOptimizer;
  private capabilities: PlatformCapabilities;

  private constructor() {
    this.capabilities = this.detectPlatformCapabilities();
  }

  static getInstance(): PlatformOptimizer {
    if (!PlatformOptimizer.instance) {
      PlatformOptimizer.instance = new PlatformOptimizer();
    }
    return PlatformOptimizer.instance;
  }

  /**
   * Detect platform-specific capabilities
   */
  private detectPlatformCapabilities(): PlatformCapabilities {
    if (Platform.OS === 'ios') {
      return {
        heicSupport: true,
        heifSupport: true,
        webpSupport: Platform.Version >= 14,
        avifSupport: Platform.Version >= 16,
        nativeDecoding: true,
        scopedStorage: false
      };
    } else if (Platform.OS === 'android') {
      return {
        heicSupport: Platform.Version >= 30, // Android 11+
        heifSupport: Platform.Version >= 30,
        webpSupport: true,
        avifSupport: false, // Limited support
        nativeDecoding: Platform.Version >= 30,
        scopedStorage: Platform.Version >= 29 // Android 10+
      };
    } else {
      // Web or other platforms
      return {
        heicSupport: false,
        heifSupport: false,
        webpSupport: true,
        avifSupport: false,
        nativeDecoding: false,
        scopedStorage: false
      };
    }
  }

  /**
   * Optimize image based on platform capabilities
   */
  async optimizeForPlatform(
    uri: string,
    targetFormat: 'auto' | 'jpeg' | 'png' | 'webp' = 'auto'
  ): Promise<PlatformOptimizationResult> {
    const originalFormat = this.detectImageFormat(uri);
    let optimizedUri = uri;
    let finalFormat = originalFormat;
    let wasOptimized = false;
    let isPlatformSpecific = false;

    try {
      // Handle HEIC/HEIF conversion
      if (originalFormat === 'heic' || originalFormat === 'heif') {
        const conversionResult = await this.handleHEICConversion(uri);
        optimizedUri = conversionResult.uri;
        finalFormat = conversionResult.format;
        wasOptimized = conversionResult.converted;
        isPlatformSpecific = true;
      }

      // Handle format optimization based on target
      if (targetFormat !== 'auto') {
        const formatResult = await this.convertToTargetFormat(optimizedUri, targetFormat);
        if (formatResult.uri !== optimizedUri) {
          // Clean up intermediate file if different
          if (optimizedUri !== uri) {
            await FileSystem.deleteAsync(optimizedUri, { idempotent: true });
          }
          optimizedUri = formatResult.uri;
          finalFormat = formatResult.format;
          wasOptimized = true;
        }
      } else {
        // Auto-optimize format based on platform
        const autoResult = await this.autoOptimizeFormat(optimizedUri, originalFormat);
        if (autoResult.uri !== optimizedUri) {
          if (optimizedUri !== uri) {
            await FileSystem.deleteAsync(optimizedUri, { idempotent: true });
          }
          optimizedUri = autoResult.uri;
          finalFormat = autoResult.format;
          wasOptimized = true;
          isPlatformSpecific = true;
        }
      }

      return {
        uri: optimizedUri,
        format: finalFormat,
        optimized: wasOptimized,
        platformSpecific: isPlatformSpecific
      };

    } catch (error) {
      console.warn('Platform optimization failed:', error);
      return {
        uri,
        format: originalFormat,
        optimized: false,
        platformSpecific: false
      };
    }
  }

  /**
   * Handle HEIC/HEIF conversion based on platform capabilities
   */
  private async handleHEICConversion(uri: string): Promise<{
    uri: string;
    format: string;
    converted: boolean;
  }> {
    const originalFormat = this.detectImageFormat(uri);

    // If platform supports HEIC natively and we want to preserve it
    if (this.capabilities.heicSupport && this.capabilities.nativeDecoding) {
      return {
        uri,
        format: originalFormat,
        converted: false
      };
    }

    // Convert to JPEG for compatibility
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: 0.95, // High quality for HEIC conversion
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false
        }
      );

      return {
        uri: result.uri,
        format: 'jpeg',
        converted: true
      };
    } catch (error) {
      console.warn('HEIC conversion failed:', error);
      return {
        uri,
        format: originalFormat,
        converted: false
      };
    }
  }

  /**
   * Convert to specific target format
   */
  private async convertToTargetFormat(
    uri: string,
    targetFormat: 'jpeg' | 'png' | 'webp'
  ): Promise<{ uri: string; format: string }> {
    const currentFormat = this.detectImageFormat(uri);

    // No conversion needed
    if (currentFormat === targetFormat) {
      return { uri, format: currentFormat };
    }

    // Check if target format is supported
    if (targetFormat === 'webp' && !this.capabilities.webpSupport) {
      console.warn('WebP not supported on this platform, falling back to JPEG');
      targetFormat = 'jpeg';
    }

    try {
      const expoFormat = this.stringToExpoFormat(targetFormat);
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: targetFormat === 'png' ? 1.0 : 0.9,
          format: expoFormat,
          base64: false
        }
      );

      return {
        uri: result.uri,
        format: targetFormat
      };
    } catch (error) {
      console.warn(`Conversion to ${targetFormat} failed:`, error);
      return { uri, format: currentFormat };
    }
  }

  /**
   * Auto-optimize format based on platform and image characteristics
   */
  private async autoOptimizeFormat(
    uri: string,
    currentFormat: string
  ): Promise<{ uri: string; format: string }> {
    // Check if image has transparency
    const hasTransparency = await this.checkTransparency(uri, currentFormat);

    // Optimization logic based on platform and image characteristics
    let targetFormat: 'jpeg' | 'png' | 'webp' = 'jpeg';

    if (hasTransparency) {
      // Keep transparency
      if (this.capabilities.webpSupport && Platform.OS === 'android') {
        targetFormat = 'webp'; // Better compression for transparent images on Android
      } else {
        targetFormat = 'png';
      }
    } else {
      // No transparency needed
      if (this.capabilities.webpSupport && Platform.OS === 'android') {
        targetFormat = 'webp'; // Better compression on Android
      } else {
        targetFormat = 'jpeg'; // Universal compatibility
      }
    }

    return this.convertToTargetFormat(uri, targetFormat);
  }

  /**
   * Check if image has transparency
   */
  private async checkTransparency(uri: string, format: string): Promise<boolean> {
    // Simple heuristic based on format
    if (format === 'png') {
      return true; // Assume PNG might have transparency
    }
    
    if (format === 'webp') {
      return true; // WebP can have transparency
    }

    return false; // JPEG, HEIC don't support transparency
  }

  /**
   * Handle iOS-specific optimizations
   */
  async optimizeForIOS(uri: string): Promise<PlatformOptimizationResult> {
    if (Platform.OS !== 'ios') {
      return {
        uri,
        format: this.detectImageFormat(uri),
        optimized: false,
        platformSpecific: false
      };
    }

    const format = this.detectImageFormat(uri);

    // Handle Live Photos (extract still frame)
    if (this.isLivePhoto(uri)) {
      try {
        // In a real implementation, you'd extract the still frame
        // For now, we'll just process as regular image
        console.log('Live Photo detected, extracting still frame');
      } catch (error) {
        console.warn('Live Photo processing failed:', error);
      }
    }

    // Handle ProRAW (iPhone 12 Pro+)
    if (this.isProRAW(uri)) {
      try {
        // Convert ProRAW to JPEG
        const result = await ImageManipulator.manipulateAsync(
          uri,
          [],
          {
            compress: 0.95,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: false
          }
        );

        return {
          uri: result.uri,
          format: 'jpeg',
          optimized: true,
          platformSpecific: true
        };
      } catch (error) {
        console.warn('ProRAW conversion failed:', error);
      }
    }

    return this.optimizeForPlatform(uri, 'auto');
  }

  /**
   * Handle Android-specific optimizations
   */
  async optimizeForAndroid(uri: string): Promise<PlatformOptimizationResult> {
    if (Platform.OS !== 'android') {
      return {
        uri,
        format: this.detectImageFormat(uri),
        optimized: false,
        platformSpecific: false
      };
    }

    // Handle scoped storage (Android 10+)
    if (this.capabilities.scopedStorage) {
      // Ensure we're working with a file we can access
      const accessibleUri = await this.ensureAccessibleUri(uri);
      if (accessibleUri !== uri) {
        uri = accessibleUri;
      }
    }

    // Handle different camera app formats
    const optimizedUri = await this.handleAndroidCameraVariations(uri);
    if (optimizedUri !== uri) {
      return {
        uri: optimizedUri,
        format: this.detectImageFormat(optimizedUri),
        optimized: true,
        platformSpecific: true
      };
    }

    return this.optimizeForPlatform(uri, 'auto');
  }

  /**
   * Ensure URI is accessible under scoped storage
   */
  private async ensureAccessibleUri(uri: string): Promise<string> {
    try {
      // Check if we can access the file
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        return uri;
      }

      // If not accessible, copy to cache directory
      const fileName = uri.split('/').pop() || 'image.jpg';
      const cacheUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      await FileSystem.copyAsync({
        from: uri,
        to: cacheUri
      });

      return cacheUri;
    } catch (error) {
      console.warn('Failed to ensure accessible URI:', error);
      return uri;
    }
  }

  /**
   * Handle Android camera app variations
   */
  private async handleAndroidCameraVariations(uri: string): Promise<string> {
    // This would handle specific formats from Samsung, Huawei, OnePlus cameras
    // For now, we'll just return the original URI
    return uri;
  }

  /**
   * Detect image format from URI
   */
  private detectImageFormat(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'jpeg';
      case 'png':
        return 'png';
      case 'webp':
        return 'webp';
      case 'heic':
        return 'heic';
      case 'heif':
        return 'heif';
      default:
        return 'unknown';
    }
  }

  /**
   * Convert string format to Expo format
   */
  private stringToExpoFormat(format: string): ImageManipulator.SaveFormat {
    switch (format) {
      case 'png':
        return ImageManipulator.SaveFormat.PNG;
      case 'webp':
        return ImageManipulator.SaveFormat.WEBP;
      case 'jpeg':
      default:
        return ImageManipulator.SaveFormat.JPEG;
    }
  }

  /**
   * Check if image is a Live Photo
   */
  private isLivePhoto(uri: string): boolean {
    // Simple heuristic - in a real implementation you'd check UTI type
    return uri.includes('LivePhoto') || uri.includes('.HEIC');
  }

  /**
   * Check if image is ProRAW
   */
  private isProRAW(uri: string): boolean {
    // Simple heuristic - in a real implementation you'd check for DNG format
    return uri.includes('ProRAW') || uri.includes('.DNG');
  }

  /**
   * Get platform capabilities
   */
  getCapabilities(): PlatformCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Get recommended format for platform
   */
  getRecommendedFormat(hasTransparency: boolean = false): string {
    if (hasTransparency) {
      if (this.capabilities.webpSupport && Platform.OS === 'android') {
        return 'webp';
      }
      return 'png';
    }

    if (this.capabilities.webpSupport && Platform.OS === 'android') {
      return 'webp';
    }

    return 'jpeg';
  }

  /**
   * Check if format is supported on current platform
   */
  isFormatSupported(format: string): boolean {
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
      case 'png':
        return true;
      case 'webp':
        return this.capabilities.webpSupport;
      case 'heic':
      case 'heif':
        return this.capabilities.heicSupport;
      case 'avif':
        return this.capabilities.avifSupport;
      default:
        return false;
    }
  }
}

export default PlatformOptimizer;
