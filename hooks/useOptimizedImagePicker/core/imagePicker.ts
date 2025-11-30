import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { ImagePickerOptions, CameraOptions, MultiImagePickerOptions, VideoPickerOptions, MediaPickerOptions, OptimizedImageResult, OptimizedVideoResult, OptimizedMediaResult, ImageOptimizerConfig, ImageValidationResult, ImageMetadata } from '../types';
import { ImageProcessor } from './imageProcessor';
import { ImageValidator } from '../utils/validation';

export class ImagePickerCore {
  private imageProcessor: ImageProcessor;
  private config: ImageOptimizerConfig;

  constructor(config: ImageOptimizerConfig) {
    this.imageProcessor = new ImageProcessor(config);
    this.config = config;
  }

  async pickFromGallery(
    options: ImagePickerOptions = { mediaTypes: 'images' },
    configOverrides?: Partial<ImageOptimizerConfig>
  ): Promise<OptimizedImageResult> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Gallery permission denied');
      }

      // Get effective config (merge with overrides)
      const effectiveConfig = configOverrides ? { ...this.config, ...configOverrides } : this.config;
      
      // Configure picker options
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: this.mapMediaTypes(options.mediaTypes),
        allowsEditing: options.allowsEditing !== undefined ? options.allowsEditing : effectiveConfig.enableCropping,
        quality: options.quality || 1,
        aspect: options.aspect,
        base64: options.base64 || false,
        allowsMultipleSelection: false
      };

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('User cancelled image selection');
      }

      const asset = result.assets[0];
      
      // Process the selected image
      return await this.imageProcessor.processImage(asset.uri, {
        removeBackground: true, // Default to true as per requirements
        quality: configOverrides?.quality,
        targetSize: configOverrides?.maxResolution
      });

    } catch (error) {
      throw this.createImagePickerError(error, 'Gallery selection failed');
    }
  }

  async captureFromCamera(
    options: CameraOptions = { mediaTypes: 'images', cameraType: 'back' },
    configOverrides?: Partial<ImageOptimizerConfig>
  ): Promise<OptimizedImageResult> {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission denied');
      }

      // Get effective config (merge with overrides)
      const effectiveConfig = configOverrides ? { ...this.config, ...configOverrides } : this.config;
      
      // Configure camera options
      const cameraOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: this.mapMediaTypes(options.mediaTypes),
        allowsEditing: options.allowsEditing !== undefined ? options.allowsEditing : effectiveConfig.enableCropping,
        quality: options.quality || 1,
        aspect: options.aspect,
        base64: options.base64 || false,
        cameraType: this.mapCameraType(options.cameraType)
      };

      // Launch camera
      const result = await ImagePicker.launchCameraAsync(cameraOptions);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('User cancelled camera capture');
      }

      const asset = result.assets[0];
      
      // Process the captured image
      return await this.imageProcessor.processImage(asset.uri, {
        removeBackground: true, // Default to true as per requirements
        quality: configOverrides?.quality,
        targetSize: configOverrides?.maxResolution
      });

    } catch (error) {
      throw this.createImagePickerError(error, 'Camera capture failed');
    }
  }

  async pickMultipleImages(
    options: MultiImagePickerOptions = { mediaTypes: 'images' },
    configOverrides?: Partial<ImageOptimizerConfig>
  ): Promise<OptimizedImageResult[]> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Gallery permission denied');
      }

      // Get effective config (merge with overrides)
      const effectiveConfig = configOverrides ? { ...this.config, ...configOverrides } : this.config;
      
      // Configure picker options
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: this.mapMediaTypes(options.mediaTypes),
        allowsEditing: options.allowsEditing !== undefined ? options.allowsEditing : effectiveConfig.enableCropping,
        quality: options.quality || 1,
        aspect: options.aspect,
        base64: options.base64 || false,
        allowsMultipleSelection: true,
        selectionLimit: options.selectionLimit || 10,
        orderedSelection: options.orderedSelection || false
      };

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('User cancelled image selection');
      }

      // Process all selected images
      const processedImages: OptimizedImageResult[] = [];
      
      for (const asset of result.assets) {
        try {
          const processedImage = await this.imageProcessor.processImage(asset.uri, {
            removeBackground: true, // Default to true as per requirements
            quality: configOverrides?.quality,
            targetSize: configOverrides?.maxResolution
          });
          processedImages.push(processedImage);
        } catch (error) {
          console.warn(`Failed to process image ${asset.uri}:`, error);
          // Continue with other images even if one fails
        }
      }

      if (processedImages.length === 0) {
        throw new Error('Failed to process any selected images');
      }

      return processedImages;

    } catch (error) {
      throw this.createImagePickerError(error, 'Multiple image selection failed');
    }
  }

  private mapMediaTypes(mediaTypes: 'images' | 'videos' | 'all'): ImagePicker.MediaTypeOptions {
    switch (mediaTypes) {
      case 'images':
        return ImagePicker.MediaTypeOptions.Images;
      case 'videos':
        return ImagePicker.MediaTypeOptions.Videos;
      case 'all':
        return ImagePicker.MediaTypeOptions.All;
      default:
        return ImagePicker.MediaTypeOptions.Images;
    }
  }

  private mapCameraType(cameraType: 'front' | 'back'): ImagePicker.CameraType {
    return cameraType === 'front' ? ImagePicker.CameraType.front : ImagePicker.CameraType.back;
  }

  private createImagePickerError(originalError: any, message: string): Error {
    const error = new Error(`${message}: ${originalError?.message || originalError}`);
    error.stack = originalError?.stack;
    return error;
  }

  updateConfig(config: ImageOptimizerConfig): void {
    this.config = config;
    this.imageProcessor.updateConfig(config);
  }

  getProcessingStats() {
    return this.imageProcessor.getProcessingStats();
  }

  async validateImage(uri: string): Promise<ImageValidationResult> {
    return ImageValidator.validateImage(uri);
  }

  async getImageMetadata(uri: string): Promise<ImageMetadata> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }

      // Basic metadata extraction
      const metadata: ImageMetadata = {
        creationDate: new Date(fileInfo.modificationTime || Date.now()).toISOString(),
        hasTransparency: this.detectTransparency(uri)
      };

      return metadata;
    } catch (error) {
      console.warn('Failed to get image metadata:', error);
      return {};
    }
  }

  async pickVideoFromGallery(
    options: VideoPickerOptions = { mediaTypes: 'videos' },
    configOverrides?: Partial<ImageOptimizerConfig>
  ): Promise<OptimizedVideoResult> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Gallery permission denied');
      }

      // Get effective config (merge with overrides)
      const effectiveConfig = configOverrides ? { ...this.config, ...configOverrides } : this.config;
      
      // Configure picker options for video
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: options.allowsEditing || false,
        quality: options.quality || 1,
        base64: options.base64 || false,
        allowsMultipleSelection: false
      };

      // Launch video picker
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('User cancelled video selection');
      }

      const asset = result.assets[0];
      
      // Process the selected video
      return await this.processVideo(asset, effectiveConfig);
      
    } catch (error) {
      throw error;
    }
  }

  private async processVideo(asset: any, config: ImageOptimizerConfig): Promise<OptimizedVideoResult> {
    const startTime = Date.now();
    
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      if (!fileInfo.exists) {
        throw new Error('Video file does not exist');
      }

      const originalFileSize = fileInfo.size || 0;
      const processingTime = Date.now() - startTime;

      // For videos, we don't compress them in this implementation
      // We just return the original video with metadata
      const result: OptimizedVideoResult = {
        uri: asset.uri,
        originalUri: asset.uri,
        width: asset.width || 0,
        height: asset.height || 0,
        fileSize: originalFileSize,
        originalFileSize: originalFileSize,
        compressionRatio: 1.0, // No compression for videos
        format: this.getVideoFormat(asset.uri),
        duration: asset.duration || 0,
        mimeType: asset.mimeType || 'video/mp4',
        fileName: asset.fileName,
        metadata: {
          duration: asset.duration,
          creationDate: new Date().toISOString(),
        },
        processingTime
      };

      return result;
    } catch (error) {
      throw new Error(`Video processing failed: ${error}`);
    }
  }

  private getVideoFormat(uri: string): 'mp4' | 'mov' | 'avi' {
    const extension = uri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp4':
        return 'mp4';
      case 'mov':
        return 'mov';
      case 'avi':
        return 'avi';
      default:
        return 'mp4'; // Default to mp4
    }
  }

  async pickMediaFromGallery(
    options: MediaPickerOptions = { mediaTypes: 'mixed' },
    configOverrides?: Partial<ImageOptimizerConfig>
  ): Promise<OptimizedMediaResult> {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Gallery permission denied');
      }

      // Get effective config (merge with overrides)
      const effectiveConfig = configOverrides ? { ...this.config, ...configOverrides } : this.config;
      
      // Configure picker options for mixed media
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: options.allowsEditing || false,
        quality: options.quality || 1,
        base64: options.base64 || false,
        allowsMultipleSelection: false
      };

      // Launch media picker
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('User cancelled media selection');
      }

      const asset = result.assets[0];
      
      // Determine if it's an image or video and process accordingly
      if (asset.mimeType?.startsWith('image/')) {
        // Process as image
        return await this.imageProcessor.processImage(asset.uri, {
          removeBackground: true,
          quality: effectiveConfig.quality,
          targetSize: effectiveConfig.maxResolution
        });
      } else if (asset.mimeType?.startsWith('video/')) {
        // Process as video
        return await this.processVideo(asset, effectiveConfig);
      } else {
        throw new Error('Unsupported media type');
      }
      
    } catch (error) {
      throw error;
    }
  }

  private detectTransparency(uri: string): boolean {
    // Simple transparency detection based on file extension
    const extension = uri.split('.').pop()?.toLowerCase();
    return extension === 'png';
  }
}