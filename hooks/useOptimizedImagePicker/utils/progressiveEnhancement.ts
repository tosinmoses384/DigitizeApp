import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

interface ProgressiveEnhancementOptions {
  enableAutoEnhancement?: boolean;
  enableColorCorrection?: boolean;
  enableSharpening?: boolean;
  enableNoiseReduction?: boolean;
  enableContrastAdjustment?: boolean;
  enableBrightnessAdjustment?: boolean;
  enableSaturationAdjustment?: boolean;
  adaptiveProcessing?: boolean;
  qualityTarget?: number;
  preserveOriginal?: boolean;
}

interface EnhancementResult {
  enhancedUri: string;
  originalUri?: string;
  enhancements: EnhancementStep[];
  processingTime: number;
  qualityImprovement: number;
  metadata: {
    colorCorrectionApplied: boolean;
    sharpeningLevel: number;
    noiseReductionLevel: number;
    contrastAdjustment: number;
    brightnessAdjustment: number;
    saturationAdjustment: number;
  };
}

interface EnhancementStep {
  type: 'color_correction' | 'sharpening' | 'noise_reduction' | 'contrast' | 'brightness' | 'saturation';
  intensity: number;
  applied: boolean;
  processingTime: number;
}

interface ImageAnalysis {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  noiseLevel: number;
  colorBalance: {
    red: number;
    green: number;
    blue: number;
  };
  histogram: {
    red: number[];
    green: number[];
    blue: number[];
  };
  recommendations: EnhancementRecommendation[];
}

interface EnhancementRecommendation {
  type: string;
  intensity: number;
  confidence: number;
  reason: string;
}

class ProgressiveEnhancementEngine {
  private static instance: ProgressiveEnhancementEngine;
  private analysisCache: Map<string, ImageAnalysis> = new Map();

  public static getInstance(): ProgressiveEnhancementEngine {
    if (!ProgressiveEnhancementEngine.instance) {
      ProgressiveEnhancementEngine.instance = new ProgressiveEnhancementEngine();
    }
    return ProgressiveEnhancementEngine.instance;
  }

  public async enhanceImage(
    imageUri: string,
    options: ProgressiveEnhancementOptions = {}
  ): Promise<EnhancementResult> {
    const startTime = Date.now();
    
    const {
      enableAutoEnhancement = true,
      enableColorCorrection = true,
      enableSharpening = true,
      enableNoiseReduction = true,
      enableContrastAdjustment = true,
      enableBrightnessAdjustment = true,
      enableSaturationAdjustment = true,
      adaptiveProcessing = true,
      qualityTarget = 0.8,
      preserveOriginal = true
    } = options;

    try {
      // Analyze image to determine enhancement needs
      const analysis = await this.analyzeImage(imageUri);
      
      // Generate enhancement plan
      const enhancementPlan = adaptiveProcessing 
        ? this.generateAdaptiveEnhancementPlan(analysis, options)
        : this.generateStandardEnhancementPlan(options);

      // Apply enhancements progressively
      let currentUri = imageUri;
      let originalUri: string | undefined;
      const appliedEnhancements: EnhancementStep[] = [];

      if (preserveOriginal) {
        originalUri = await this.createBackup(imageUri);
      }

      // Apply each enhancement step
      for (const step of enhancementPlan) {
        if (this.shouldApplyEnhancement(step, options)) {
          const stepStartTime = Date.now();
          
          try {
            currentUri = await this.applyEnhancementStep(currentUri, step);
            
            appliedEnhancements.push({
              ...step,
              applied: true,
              processingTime: Date.now() - stepStartTime
            });
          } catch (error) {
            console.warn(`Enhancement step ${step.type} failed:`, error);
            appliedEnhancements.push({
              ...step,
              applied: false,
              processingTime: Date.now() - stepStartTime
            });
          }
        }
      }

      // Calculate quality improvement
      const qualityImprovement = await this.calculateQualityImprovement(
        imageUri,
        currentUri,
        analysis
      );

      const processingTime = Date.now() - startTime;

      return {
        enhancedUri: currentUri,
        originalUri,
        enhancements: appliedEnhancements,
        processingTime,
        qualityImprovement,
        metadata: this.extractEnhancementMetadata(appliedEnhancements)
      };

    } catch (error) {
      throw new Error(`Progressive enhancement failed: ${error}`);
    }
  }

