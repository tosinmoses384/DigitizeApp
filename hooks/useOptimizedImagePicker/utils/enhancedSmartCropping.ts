import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

// Enhanced face detection interface
interface FaceDetectionResult {
  faces: Face[];
  imageWidth: number;
  imageHeight: number;
  confidence: number;
}

interface Face {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: {
    leftEye?: Point;
    rightEye?: Point;
    nose?: Point;
    mouth?: Point;
  };
  confidence: number;
  angle?: number;
}

interface Point {
  x: number;
  y: number;
}

interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  type: 'face' | 'composition' | 'edge' | 'content';
  priority: number;
}

interface SmartCropOptions {
  targetAspectRatio?: number;
  minFaceSize?: number;
  enableFaceDetection?: boolean;
  enableCompositionAnalysis?: boolean;
  enableEdgeDetection?: boolean;
  cropPadding?: number;
  qualityThreshold?: number;
  generatePreviews?: boolean;
  previewSizes?: Array<{ width: number; height: number }>;
}

interface CropPreview {
  uri: string;
  region: CropRegion;
  width: number;
  height: number;
  quality: number;
}

interface SmartCropResult {
  croppedUri: string;
  originalRegion: CropRegion;
  alternatives: CropPreview[];
  processingTime: number;
  confidence: number;
  metadata: {
    facesDetected: number;
    compositionScore: number;
    edgeScore: number;
    recommendedCrop: boolean;
  };
}

class EnhancedSmartCropping {
  private static instance: EnhancedSmartCropping;
  private faceDetectionCache: Map<string, FaceDetectionResult> = new Map();
  private compositionCache: Map<string, number> = new Map();

  public static getInstance(): EnhancedSmartCropping {
    if (!EnhancedSmartCropping.instance) {
      EnhancedSmartCropping.instance = new EnhancedSmartCropping();
    }
    return EnhancedSmartCropping.instance;
  }

  public async smartCrop(
    imageUri: string,
    options: SmartCropOptions = {}
  ): Promise<SmartCropResult> {
    const startTime = Date.now();
    
    const {
      targetAspectRatio = 1, // Square by default
      minFaceSize = 50,
      enableFaceDetection = true,
      enableCompositionAnalysis = true,
      enableEdgeDetection = false,
      cropPadding = 0.1,
      qualityThreshold = 0.7,
      generatePreviews = true,
      previewSizes = [
        { width: 300, height: 300 },
        { width: 150, height: 150 }
      ]
    } = options;

    try {
      // Get image dimensions
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      if (!imageInfo.exists) {
        throw new Error('Image file not found');
      }

      // Analyze image for smart cropping
      const analysisResults = await this.analyzeImage(imageUri, {
        enableFaceDetection,
        enableCompositionAnalysis,
        enableEdgeDetection,
        minFaceSize
      });

      // Generate crop regions
      const cropRegions = await this.generateCropRegions(
        analysisResults,
        targetAspectRatio,
        cropPadding
      );

      // Select best crop region
      const bestCrop = this.selectBestCrop(cropRegions, qualityThreshold);

      // Apply the crop
      const croppedUri = await this.applyCrop(imageUri, bestCrop);

      // Generate alternative previews if requested
      const alternatives: CropPreview[] = [];
      if (generatePreviews) {
        alternatives.push(...await this.generatePreviews(
          imageUri,
          cropRegions.slice(1, 4), // Top 3 alternatives
          previewSizes
        ));
      }

      const processingTime = Date.now() - startTime;

      return {
        croppedUri,
        originalRegion: bestCrop,
        alternatives,
        processingTime,
        confidence: bestCrop.confidence,
        metadata: {
          facesDetected: analysisResults.faceDetection?.faces.length || 0,
          compositionScore: analysisResults.compositionScore || 0,
          edgeScore: analysisResults.edgeScore || 0,
          recommendedCrop: bestCrop.confidence >= qualityThreshold
        }
      };

    } catch (error) {
      throw new Error(`Smart cropping failed: ${error}`);
    }
  }

