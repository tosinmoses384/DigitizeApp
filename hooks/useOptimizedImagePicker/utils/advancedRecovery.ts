import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

interface RecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackStrategies?: FallbackStrategy[];
  enableParameterAdjustment?: boolean;
  enableFormatFallback?: boolean;
  enableQualityReduction?: boolean;
  enableSizeFallback?: boolean;
  preserveAttemptHistory?: boolean;
  timeoutMs?: number;
}

interface FallbackStrategy {
  name: string;
  priority: number;
  condition: (error: Error, attempt: number) => boolean;
  action: (originalParams: any, attempt: number) => Promise<any>;
  description: string;
}

interface RecoveryAttempt {
  attempt: number;
  strategy: string;
  parameters: any;
  error?: Error;
  success: boolean;
  processingTime: number;
  timestamp: string;
}

interface RecoveryResult<T> {
  success: boolean;
  result?: T;
  finalError?: Error;
  attempts: RecoveryAttempt[];
  totalTime: number;
  strategyUsed?: string;
  parametersAdjusted: boolean;
}

class AdvancedRecoveryManager {
  private static instance: AdvancedRecoveryManager;
  private recoveryHistory: Map<string, RecoveryAttempt[]> = new Map();
  private fallbackStrategies: Map<string, FallbackStrategy[]> = new Map();

  public static getInstance(): AdvancedRecoveryManager {
    if (!AdvancedRecoveryManager.instance) {
      AdvancedRecoveryManager.instance = new AdvancedRecoveryManager();
      AdvancedRecoveryManager.instance.initializeDefaultStrategies();
    }
    return AdvancedRecoveryManager.instance;
  }

  private initializeDefaultStrategies(): void {
    // Image processing fallback strategies
    const imageProcessingStrategies: FallbackStrategy[] = [
      {
        name: 'reduce_quality',
        priority: 1,
        condition: (error, attempt) => 
          (error.message.includes('memory') || error.message.includes('size')) && attempt <= 3,
        action: async (params, attempt) => ({
          ...params,
          quality: Math.max(0.3, params.quality - (attempt * 0.2))
        }),
        description: 'Reduce image quality to save memory'
      },
      {
        name: 'reduce_dimensions',
        priority: 2,
        condition: (error, attempt) => 
          (error.message.includes('memory') || error.message.includes('large')) && attempt <= 2,
        action: async (params, attempt) => {
          const scaleFactor = 1 - (attempt * 0.3);
          return {
            ...params,
            maxWidth: params.maxWidth ? Math.floor(params.maxWidth * scaleFactor) : 1920,
            maxHeight: params.maxHeight ? Math.floor(params.maxHeight * scaleFactor) : 1080
          };
        },
        description: 'Reduce image dimensions'
      },
      {
        name: 'change_format',
        priority: 3,
        condition: (error, attempt) => 
          error.message.includes('format') && attempt <= 2,
        action: async (params, attempt) => ({
          ...params,
          format: attempt === 1 ? 'jpeg' : 'png'
        }),
        description: 'Try different image format'
      },
      {
        name: 'disable_features',
        priority: 4,
        condition: (error, attempt) => 
          (error.message.includes('processing') || error.message.includes('feature')) && attempt <= 3,
        action: async (params, attempt) => ({
          ...params,
          enableSmartCropping: false,
          enableBackgroundRemoval: false,
          enableEnhancement: false
        }),
        description: 'Disable advanced features'
      },
      {
        name: 'basic_processing',
        priority: 5,
        condition: (error, attempt) => attempt <= 1,
        action: async (params, attempt) => ({
          quality: 0.8,
          format: 'jpeg',
          enableSmartCropping: false,
          enableBackgroundRemoval: false,
          enableEnhancement: false
        }),
        description: 'Use basic processing only'
      }
    ];

    this.fallbackStrategies.set('image_processing', imageProcessingStrategies);

    // Network/file access strategies
    const fileAccessStrategies: FallbackStrategy[] = [
      {
        name: 'retry_with_delay',
        priority: 1,
        condition: (error, attempt) => 
          (error.message.includes('network') || error.message.includes('timeout')) && attempt <= 3,
        action: async (params, attempt) => {
          await this.delay(attempt * 1000);
          return params;
        },
        description: 'Retry with exponential backoff'
      },
      {
        name: 'copy_to_temp',
        priority: 2,
        condition: (error, attempt) => 
          error.message.includes('access') && attempt <= 2,
        action: async (params, attempt) => {
          const tempUri = await this.copyToTempLocation(params.uri || '');
          return { ...params, uri: tempUri };
        },
        description: 'Copy file to temporary location'
      },
      {
        name: 'alternative_path',
        priority: 3,
        condition: (error, attempt) => 
          error.message.includes('path') && attempt <= 1,
        action: async (params, attempt) => {
          const alternativeUri = await this.findAlternativePath(params.uri || '');
          return { ...params, uri: alternativeUri };
        },
        description: 'Try alternative file path'
      }
    ];

    this.fallbackStrategies.set('file_access', fileAccessStrategies);
  }

