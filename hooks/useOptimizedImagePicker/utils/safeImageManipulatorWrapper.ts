import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

interface SafeManipulateResult {
  uri: string;
  width: number;
  height: number;
}

interface SafeManipulateOptions {
  compress?: number;
  format?: ImageManipulator.SaveFormat;
  base64?: boolean;
}

/**
 * Safe wrapper for ImageManipulator.manipulateAsync that handles saveAsync failures
 */
export class SafeImageManipulator {
  private static instance: SafeImageManipulator;
  
  static getInstance(): SafeImageManipulator {
    if (!SafeImageManipulator.instance) {
      SafeImageManipulator.instance = new SafeImageManipulator();
    }
    return SafeImageManipulator.instance;
  }

  /**
   * Safely manipulate an image with comprehensive error handling
   */
  async manipulateAsync(
    uri: string,
    actions: ImageManipulator.Action[] = [],
    options: SafeManipulateOptions = {}
  ): Promise<SafeManipulateResult> {
    const {
      compress = 0.8,
      format = ImageManipulator.SaveFormat.JPEG,
      base64 = false
    } = options;

    // Validate input URI
    await this.validateUri(uri);

    // Try multiple strategies if the first attempt fails
    const strategies = [
      // Strategy 1: Original parameters
      () => this.tryManipulate(uri, actions, { compress, format, base64 }),
      
      // Strategy 2: Reduced quality
      () => this.tryManipulate(uri, actions, { 
        compress: Math.max(0.5, compress - 0.2), 
        format, 
        base64 
      }),
      
      // Strategy 3: Force JPEG format
      () => this.tryManipulate(uri, actions, { 
        compress: Math.max(0.4, compress - 0.3), 
        format: ImageManipulator.SaveFormat.JPEG, 
        base64 
      }),
      
      // Strategy 4: Minimal processing
      () => this.tryManipulate(uri, [], { 
        compress: 0.3, 
        format: ImageManipulator.SaveFormat.JPEG, 
        base64 
      }),
      
      // Strategy 5: Return original with fallback dimensions
      () => this.getFallbackResult(uri)
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        const result = await strategies[i]();
        if (result) {
          console.log(`ImageManipulator succeeded with strategy ${i + 1}`);
          return result;
        }
      } catch (error: any) {
        console.warn(`Strategy ${i + 1} failed:`, error.message);
        
        // If it's not a saveAsync error, don't try other strategies
        if (!this.isSaveAsyncError(error)) {
          throw error;
        }
        
        // Continue to next strategy for saveAsync errors
        continue;
      }
    }

    // If all strategies failed, return fallback
    console.warn('All ImageManipulator strategies failed, using fallback');
    return this.getFallbackResult(uri);
  }

  /**
   * Try to manipulate image with specific parameters
   */
  private async tryManipulate(
    uri: string,
    actions: ImageManipulator.Action[],
    options: SafeManipulateOptions
  ): Promise<SafeManipulateResult | null> {
    try {
      const result = await ImageManipulator.manipulateAsync(uri, actions, options);
      
      // Validate the result
      if (!result.uri) {
        throw new Error('ImageManipulator returned invalid result');
      }

      // Check if the result file exists
      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      if (!fileInfo.exists) {
        throw new Error('Processed image file does not exist');
      }

      return {
        uri: result.uri,
        width: result.width || 300,
        height: result.height || 300
      };
    } catch (error: any) {
      if (this.isSaveAsyncError(error)) {
        return null; // Try next strategy
      }
      throw error; // Re-throw non-saveAsync errors
    }
  }

  /**
   * Check if error is related to saveAsync function
   */
  private isSaveAsyncError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    return (
      errorMessage.includes('saveasync') ||
      errorMessage.includes('save async') ||
      errorMessage.includes('save') ||
      errorMessage.includes('write') ||
      errorMessage.includes('file system') ||
      errorMessage.includes('permission') ||
      errorMessage.includes('storage')
    );
  }

  /**
   * Validate URI before processing
   */
  private async validateUri(uri: string): Promise<void> {
    if (!uri || typeof uri !== 'string') {
      throw new Error('Invalid URI: URI is null or not a string');
    }

    // Check URI format
    const validUriPattern = /^(file:\/\/|content:\/\/|data:image\/|https?:\/\/)/;
    if (!validUriPattern.test(uri)) {
      throw new Error(`Invalid URI format: ${uri}`);
    }

    // Check file accessibility
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error(`File does not exist: ${uri}`);
      }
    } catch (error) {
      throw new Error(`Cannot access file: ${error}`);
    }
  }

  /**
   * Get fallback result when all strategies fail
   */
  private async getFallbackResult(uri: string): Promise<SafeManipulateResult> {
    try {
      // Try to get basic file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      return {
        uri: uri, // Return original URI
        width: 300, // Default dimensions
        height: 300
      };
    } catch (error) {
      console.error('Fallback result generation failed:', error);
      return {
        uri: uri,
        width: 300,
        height: 300
      };
    }
  }

  /**
   * Check available storage space
   */
  async checkStorageSpace(): Promise<{ available: boolean; message: string }> {
    try {
      // This is a simplified check - in a real app you might want more sophisticated storage checking
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) {
        return { available: false, message: 'Cache directory not available' };
      }

      // Try to create a small test file
      const testFile = `${cacheDir}/storage_test_${Date.now()}.tmp`;
      await FileSystem.writeAsStringAsync(testFile, 'test');
      await FileSystem.deleteAsync(testFile, { idempotent: true });

      return { available: true, message: 'Storage space available' };
    } catch (error: any) {
      return { 
        available: false, 
        message: `Storage check failed: ${error.message}` 
      };
    }
  }
}

// Export singleton instance
export const safeImageManipulator = SafeImageManipulator.getInstance();