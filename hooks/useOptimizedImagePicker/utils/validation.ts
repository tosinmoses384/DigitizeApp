import * as FileSystem from 'expo-file-system';
import { ImageValidationResult } from '../types';

export class ImageValidator {
  private static readonly SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
  private static readonly MAX_DIMENSION = 10000; // 10k pixels max
  private static readonly MIN_DIMENSION = 10; // 10 pixels min
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max

  static async validateImage(uri: string): Promise<ImageValidationResult> {
    const errors: string[] = [];
    let width: number | undefined;
    let height: number | undefined;
    let fileSize: number | undefined;
    let format: string | undefined;

    try {
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        errors.push('Image file does not exist');
        return {
          isValid: false,
          errors
        };
      }

      // Get file size
      fileSize = fileInfo.size;
      if (fileSize === undefined || fileSize === 0) {
        errors.push('Invalid file size');
      } else if (fileSize > this.MAX_FILE_SIZE) {
        errors.push(`File too large (${(fileSize / 1024 / 1024).toFixed(1)}MB). Maximum allowed: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      // Validate format from URI
      format = this.detectFormatFromUri(uri);
      if (!this.SUPPORTED_FORMATS.includes(format.toLowerCase())) {
        errors.push(`Unsupported format: ${format}. Supported formats: ${this.SUPPORTED_FORMATS.join(', ')}`);
      }

      // Try to get image dimensions (this will fail for invalid images)
      try {
        const dimensions = await this.getImageDimensions(uri);
        width = dimensions.width;
        height = dimensions.height;

        if (width < this.MIN_DIMENSION || height < this.MIN_DIMENSION) {
          errors.push(`Image too small (${width}x${height}). Minimum size: ${this.MIN_DIMENSION}x${this.MIN_DIMENSION}`);
        }

        if (width > this.MAX_DIMENSION || height > this.MAX_DIMENSION) {
          errors.push(`Image too large (${width}x${height}). Maximum size: ${this.MAX_DIMENSION}x${this.MAX_DIMENSION}`);
        }
      } catch (dimensionError) {
        errors.push('Could not read image dimensions - file may be corrupted');
      }

      // Additional validations
      await this.performAdditionalValidations(uri, errors);

    } catch (error) {
      errors.push(`Validation failed: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      format,
      width,
      height,
      fileSize,
      errors
    };
  }

  private static detectFormatFromUri(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  private static async getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
    // This is a simplified approach - in a real implementation you might want to use
    // a more robust image analysis library or native module
    try {
      // Try to use expo-image-manipulator to get dimensions
      const { ImageManipulator } = await import('expo-image-manipulator');
      const result = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG
      });
      
      return {
        width: result.width || 0,
        height: result.height || 0
      };
    } catch (error) {
      throw new Error('Failed to get image dimensions');
    }
  }

  private static async performAdditionalValidations(uri: string, errors: string[]): Promise<void> {
    try {
      // Check if URI is accessible
      if (!uri.startsWith('file://') && !uri.startsWith('content://') && !uri.startsWith('ph://')) {
        errors.push('Invalid URI format');
      }

      // Check for suspicious file patterns (basic security check)
      const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.scr', '.pif'];
      const lowerUri = uri.toLowerCase();
      
      for (const pattern of suspiciousPatterns) {
        if (lowerUri.includes(pattern)) {
          errors.push('Suspicious file detected');
          break;
        }
      }

    } catch (error) {
      console.warn('Additional validation failed:', error);
    }
  }

  static validateFileSize(size: number, maxSize?: number): { isValid: boolean; error?: string } {
    const limit = maxSize || this.MAX_FILE_SIZE;
    
    if (size > limit) {
      return {
        isValid: false,
        error: `File too large (${(size / 1024 / 1024).toFixed(1)}MB). Maximum: ${(limit / 1024 / 1024).toFixed(1)}MB`
      };
    }
    
    return { isValid: true };
  }

  static validateDimensions(
    width: number, 
    height: number, 
    maxWidth?: number, 
    maxHeight?: number
  ): { isValid: boolean; error?: string } {
    const maxW = maxWidth || this.MAX_DIMENSION;
    const maxH = maxHeight || this.MAX_DIMENSION;
    
    if (width < this.MIN_DIMENSION || height < this.MIN_DIMENSION) {
      return {
        isValid: false,
        error: `Image too small (${width}x${height}). Minimum: ${this.MIN_DIMENSION}x${this.MIN_DIMENSION}`
      };
    }
    
    if (width > maxW || height > maxH) {
      return {
        isValid: false,
        error: `Image too large (${width}x${height}). Maximum: ${maxW}x${maxH}`
      };
    }
    
    return { isValid: true };
  }

  static validateFormat(format: string): { isValid: boolean; error?: string } {
    if (!this.SUPPORTED_FORMATS.includes(format.toLowerCase())) {
      return {
        isValid: false,
        error: `Unsupported format: ${format}. Supported: ${this.SUPPORTED_FORMATS.join(', ')}`
      };
    }
    
    return { isValid: true };
  }

  static getSupportedFormats(): string[] {
    return [...this.SUPPORTED_FORMATS];
  }

  static getMaxFileSize(): number {
    return this.MAX_FILE_SIZE;
  }

  static getMaxDimensions(): { width: number; height: number } {
    return {
      width: this.MAX_DIMENSION,
      height: this.MAX_DIMENSION
    };
  }
}