  public async executeWithRecovery<T>(
    operation: (params: any) => Promise<T>,
    params: any,
    strategyType: string = 'image_processing',
    options: RecoveryOptions = {}
  ): Promise<RecoveryResult<T>> {
    const {
      maxRetries = 5,
      retryDelay = 1000,
      fallbackStrategies = this.fallbackStrategies.get(strategyType) || [],
      enableParameterAdjustment = true,
      preserveAttemptHistory = true,
      timeoutMs = 30000
    } = options;

    const startTime = Date.now();
    const attempts: RecoveryAttempt[] = [];
    let currentParams = { ...params };
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      const attemptStartTime = Date.now();
      let strategyUsed = attempt === 1 ? 'original' : 'fallback';

      try {
        // Apply timeout wrapper
        const result = await Promise.race([
          operation(currentParams),
          this.timeoutPromise(timeoutMs)
        ]);

        // Success - record attempt and return
        const attemptRecord: RecoveryAttempt = {
          attempt,
          strategy: strategyUsed,
          parameters: { ...currentParams },
          success: true,
          processingTime: Date.now() - attemptStartTime,
          timestamp: new Date().toISOString()
        };

        attempts.push(attemptRecord);

        if (preserveAttemptHistory) {
          this.recordRecoveryHistory(params.uri || params.args?.[0] || 'unknown', attempts);
        }

        return {
          success: true,
          result: result as T,
          attempts,
          totalTime: Date.now() - startTime,
          strategyUsed,
          parametersAdjusted: attempt > 1
        };

      } catch (error) {
        lastError = error as Error;
        
        const attemptRecord: RecoveryAttempt = {
          attempt,
          strategy: strategyUsed,
          parameters: { ...currentParams },
          error: lastError,
          success: false,
          processingTime: Date.now() - attemptStartTime,
          timestamp: new Date().toISOString()
        };

        attempts.push(attemptRecord);

        // If this was the last attempt, break
        if (attempt > maxRetries) break;

        // Find and apply fallback strategy
        if (enableParameterAdjustment) {
          const strategy = this.findApplicableStrategy(fallbackStrategies, lastError, attempt);
          
          if (strategy) {
            try {
              currentParams = await strategy.action(currentParams, attempt);
              strategyUsed = strategy.name;
              console.log(`Applying recovery strategy: ${strategy.name} - ${strategy.description}`);
            } catch (strategyError) {
              console.warn(`Recovery strategy ${strategy.name} failed:`, strategyError);
            }
          }
        }

        // Wait before retry
        if (attempt <= maxRetries) {
          await this.delay(retryDelay * attempt);
        }
      }
    }

    // All attempts failed
    if (preserveAttemptHistory) {
      this.recordRecoveryHistory(params.uri || 'unknown', attempts);
    }