  private async analyzeImage(
    imageUri: string,
    options: {
      enableFaceDetection: boolean;
      enableCompositionAnalysis: boolean;
      enableEdgeDetection: boolean;
      minFaceSize: number;
    }
  ): Promise<{
    faceDetection?: FaceDetectionResult;
    compositionScore?: number;
    edgeScore?: number;
    imageWidth: number;
    imageHeight: number;
  }> {
    const cacheKey = `${imageUri}_${JSON.stringify(options)}`;
    
    // Get image dimensions first
    const { width: imageWidth, height: imageHeight } = await this.getImageDimensions(imageUri);
    
    const results: any = { imageWidth, imageHeight };

    // Face detection
    if (options.enableFaceDetection) {
      if (this.faceDetectionCache.has(cacheKey)) {
        results.faceDetection = this.faceDetectionCache.get(cacheKey);
      } else {
        results.faceDetection = await this.detectFaces(imageUri, options.minFaceSize);
        this.faceDetectionCache.set(cacheKey, results.faceDetection);
      }
    }

    // Composition analysis
    if (options.enableCompositionAnalysis) {
      if (this.compositionCache.has(cacheKey)) {
        results.compositionScore = this.compositionCache.get(cacheKey);
      } else {
        results.compositionScore = await this.analyzeComposition(imageUri);
        this.compositionCache.set(cacheKey, results.compositionScore);
      }
    }

    // Edge detection
    if (options.enableEdgeDetection) {
      results.edgeScore = await this.detectEdges(imageUri);
    }

    return results;
  }

  private async detectFaces(imageUri: string, minFaceSize: number): Promise<FaceDetectionResult> {
    // Simulate face detection - in real implementation, use ML Kit or similar
    // This is a mock implementation
    const { width, height } = await this.getImageDimensions(imageUri);
    
    // Mock face detection results
    const mockFaces: Face[] = [];
    
    // Simulate finding faces in common positions
    if (Math.random() > 0.3) { // 70% chance of finding a face
      const faceWidth = Math.max(minFaceSize, width * 0.2);
      const faceHeight = faceWidth * 1.2;
      
      mockFaces.push({
        bounds: {
          x: width * 0.3 + Math.random() * width * 0.4 - faceWidth / 2,
          y: height * 0.2 + Math.random() * height * 0.3 - faceHeight / 2,
          width: faceWidth,
          height: faceHeight
        },
        confidence: 0.85 + Math.random() * 0.1,
        landmarks: {
          leftEye: { x: width * 0.35, y: height * 0.25 },
          rightEye: { x: width * 0.45, y: height * 0.25 },
          nose: { x: width * 0.4, y: height * 0.3 },
          mouth: { x: width * 0.4, y: height * 0.35 }
        }
      });
    }

    return {
      faces: mockFaces,
      imageWidth: width,
      imageHeight: height,
      confidence: mockFaces.length > 0 ? 0.9 : 0.1
    };
  }

  private async analyzeComposition(imageUri: string): Promise<number> {
    // Simulate composition analysis using rule of thirds, golden ratio, etc.
    const { width, height } = await this.getImageDimensions(imageUri);
    
    // Mock composition scoring based on image dimensions and aspect ratio
    const aspectRatio = width / height;
    let score = 0.5; // Base score
    
    // Prefer certain aspect ratios
    if (Math.abs(aspectRatio - 1.618) < 0.1) score += 0.3; // Golden ratio
    if (Math.abs(aspectRatio - 1) < 0.1) score += 0.2; // Square
    if (Math.abs(aspectRatio - 1.33) < 0.1) score += 0.25; // 4:3
    
    // Add some randomness to simulate real analysis
    score += (Math.random() - 0.5) * 0.2;
    
    return Math.max(0, Math.min(1, score));
  }

  private async detectEdges(imageUri: string): Promise<number> {
    // Simulate edge detection analysis
    // In real implementation, this would analyze edge density and distribution
    return 0.6 + Math.random() * 0.3;
  }

