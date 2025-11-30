import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SmartCropResult {
  uri: string;
  cropRegion: CropRegion;
  confidence: number;
  method: 'face_detection' | 'rule_of_thirds' | 'center_weighted' | 'edge_detection';
}

export interface ImageAnalysis {
  width: number;
  height: number;
  aspectRatio: number;
  dominantColors: string[];
  brightness: number;
  contrast: number;
  hasSubjects: boolean;
  subjectRegions: CropRegion[];
}

export class SmartCroppingEngine {
  /**
   * Analyze image for smart cropping
   */
  async analyzeImage(uri: string): Promise<ImageAnalysis> {
    try {
      // Get basic image info
      const imageInfo = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG
      });

      const width = imageInfo.width || 0;
      const height = imageInfo.height || 0;
      const aspectRatio = width / height;

      // Basic analysis (in a real implementation, you'd use more sophisticated algorithms)
      const analysis: ImageAnalysis = {
        width,
        height,
        aspectRatio,
        dominantColors: await this.extractDominantColors(uri),
        brightness: await this.calculateBrightness(uri),
        contrast: await this.calculateContrast(uri),
        hasSubjects: await this.detectSubjects(uri),
        subjectRegions: await this.findSubjectRegions(uri, width, height)
      };

      return analysis;
    } catch (error) {
      throw new Error(`Image analysis failed: ${error}`);
    }
  }

  /**
   * Perform smart cropping based on target aspect ratio
   */
  async smartCrop(
    uri: string,
    targetAspectRatio: number,
    targetWidth?: number,
    targetHeight?: number
  ): Promise<SmartCropResult> {
    const analysis = await this.analyzeImage(uri);
    
    // Determine best cropping method
    let cropResult: SmartCropResult;

    if (analysis.hasSubjects && analysis.subjectRegions.length > 0) {
      cropResult = await this.cropAroundSubjects(uri, analysis, targetAspectRatio);
    } else {
      cropResult = await this.cropUsingComposition(uri, analysis, targetAspectRatio);
    }

    // Apply the crop
    const finalUri = await this.applyCrop(uri, cropResult.cropRegion, targetWidth, targetHeight);
    
    return {
      ...cropResult,
      uri: finalUri
    };
  }

  /**
   * Crop around detected subjects (faces, objects)
   */
  private async cropAroundSubjects(
    uri: string,
    analysis: ImageAnalysis,
    targetAspectRatio: number
  ): Promise<SmartCropResult> {
    const { width, height, subjectRegions } = analysis;
    
    // Find the most prominent subject region
    const primarySubject = subjectRegions.reduce((largest, current) => {
      const currentArea = current.width * current.height;
      const largestArea = largest.width * largest.height;
      return currentArea > largestArea ? current : largest;
    });

    // Calculate crop region around the subject
    const subjectCenterX = primarySubject.x + primarySubject.width / 2;
    const subjectCenterY = primarySubject.y + primarySubject.height / 2;

    // Determine crop dimensions based on target aspect ratio
    let cropWidth: number;
    let cropHeight: number;

    if (targetAspectRatio > analysis.aspectRatio) {
      // Target is wider - use full width, adjust height
      cropWidth = width;
      cropHeight = width / targetAspectRatio;
    } else {
      // Target is taller - use full height, adjust width
      cropHeight = height;
      cropWidth = height * targetAspectRatio;
    }

    // Center crop around subject
    const cropX = Math.max(0, Math.min(width - cropWidth, subjectCenterX - cropWidth / 2));
    const cropY = Math.max(0, Math.min(height - cropHeight, subjectCenterY - cropHeight / 2));

    return {
      uri: '',
      cropRegion: {
        x: Math.round(cropX),
        y: Math.round(cropY),
        width: Math.round(cropWidth),
        height: Math.round(cropHeight)
      },
      confidence: 0.8,
      method: 'face_detection'
    };
  }

  /**
   * Crop using compositional rules (rule of thirds, etc.)
   */
  private async cropUsingComposition(
    uri: string,
    analysis: ImageAnalysis,
    targetAspectRatio: number
  ): Promise<SmartCropResult> {
    const { width, height } = analysis;

    // Use rule of thirds for cropping
    const cropRegion = this.calculateRuleOfThirdsCrop(width, height, targetAspectRatio);

    return {
      uri: '',
      cropRegion,
      confidence: 0.6,
      method: 'rule_of_thirds'
    };
  }

  /**
   * Calculate crop region using rule of thirds
   */
  private calculateRuleOfThirdsCrop(
    width: number,
    height: number,
    targetAspectRatio: number
  ): CropRegion {
    let cropWidth: number;
    let cropHeight: number;

    if (targetAspectRatio > width / height) {
      // Target is wider
      cropWidth = width;
      cropHeight = width / targetAspectRatio;
    } else {
      // Target is taller
      cropHeight = height;
      cropWidth = height * targetAspectRatio;
    }

    // Position crop using rule of thirds
    const cropX = Math.max(0, (width - cropWidth) / 3);
    const cropY = Math.max(0, (height - cropHeight) / 3);

    return {
      x: Math.round(cropX),
      y: Math.round(cropY),
      width: Math.round(cropWidth),
      height: Math.round(cropHeight)
    };
  }

  /**
   * Apply crop to image
   */
  private async applyCrop(
    uri: string,
    cropRegion: CropRegion,
    targetWidth?: number,
    targetHeight?: number
  ): Promise<string> {
    const actions: ImageManipulator.Action[] = [];

    // Add crop action
    actions.push({
      crop: {
        originX: cropRegion.x,
        originY: cropRegion.y,
        width: cropRegion.width,
        height: cropRegion.height
      }
    });

    // Add resize action if target dimensions specified
    if (targetWidth && targetHeight) {
      actions.push({
        resize: {
          width: targetWidth,
          height: targetHeight
        }
      });
    }

    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false
      }
    );

    return result.uri;
  }

  /**
   * Extract dominant colors (simplified implementation)
   */
  private async extractDominantColors(uri: string): Promise<string[]> {
    // In a real implementation, you'd analyze pixel data
    // For now, return placeholder colors
    return ['#3498db', '#e74c3c', '#2ecc71'];
  }

  /**
   * Calculate image brightness (simplified)
   */
  private async calculateBrightness(uri: string): Promise<number> {
    // Placeholder implementation
    return 0.5; // 0-1 scale
  }

  /**
   * Calculate image contrast (simplified)
   */
  private async calculateContrast(uri: string): Promise<number> {
    // Placeholder implementation
    return 0.7; // 0-1 scale
  }

  /**
   * Detect if image has subjects (faces, objects)
   */
  private async detectSubjects(uri: string): Promise<boolean> {
    // In a real implementation, you'd use ML models or face detection APIs
    // For now, use simple heuristics
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      // Check if file exists and has size property
      if (!fileInfo.exists) {
        return false;
      }
      
      const fileSize = fileInfo.size || 0;
      
      // Assume larger files are more likely to have subjects
      return fileSize > 500 * 1024; // 500KB threshold
    } catch {
      return false;
    }
  }

  /**
   * Find regions containing subjects
   */
  private async findSubjectRegions(
    uri: string,
    width: number,
    height: number
  ): Promise<CropRegion[]> {
    // Simplified implementation - return center region as potential subject area
    const centerRegion: CropRegion = {
      x: Math.round(width * 0.25),
      y: Math.round(height * 0.25),
      width: Math.round(width * 0.5),
      height: Math.round(height * 0.5)
    };

    return [centerRegion];
  }

  /**
   * Generate multiple crop suggestions
   */
  async generateCropSuggestions(
    uri: string,
    targetAspectRatios: number[]
  ): Promise<SmartCropResult[]> {
    const suggestions: SmartCropResult[] = [];

    for (const aspectRatio of targetAspectRatios) {
      try {
        const cropResult = await this.smartCrop(uri, aspectRatio);
        suggestions.push(cropResult);
      } catch (error) {
        console.warn(`Failed to generate crop for aspect ratio ${aspectRatio}:`, error);
      }
    }

    return suggestions;
  }

  /**
   * Validate crop region
   */
  validateCropRegion(
    cropRegion: CropRegion,
    imageWidth: number,
    imageHeight: number
  ): boolean {
    return (
      cropRegion.x >= 0 &&
      cropRegion.y >= 0 &&
      cropRegion.x + cropRegion.width <= imageWidth &&
      cropRegion.y + cropRegion.height <= imageHeight &&
      cropRegion.width > 0 &&
      cropRegion.height > 0
    );
  }

  /**
   * Get common aspect ratios for cropping
   */
  getCommonAspectRatios(): { name: string; ratio: number }[] {
    return [
      { name: 'Square', ratio: 1 },
      { name: 'Portrait 4:5', ratio: 4/5 },
      { name: 'Portrait 3:4', ratio: 3/4 },
      { name: 'Landscape 16:9', ratio: 16/9 },
      { name: 'Landscape 4:3', ratio: 4/3 },
      { name: 'Story 9:16', ratio: 9/16 }
    ];
  }
}

export default SmartCroppingEngine;