  private async analyzeImage(imageUri: string): Promise<ImageAnalysis> {
    const cacheKey = `analysis_${imageUri}`;
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    // Mock image analysis - in real implementation, this would use image processing libraries
    const analysis: ImageAnalysis = {
      brightness: 0.4 + Math.random() * 0.4, // 0.4-0.8
      contrast: 0.3 + Math.random() * 0.5, // 0.3-0.8
      saturation: 0.5 + Math.random() * 0.3, // 0.5-0.8
      sharpness: 0.6 + Math.random() * 0.3, // 0.6-0.9
      noiseLevel: Math.random() * 0.4, // 0-0.4
      colorBalance: {
        red: 0.8 + Math.random() * 0.4 - 0.2, // 0.6-1.2
        green: 0.9 + Math.random() * 0.2 - 0.1, // 0.8-1.1
        blue: 0.7 + Math.random() * 0.6 - 0.3 // 0.4-1.3
      },
      histogram: {
        red: Array.from({ length: 256 }, () => Math.random()),
        green: Array.from({ length: 256 }, () => Math.random()),
        blue: Array.from({ length: 256 }, () => Math.random())
      },
      recommendations: []
    };

    // Generate recommendations based on analysis
    analysis.recommendations = this.generateRecommendations(analysis);

    this.analysisCache.set(cacheKey, analysis);
    return analysis;
  }

  private generateRecommendations(analysis: ImageAnalysis): EnhancementRecommendation[] {
    const recommendations: EnhancementRecommendation[] = [];

    // Brightness recommendations
    if (analysis.brightness < 0.4) {
      recommendations.push({
        type: 'brightness',
        intensity: 0.3,
        confidence: 0.8,
        reason: 'Image appears underexposed'
      });
    } else if (analysis.brightness > 0.8) {
      recommendations.push({
        type: 'brightness',
        intensity: -0.2,
        confidence: 0.7,
        reason: 'Image appears overexposed'
      });
    }

    // Contrast recommendations
    if (analysis.contrast < 0.4) {
      recommendations.push({
        type: 'contrast',
        intensity: 0.4,
        confidence: 0.9,
        reason: 'Low contrast detected'
      });
    }

    // Saturation recommendations
    if (analysis.saturation < 0.6) {
      recommendations.push({
        type: 'saturation',
        intensity: 0.3,
        confidence: 0.7,
        reason: 'Colors appear dull'
      });
    }

    // Sharpening recommendations
    if (analysis.sharpness < 0.7) {
      recommendations.push({
        type: 'sharpening',
        intensity: 0.5,
        confidence: 0.8,
        reason: 'Image appears soft'
      });
    }

    // Noise reduction recommendations
    if (analysis.noiseLevel > 0.3) {
      recommendations.push({
        type: 'noise_reduction',
        intensity: 0.6,
        confidence: 0.9,
        reason: 'High noise level detected'
      });
    }

    // Color correction recommendations
    const { red, green, blue } = analysis.colorBalance;
    if (Math.abs(red - 1) > 0.2 || Math.abs(green - 1) > 0.2 || Math.abs(blue - 1) > 0.2) {
      recommendations.push({
        type: 'color_correction',
        intensity: 0.7,
        confidence: 0.8,
        reason: 'Color balance needs adjustment'
      });
    }

    return recommendations;
  }

  private generateAdaptiveEnhancementPlan(
    analysis: ImageAnalysis,
    options: ProgressiveEnhancementOptions
  ): EnhancementStep[] {
    const plan: EnhancementStep[] = [];

    // Use recommendations to build adaptive plan
    for (const recommendation of analysis.recommendations) {
      plan.push({
        type: recommendation.type as any,
        intensity: recommendation.intensity,
        applied: false,
        processingTime: 0
      });
    }

    // Sort by confidence and importance
    return plan.sort((a, b) => {
      const aRec = analysis.recommendations.find(r => r.type === a.type);
      const bRec = analysis.recommendations.find(r => r.type === b.type);
      return (bRec?.confidence || 0) - (aRec?.confidence || 0);
    });
  }