  private async generateCropRegions(
    analysisResults: any,
    targetAspectRatio: number,
    cropPadding: number
  ): Promise<CropRegion[]> {
    const { imageWidth, imageHeight } = analysisResults;
    const regions: CropRegion[] = [];

    // Face-based crops
    if (analysisResults.faceDetection?.faces.length > 0) {
      for (const face of analysisResults.faceDetection.faces) {
        const region = this.createFaceBasedCrop(
          face,
          imageWidth,
          imageHeight,
          targetAspectRatio,
          cropPadding
        );
        regions.push(region);
      }
    }

    // Composition-based crops
    if (analysisResults.compositionScore > 0.5) {
      const compositionCrops = this.createCompositionBasedCrops(
        imageWidth,
        imageHeight,
        targetAspectRatio,
        analysisResults.compositionScore
      );
      regions.push(...compositionCrops);
    }

    // Center crop as fallback
    regions.push(this.createCenterCrop(imageWidth, imageHeight, targetAspectRatio));

    // Sort by confidence and priority
    return regions.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.confidence - a.confidence;
    });
  }

  private createFaceBasedCrop(
    face: Face,
    imageWidth: number,
    imageHeight: number,
    targetAspectRatio: number,
    padding: number
  ): CropRegion {
    const { bounds } = face;
    const paddingX = bounds.width * padding;
    const paddingY = bounds.height * padding;
    
    let cropWidth = bounds.width + paddingX * 2;
    let cropHeight = bounds.height + paddingY * 2;
    
    // Adjust for target aspect ratio
    if (cropWidth / cropHeight > targetAspectRatio) {
      cropHeight = cropWidth / targetAspectRatio;
    } else {
      cropWidth = cropHeight * targetAspectRatio;
    }
    
    // Center on face
    const cropX = Math.max(0, bounds.x + bounds.width / 2 - cropWidth / 2);
    const cropY = Math.max(0, bounds.y + bounds.height / 2 - cropHeight / 2);
    
    // Ensure crop stays within image bounds
    const finalX = Math.min(cropX, imageWidth - cropWidth);
    const finalY = Math.min(cropY, imageHeight - cropHeight);
    const finalWidth = Math.min(cropWidth, imageWidth - finalX);
    const finalHeight = Math.min(cropHeight, imageHeight - finalY);

    return {
      x: finalX,
      y: finalY,
      width: finalWidth,
      height: finalHeight,
      confidence: face.confidence * 0.9,
      type: 'face',
      priority: 10
    };
  }

  private createCompositionBasedCrops(
    imageWidth: number,
    imageHeight: number,
    targetAspectRatio: number,
    compositionScore: number
  ): CropRegion[] {
    const regions: CropRegion[] = [];
    
    // Rule of thirds crops
    const cropSize = Math.min(imageWidth, imageHeight) * 0.8;
    const cropWidth = targetAspectRatio >= 1 ? cropSize : cropSize * targetAspectRatio;
    const cropHeight = targetAspectRatio >= 1 ? cropSize / targetAspectRatio : cropSize;
    
    // Top-left third
    regions.push({
      x: imageWidth * 0.1,
      y: imageHeight * 0.1,
      width: cropWidth,
      height: cropHeight,
      confidence: compositionScore * 0.8,
      type: 'composition',
      priority: 8
    });
    
    // Center-right third
    regions.push({
      x: imageWidth * 0.6 - cropWidth / 2,
      y: imageHeight * 0.33 - cropHeight / 2,
      width: cropWidth,
      height: cropHeight,
      confidence: compositionScore * 0.75,
      type: 'composition',
      priority: 7
    });

    return regions.filter(region => 
      region.x >= 0 && region.y >= 0 && 
      region.x + region.width <= imageWidth && 
      region.y + region.height <= imageHeight
    );
  }

  private createCenterCrop(
    imageWidth: number,
    imageHeight: number,
    targetAspectRatio: number
  ): CropRegion {
    let cropWidth = Math.min(imageWidth, imageHeight);
    let cropHeight = cropWidth;
    
    if (targetAspectRatio > 1) {
      cropHeight = cropWidth / targetAspectRatio;
    } else {
      cropWidth = cropHeight * targetAspectRatio;
    }
    
    return {
      x: (imageWidth - cropWidth) / 2,
      y: (imageHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
      confidence: 0.5,
      type: 'content',
      priority: 1
    };
  }

  private selectBestCrop(regions: CropRegion[], qualityThreshold: number): CropRegion {
    // Find the highest confidence crop above threshold
    const qualityCrops = regions.filter(region => region.confidence >= qualityThreshold);
    
    if (qualityCrops.length > 0) {
      return qualityCrops[0];
    }
    
    // Fallback to highest confidence crop
    return regions[0] || this.createCenterCrop(1000, 1000, 1);
  }

  private async applyCrop(imageUri: string, cropRegion: CropRegion): Promise<string> {
    const result = await manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX: cropRegion.x,
            originY: cropRegion.y,
            width: cropRegion.width,
            height: cropRegion.height
          }
        }
      ],
      {
        compress: 0.9,
        format: SaveFormat.JPEG
      }
    );
    
    return result.uri;
  }

  private async generatePreviews(
    imageUri: string,
    cropRegions: CropRegion[],
    previewSizes: Array<{ width: number; height: number }>
  ): Promise<CropPreview[]> {
    const previews: CropPreview[] = [];
    
    for (const region of cropRegions) {
      for (const size of previewSizes) {
        try {
          const previewUri = await manipulateAsync(
            imageUri,
            [
              {
                crop: {
                  originX: region.x,
                  originY: region.y,
                  width: region.width,
                  height: region.height
                }
              },
              {
                resize: {
                  width: size.width,
                  height: size.height
                }
              }
            ],
            {
              compress: 0.8,
              format: SaveFormat.JPEG
            }
          );
          
          previews.push({
            uri: previewUri,
            region,
            width: size.width,
            height: size.height,
            quality: region.confidence
          });
        } catch (error) {
          console.warn('Failed to generate preview:', error);
        }
      }
    }
    
    return previews;
  }

  private async getImageDimensions(imageUri: string): Promise<{ width: number; height: number }> {
    // For now, return mock dimensions
    // In real implementation, you'd use expo-image or similar to get actual dimensions
    return { width: 1920, height: 1080 };
  }

  public clearCache(): void {
    this.faceDetectionCache.clear();
    this.compositionCache.clear();
  }

  public getCacheStats(): { faceDetectionCache: number; compositionCache: number } {
    return {
      faceDetectionCache: this.faceDetectionCache.size,
      compositionCache: this.compositionCache.size
    };
  }
}