    return {
      success: false,
      finalError: lastError,
      attempts,
      totalTime: Date.now() - startTime,
      parametersAdjusted: attempts.length > 1
    };
  }

  private findApplicableStrategy(
    strategies: FallbackStrategy[],
    error: Error,
    attempt: number
  ): FallbackStrategy | null {
    // Sort by priority and find first applicable strategy
    const sortedStrategies = strategies.sort((a, b) => a.priority - b.priority);
    
    for (const strategy of sortedStrategies) {
      if (strategy.condition(error, attempt)) {
        return strategy;
      }
    }

    return null;
  }

  private async timeoutPromise<T>(timeoutMs: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async copyToTempLocation(uri: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const tempUri = `${FileSystem.documentDirectory}temp_${timestamp}.jpg`;
      
      await FileSystem.copyAsync({
        from: uri,
        to: tempUri
      });
      
      return tempUri;
    } catch (error) {
      throw new Error(`Failed to copy to temp location: ${error}`);
    }
  }

  private async findAlternativePath(uri: string): Promise<string> {
    // Try to find alternative paths or cached versions
    // This is a simplified implementation
    const alternatives = [
      uri.replace('file://', ''),
      uri.replace('content://', 'file://'),
      `${FileSystem.documentDirectory}${uri.split('/').pop()}`
    ];

    for (const altUri of alternatives) {
      try {
        const info = await FileSystem.getInfoAsync(altUri);
        if (info.exists) {
          return altUri;
        }
      } catch (error) {
        // Continue to next alternative
      }
    }

    throw new Error('No alternative path found');
  }

  private recordRecoveryHistory(identifier: string, attempts: RecoveryAttempt[]): void {
    this.recoveryHistory.set(identifier, attempts);
    
    // Limit history size
    if (this.recoveryHistory.size > 100) {
      const oldestKey = this.recoveryHistory.keys().next().value;
      if (oldestKey) {
        this.recoveryHistory.delete(oldestKey);
      }
    }
  }

  public getRecoveryHistory(identifier: string): RecoveryAttempt[] | undefined {
    return this.recoveryHistory.get(identifier);
  }

  public getRecoveryStats(): {
    totalRecoveries: number;
    successRate: number;
    mostCommonFailures: Array<{ error: string; count: number }>;
    mostUsedStrategies: Array<{ strategy: string; count: number }>;
  } {
    const allAttempts = Array.from(this.recoveryHistory.values()).flat();
    const totalRecoveries = this.recoveryHistory.size;
    const successfulRecoveries = Array.from(this.recoveryHistory.values())
      .filter(attempts => attempts.some(a => a.success)).length;
    
    const successRate = totalRecoveries > 0 ? successfulRecoveries / totalRecoveries : 0;

    // Count error types
    const errorCounts = new Map<string, number>();
    const strategyCounts = new Map<string, number>();

    for (const attempt of allAttempts) {
      if (attempt.error) {
        const errorType = this.categorizeError(attempt.error);
        errorCounts.set(errorType, (errorCounts.get(errorType) || 0) + 1);
      }
      
      if (attempt.strategy !== 'original') {
        strategyCounts.set(attempt.strategy, (strategyCounts.get(attempt.strategy) || 0) + 1);
      }
    }

    const mostCommonFailures = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const mostUsedStrategies = Array.from(strategyCounts.entries())
      .map(([strategy, count]) => ({ strategy, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRecoveries,
      successRate,
      mostCommonFailures,
      mostUsedStrategies
    };
  }

  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('memory')) return 'Memory Error';
    if (message.includes('network')) return 'Network Error';
    if (message.includes('timeout')) return 'Timeout Error';
    if (message.includes('format')) return 'Format Error';
    if (message.includes('access') || message.includes('permission')) return 'Access Error';
    if (message.includes('size')) return 'Size Error';
    if (message.includes('processing')) return 'Processing Error';
    
    return 'Unknown Error';
  }

  public addCustomStrategy(
    strategyType: string,
    strategy: FallbackStrategy
  ): void {
    if (!this.fallbackStrategies.has(strategyType)) {
      this.fallbackStrategies.set(strategyType, []);
    }
    
    this.fallbackStrategies.get(strategyType)!.push(strategy);
  }

  public clearHistory(): void {
    this.recoveryHistory.clear();
  }
}

// Automatic retry decorator
export function withAutoRetry<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: RecoveryOptions = {}
) {
  return async (...args: T): Promise<R> => {
    const recoveryManager = AdvancedRecoveryManager.getInstance();
    
    const result = await recoveryManager.executeWithRecovery(
      async (params) => operation(...args),
      { args },
      'image_processing',
      options
    );

    if (result.success) {
      return result.result!;
    } else {
      throw result.finalError || new Error('Operation failed after all recovery attempts');
    }
  };
}

// Circuit breaker for preventing cascading failures
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private resetTimeout: number = 30000
  ) {}

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime < this.resetTimeout) {
        throw new Error('Circuit breaker is open');
      } else {
        this.state = 'half-open';
      }
    }

    try {
      const result = await Promise.race([
        operation(),
        this.timeoutPromise()
      ]);
      
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  private async timeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Circuit breaker timeout'));
      }, this.timeout);
    });
  }

  public getState(): { state: string; failures: number; lastFailureTime: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Export instances and types
export const advancedRecoveryManager = AdvancedRecoveryManager.getInstance();
export const imageProcessingCircuitBreaker = new CircuitBreaker(3, 30000, 60000);

export type {
  RecoveryOptions,
  RecoveryResult,
  RecoveryAttempt,
  FallbackStrategy
};