  private generateStandardEnhancementPlan(
    options: ProgressiveEnhancementOptions
  ): EnhancementStep[] {
    const plan: EnhancementStep[] = [];

    if (options.enableColorCorrection) {
      plan.push({
        type: 'color_correction',
        intensity: 0.5,
        applied: false,
        processingTime: 0
      });
    }

    if (options.enableBrightnessAdjustment) {
      plan.push({
        type: 'brightness',
        intensity: 0.2,
        applied: false,
        processingTime: 0
      });
    }

    if (options.enableContrastAdjustment) {
      plan.push({
        type: 'contrast',
        intensity: 0.3,
        applied: false,
        processingTime: 0
      });
    }

    if (options.enableSaturationAdjustment) {
      plan.push({
        type: 'saturation',
        intensity: 0.2,
        applied: false,
        processingTime: 0
      });
    }

    if (options.enableSharpening) {
      plan.push({
        type: 'sharpening',
        intensity: 0.4,
        applied: false,
        processingTime: 0
      });
    }

    if (options.enableNoiseReduction) {
      plan.push({
        type: 'noise_reduction',
        intensity: 0.3,
        applied: false,
        processingTime: 0
      });
    }

    return plan;
  }

  private shouldApplyEnhancement(
    step: EnhancementStep,
    options: ProgressiveEnhancementOptions
  ): boolean {
    switch (step.type) {
      case 'color_correction':
        return options.enableColorCorrection !== false;
      case 'brightness':
        return options.enableBrightnessAdjustment !== false;
      case 'contrast':
        return options.enableContrastAdjustment !== false;
      case 'saturation':
        return options.enableSaturationAdjustment !== false;
      case 'sharpening':
        return options.enableSharpening !== false;
      case 'noise_reduction':
        return options.enableNoiseReduction !== false;
      default:
        return true;
    }
  }

  private async applyEnhancementStep(
    imageUri: string,
    step: EnhancementStep
  ): Promise<string> {
    // Apply enhancement using expo-image-manipulator
    // Note: expo-image-manipulator has limited enhancement capabilities
    // In a real implementation, you'd use more advanced image processing libraries

    switch (step.type) {
      case 'brightness':
        return await this.adjustBrightness(imageUri, step.intensity);
      case 'contrast':
        return await this.adjustContrast(imageUri, step.intensity);
      case 'saturation':
        return await this.adjustSaturation(imageUri, step.intensity);
      case 'sharpening':
        return await this.applySharpen(imageUri, step.intensity);
      case 'noise_reduction':
        return await this.applyNoiseReduction(imageUri, step.intensity);
      case 'color_correction':
        return await this.applyColorCorrection(imageUri, step.intensity);
      default:
        return imageUri;
    }
  }

  private async adjustBrightness(imageUri: string, intensity: number): Promise<string> {
    // Mock brightness adjustment - expo-image-manipulator doesn't have direct brightness control
    // In real implementation, use a proper image processing library
    const result = await manipulateAsync(
      imageUri,
      [], // No direct brightness manipulation available
      {
        compress: 0.95,
        format: SaveFormat.JPEG
      }
    );
    return result.uri;
  }

  private async adjustContrast(imageUri: string, intensity: number): Promise<string> {
    // Mock contrast adjustment
    const result = await manipulateAsync(
      imageUri,
      [],
      {
        compress: 0.95,
        format: SaveFormat.JPEG
      }
    );
    return result.uri;
  }

  private async adjustSaturation(imageUri: string, intensity: number): Promise<string> {
    // Mock saturation adjustment
    const result = await manipulateAsync(
      imageUri,
      [],
      {
        compress: 0.95,
        format: SaveFormat.JPEG
      }
    );
    return result.uri;
  }

  private async applySharpen(imageUri: string, intensity: number): Promise<string> {
    // Mock sharpening
    const result = await manipulateAsync(
      imageUri,
      [],
      {
        compress: 0.95,
        format: SaveFormat.JPEG
      }
    );
    return result.uri;
  }