// Real-time preview manager
class RealTimePreviewManager {
  private previewCallbacks: Map<string, (preview: CropPreview) => void> = new Map();
  private activePreviewTasks: Set<string> = new Set();

  public async generateRealTimePreview(
    imageUri: string,
    cropRegion: CropRegion,
    previewSize: { width: number; height: number },
    onPreviewReady: (preview: CropPreview) => void
  ): Promise<string> {
    const taskId = `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.previewCallbacks.set(taskId, onPreviewReady);
    this.activePreviewTasks.add(taskId);

    try {
      const previewUri = await manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: cropRegion.x,
              originY: cropRegion.y,
              width: cropRegion.width,
              height: cropRegion.height
            }
          },
          {
            resize: previewSize
          }
        ],
        {
          compress: 0.7,
          format: SaveFormat.JPEG
        }
      );

      const preview: CropPreview = {
        uri: previewUri,
        region: cropRegion,
        width: previewSize.width,
        height: previewSize.height,
        quality: cropRegion.confidence
      };

      if (this.activePreviewTasks.has(taskId)) {
        onPreviewReady(preview);
      }

      return taskId;
    } catch (error) {
      throw new Error(`Real-time preview generation failed: ${error}`);
    } finally {
      this.previewCallbacks.delete(taskId);
      this.activePreviewTasks.delete(taskId);
    }
  }

  public cancelPreview(taskId: string): void {
    this.previewCallbacks.delete(taskId);
    this.activePreviewTasks.delete(taskId);
  }

  public cancelAllPreviews(): void {
    this.previewCallbacks.clear();
    this.activePreviewTasks.clear();
  }
}

// Quality comparison utilities
class QualityComparator {
  public async compareQualities(
    originalUri: string,
    processedUris: string[]
  ): Promise<Array<{ uri: string; score: number; metrics: any }>> {
    const results = [];
    
    for (const uri of processedUris) {
      const metrics = await this.calculateQualityMetrics(originalUri, uri);
      const score = this.calculateOverallScore(metrics);
      
      results.push({
        uri,
        score,
        metrics
      });
    }
    
    return results.sort((a, b) => b.score - a.score);
  }

  private async calculateQualityMetrics(originalUri: string, processedUri: string): Promise<any> {
    // Mock quality metrics calculation
    // In real implementation, this would analyze image quality factors
    return {
      sharpness: 0.8 + Math.random() * 0.2,
      contrast: 0.7 + Math.random() * 0.3,
      brightness: 0.6 + Math.random() * 0.4,
      colorAccuracy: 0.85 + Math.random() * 0.15,
      noiseLevel: Math.random() * 0.3,
      compressionArtifacts: Math.random() * 0.2
    };
  }

  private calculateOverallScore(metrics: any): number {
    const weights = {
      sharpness: 0.25,
      contrast: 0.2,
      brightness: 0.15,
      colorAccuracy: 0.2,
      noiseLevel: -0.1, // Negative weight (less noise is better)
      compressionArtifacts: -0.1 // Negative weight
    };
    
    let score = 0;
    for (const [metric, value] of Object.entries(metrics)) {
      if (weights[metric]) {
        score += weights[metric] * (value as number);
      }
    }
    
    return Math.max(0, Math.min(1, score));
  }
}

// Export instances and types
export const enhancedSmartCropping = EnhancedSmartCropping.getInstance();
export const realTimePreviewManager = new RealTimePreviewManager();
export const qualityComparator = new QualityComparator();

export type {
  SmartCropOptions,
  SmartCropResult,
  CropRegion,
  CropPreview,
  FaceDetectionResult,
  Face
};
