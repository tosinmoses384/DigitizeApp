import { ErrorCode, ImageProcessingError } from '../types';
import { ERROR_RECOVERY_SUGGESTIONS } from '../constants/errorMessages';

export class EnhancedErrorHandler {
  private static instance: EnhancedErrorHandler;
  private errorHistory: Map<string, number> = new Map();
  private recoveryAttempts: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): EnhancedErrorHandler {
    if (!EnhancedErrorHandler.instance) {
      EnhancedErrorHandler.instance = new EnhancedErrorHandler();
    }
    return EnhancedErrorHandler.instance;
  }

  createImageProcessingError(
    originalError: any,
    category: 'selection' | 'processing' | 'storage' | 'platform' | 'memory',
    context?: string,
  ): ImageProcessingError {
    const error = new Error(
      originalError?.message || originalError,
    ) as ImageProcessingError;

    error.code = this.determineErrorCode(originalError);
    error.category = category;
    error.severity = this.determineSeverity(error.code);
    error.recoverySuggestions = this.getRecoverySuggestions(error.code);
    error.retryable = this.isRetryable(error.code);

    // Add platform-specific information
    error.platformSpecific = this.getPlatformSpecificInfo(error.code);

    // Track error frequency
    this.trackError(error.code);

    return error;
  }

  private determineErrorCode(error: any): ErrorCode {
    const message = error?.message?.toLowerCase() || '';

    if (message.includes('permission') || message.includes('denied')) {
      return 'PERMISSION_DENIED';
    }
    if (message.includes('cancel')) {
      return 'USER_CANCELLED';
    }
    if (message.includes('too large') || message.includes('size')) {
      return 'IMAGE_TOO_LARGE';
    }
    if (message.includes('format') || message.includes('unsupported')) {
      return 'UNSUPPORTED_FORMAT';
    }
    if (message.includes('memory')) {
      return 'MEMORY_INSUFFICIENT';
    }
    if (message.includes('storage') || message.includes('space')) {
      return 'STORAGE_FULL';
    }
    if (message.includes('network')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  private determineSeverity(
    code: ErrorCode,
  ): 'low' | 'medium' | 'high' | 'critical' {
    switch (code) {
      case 'USER_CANCELLED':
        return 'low';
      case 'PERMISSION_DENIED':
      case 'UNSUPPORTED_FORMAT':
      case 'NETWORK_ERROR':
        return 'medium';
      case 'IMAGE_TOO_LARGE':
      case 'PROCESSING_FAILED':
      case 'TIMEOUT_ERROR':
        return 'high';
      case 'MEMORY_INSUFFICIENT':
      case 'STORAGE_FULL':
        return 'critical';
      default:
        return 'medium';
    }
  }

  private getRecoverySuggestions(code: ErrorCode): string[] {
    return (
      ERROR_RECOVERY_SUGGESTIONS[code] || [
        'Try again',
        'Restart the app if the problem persists',
      ]
    );
  }

  private isRetryable(code: ErrorCode): boolean {
    switch (code) {
      case 'USER_CANCELLED':
      case 'PERMISSION_DENIED':
      case 'NETWORK_ERROR':
      case 'TIMEOUT_ERROR':
        return true;
      case 'UNSUPPORTED_FORMAT':
        return false;
      default:
        return true;
    }
  }

  private getPlatformSpecificInfo(
    code: ErrorCode,
  ): { ios?: string; android?: string } | undefined {
    switch (code) {
      case 'PERMISSION_DENIED':
        return {
          ios: 'Go to Settings > Privacy & Security and enable permissions',
          android: 'Go to Settings > Apps > Permissions and enable access',
        };
      case 'STORAGE_FULL':
        return {
          ios: 'Go to Settings > General > iPhone Storage',
          android: 'Go to Settings > Device Care > Storage',
        };
      default:
        return undefined;
    }
  }

  private trackError(code: ErrorCode): void {
    const count = this.errorHistory.get(code) || 0;
    this.errorHistory.set(code, count + 1);
  }

  shouldRetry(code: ErrorCode, maxAttempts: number = 3): boolean {
    if (!this.isRetryable(code)) {
      return false;
    }

    const attempts = this.recoveryAttempts.get(code) || 0;
    if (attempts >= maxAttempts) {
      return false;
    }

    this.recoveryAttempts.set(code, attempts + 1);
    return true;
  }

  getErrorStatistics(): Record<string, number> {
    return Object.fromEntries(this.errorHistory);
  }

  resetRecoveryAttempts(code?: ErrorCode): void {
    if (code) {
      this.recoveryAttempts.delete(code);
    } else {
      this.recoveryAttempts.clear();
    }
  }
}

// Utility function for enhanced error handling with auto-retry
export async function withAutoRetry<T>(
  operation: () => Promise<T>,
  errorHandler: EnhancedErrorHandler,
  maxAttempts: number | null = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: any;

  if (!maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      throw errorHandler.createImageProcessingError(error, 'processing');
    }
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const processingError = errorHandler.createImageProcessingError(
        error,
        'processing',
      );

      if (
        attempt === maxAttempts ||
        !errorHandler.shouldRetry(processingError.code)
      ) {
        throw processingError;
      }

      // Exponential backoff delay
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Circuit breaker pattern for preventing cascade failures
export class ImageProcessingCircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly timeoutMs: number = 60000, // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.timeoutMs) {
        throw new Error('Circuit breaker is OPEN - operation rejected');
      } else {
        this.state = 'HALF_OPEN';
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
}