  private async applyNoiseReduction(imageUri: string, intensity: number): Promise<string> {
    // Mock noise reduction
    const result = await manipulateAsync(
      imageUri,
      [],
      {
        compress: 0.9, // Slight compression can reduce noise
        format: SaveFormat.JPEG
      }
    );
    return result.uri;
  }

  private async applyColorCorrection(imageUri: string, intensity: number): Promise<string> {
    // Mock color correction
    const result = await manipulateAsync(
      imageUri,
      [],
      {
        compress: 0.95,
        format: SaveFormat.JPEG
      }
    );
    return result.uri;
  }

  private async createBackup(imageUri: string): Promise<string> {
    const timestamp = Date.now();
    const backupUri = `${FileSystem.documentDirectory}backup_${timestamp}.jpg`;
    
    await FileSystem.copyAsync({
      from: imageUri,
      to: backupUri
    });
    
    return backupUri;
  }

  private async calculateQualityImprovement(
    originalUri: string,
    enhancedUri: string,
    analysis: ImageAnalysis
  ): Promise<number> {
    // Mock quality improvement calculation
    // In real implementation, this would compare image metrics
    const baseImprovement = 0.1;
    const analysisBonus = (1 - analysis.brightness) * 0.2 + 
                         (1 - analysis.contrast) * 0.3 + 
                         analysis.noiseLevel * 0.4;
    
    return Math.min(0.8, baseImprovement + analysisBonus);
  }

  private extractEnhancementMetadata(enhancements: EnhancementStep[]): any {
    const metadata: any = {
      colorCorrectionApplied: false,
      sharpeningLevel: 0,
      noiseReductionLevel: 0,
      contrastAdjustment: 0,
      brightnessAdjustment: 0,
      saturationAdjustment: 0
    };

    for (const enhancement of enhancements) {
      if (!enhancement.applied) continue;

      switch (enhancement.type) {
        case 'color_correction':
          metadata.colorCorrectionApplied = true;
          break;
        case 'sharpening':
          metadata.sharpeningLevel = enhancement.intensity;
          break;
        case 'noise_reduction':
          metadata.noiseReductionLevel = enhancement.intensity;
          break;
        case 'contrast':
          metadata.contrastAdjustment = enhancement.intensity;
          break;
        case 'brightness':
          metadata.brightnessAdjustment = enhancement.intensity;
          break;
        case 'saturation':
          metadata.saturationAdjustment = enhancement.intensity;
          break;
      }
    }

    return metadata;
  }

  public clearCache(): void {
    this.analysisCache.clear();
  }

  public getCacheStats(): { analysisCache: number } {
    return {
      analysisCache: this.analysisCache.size
    };
  }
}

// Batch enhancement processor
class BatchEnhancementProcessor {
  private processingQueue: Array<{
    imageUri: string;
    options: ProgressiveEnhancementOptions;
    resolve: (result: EnhancementResult) => void;
    reject: (error: Error) => void;
  }> = [];
  
  private isProcessing = false;
  private maxConcurrent = 2;

  public async enhanceImages(
    imageUris: string[],
    options: ProgressiveEnhancementOptions = {}
  ): Promise<EnhancementResult[]> {
    const promises = imageUris.map(uri => 
      new Promise<EnhancementResult>((resolve, reject) => {
        this.processingQueue.push({ imageUri: uri, options, resolve, reject });
      })
    );

    this.processQueue();
    return Promise.all(promises);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;
    const engine = ProgressiveEnhancementEngine.getInstance();

    while (this.processingQueue.length > 0) {
      const batch = this.processingQueue.splice(0, this.maxConcurrent);
      
      await Promise.all(
        batch.map(async ({ imageUri, options, resolve, reject }) => {
          try {
            const result = await engine.enhanceImage(imageUri, options);
            resolve(result);
          } catch (error) {
            reject(error as Error);
          }
        })
      );
    }

    this.isProcessing = false;
  }
}

// Export instances and types
export const progressiveEnhancementEngine = ProgressiveEnhancementEngine.getInstance();
export const batchEnhancementProcessor = new BatchEnhancementProcessor();

export type {
  ProgressiveEnhancementOptions,
  EnhancementResult,
  EnhancementStep,
  ImageAnalysis,
  EnhancementRecommendation
};
