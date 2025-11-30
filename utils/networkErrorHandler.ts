/**
 * Network Error Handler Utility
 * 
 * Comprehensive error handling for network requests following DigitizeApp coding standards.
 * Provides intelligent error classification, retry logic, and user-friendly messaging.
 */

import NetInfo from '@react-native-community/netinfo';
import { useToast } from 'react-native-toast-notifications';

export interface NetworkError {
  code: string;
  message: string;
  isRetryable: boolean;
  userMessage: string;
  technicalDetails?: string;
  retryAfter?: number; // milliseconds
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

export class NetworkErrorHandler {
  private static instance: NetworkErrorHandler;
  private retryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
  };

  static getInstance(): NetworkErrorHandler {
    if (!NetworkErrorHandler.instance) {
      NetworkErrorHandler.instance = new NetworkErrorHandler();
    }
    return NetworkErrorHandler.instance;
  }

  /**
   * Classify and handle network errors intelligently
   */
  async handleError(error: any, context: string = 'API Request'): Promise<NetworkError> {
    console.log(`🔍 Analyzing error in ${context}:`, {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      isAxiosError: error?.isAxiosError
    });

    // Check network connectivity first
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      return {
        code: 'NO_CONNECTION',
        message: 'No internet connection available',
        isRetryable: true,
        userMessage: 'Please check your internet connection and try again.',
        technicalDetails: 'Device is not connected to any network',
        retryAfter: 5000
      };
    }

    // Handle different error types
    if (this.isCanceledError(error)) {
      return this.handleCanceledError(error);
    }

    if (this.isTimeoutError(error)) {
      return this.handleTimeoutError(error);
    }

    if (this.isNetworkError(error)) {
      return this.handleNetworkError(error);
    }

    if (this.isServerError(error)) {
      return this.handleServerError(error);
    }

    if (this.isClientError(error)) {
      return this.handleClientError(error);
    }

    // Unknown error
    return {
      code: 'UNKNOWN_ERROR',
      message: error?.message || 'An unexpected error occurred',
      isRetryable: false,
      userMessage: 'Something went wrong. Please try again later.',
      technicalDetails: `Unknown error: ${JSON.stringify(error)}`
    };
  }

  /**
   * Check if error is a cancellation error
   */
  private isCanceledError(error: any): boolean {
    return (
      error?.name === 'CanceledError' ||
      error?.name === 'AbortError' ||
      error?.code === 'ERR_CANCELED' ||
      error?.message?.toLowerCase().includes('canceled') ||
      error?.message?.toLowerCase().includes('aborted')
    );
  }

  /**
   * Handle canceled errors (user cancellation vs timeout)
   */
  private handleCanceledError(error: any): NetworkError {
    const isTimeout = error?.message?.includes('timeout') || 
                     error?.code === 'ECONNABORTED';

    if (isTimeout) {
      return {
        code: 'REQUEST_TIMEOUT',
        message: 'Request was canceled due to timeout',
        isRetryable: true,
        userMessage: 'The request took too long to complete. Please try again.',
        technicalDetails: 'Request exceeded timeout threshold',
        retryAfter: 2000
      };
    }

    return {
      code: 'REQUEST_CANCELED',
      message: 'Request was canceled',
      isRetryable: false,
      userMessage: 'Request was canceled',
      technicalDetails: 'User or system canceled the request'
    };
  }

  /**
   * Check if error is a timeout error
   */
  private isTimeoutError(error: any): boolean {
    return (
      error?.code === 'ETIMEDOUT' ||
      error?.message?.toLowerCase().includes('timeout') ||
      error?.response?.status === 408
    );
  }

  /**
   * Handle timeout errors
   */
  private handleTimeoutError(error: any): NetworkError {
    return {
      code: 'TIMEOUT',
      message: 'Request timed out',
      isRetryable: true,
      userMessage: 'The request took too long. Please check your connection and try again.',
      technicalDetails: `Timeout error: ${error?.message}`,
      retryAfter: 3000
    };
  }

  /**
   * Check if error is a network error
   */
  private isNetworkError(error: any): boolean {
    return (
      error?.code === 'NETWORK_ERROR' ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ENOTFOUND' ||
      error?.code === 'ECONNRESET' ||
      !error?.response && error?.request
    );
  }

  /**
   * Handle network errors
   */
  private handleNetworkError(error: any): NetworkError {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      isRetryable: true,
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      technicalDetails: `Network error: ${error?.code} - ${error?.message}`,
      retryAfter: 5000
    };
  }

  /**
   * Check if error is a server error (5xx)
   */
  private isServerError(error: any): boolean {
    const status = error?.response?.status;
    return status >= 500 && status < 600;
  }

  /**
   * Handle server errors
   */
  private handleServerError(error: any): NetworkError {
    const status = error?.response?.status;
    const isRetryable = this.retryConfig.retryableStatusCodes.includes(status);

    return {
      code: `SERVER_ERROR_${status}`,
      message: `Server error: ${status}`,
      isRetryable,
      userMessage: isRetryable 
        ? 'Server is temporarily unavailable. Please try again in a moment.'
        : 'Server error occurred. Please contact support if this continues.',
      technicalDetails: `Server returned ${status}: ${error?.response?.data?.detail || error?.message}`,
      retryAfter: isRetryable ? 5000 : undefined
    };
  }

  /**
   * Check if error is a client error (4xx)
   */
  private isClientError(error: any): boolean {
    const status = error?.response?.status;
    return status >= 400 && status < 500;
  }

  /**
   * Handle client errors
   */
  private handleClientError(error: any): NetworkError {
    const status = error?.response?.status;
    
    switch (status) {
      case 400:
        return {
          code: 'BAD_REQUEST',
          message: 'Invalid request',
          isRetryable: false,
          userMessage: 'Invalid request. Please check your input and try again.',
          technicalDetails: `Bad request: ${error?.response?.data?.detail || error?.message}`
        };
      
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          isRetryable: false,
          userMessage: 'Please sign in again.',
          technicalDetails: 'Authentication token is invalid or expired'
        };
      
      case 403:
        return {
          code: 'FORBIDDEN',
          message: 'Access denied',
          isRetryable: false,
          userMessage: 'You don\'t have permission to perform this action.',
          technicalDetails: `Access forbidden: ${error?.response?.data?.detail || error?.message}`
        };
      
      case 404:
        return {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          isRetryable: false,
          userMessage: 'The requested resource was not found.',
          technicalDetails: `Resource not found: ${error?.response?.data?.detail || error?.message}`
        };
      
      case 429:
        return {
          code: 'RATE_LIMITED',
          message: 'Too many requests',
          isRetryable: true,
          userMessage: 'Too many requests. Please wait a moment and try again.',
          technicalDetails: 'Rate limit exceeded',
          retryAfter: 10000
        };
      
      default:
        return {
          code: `CLIENT_ERROR_${status}`,
          message: `Client error: ${status}`,
          isRetryable: false,
          userMessage: 'Request failed. Please try again.',
          technicalDetails: `Client error ${status}: ${error?.response?.data?.detail || error?.message}`
        };
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Check if request should be retried
   */
  shouldRetry(error: NetworkError, attempt: number): boolean {
    return (
      error.isRetryable &&
      attempt < this.retryConfig.maxAttempts
    );
  }

  /**
   * Update retry configuration
   */
  updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * Show user-friendly error message
   */
  showErrorToast(error: NetworkError, toast: any): void {
    if (toast && error.userMessage) {
      toast.show(error.userMessage, {
        type: 'danger',
        duration: 4000,
        placement: 'top'
      });
    }
  }
}

// Export singleton instance
export const networkErrorHandler = NetworkErrorHandler.getInstance();

// Export helper function for easy integration
export const withNetworkErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string = 'API Request',
  toast?: any
): Promise<T> => {
  const handler = networkErrorHandler;
  
  try {
    return await operation();
  } catch (error) {
    const networkError = await handler.handleError(error, context);
    
    if (toast) {
      handler.showErrorToast(networkError, toast);
    }
    
    throw networkError;
  }
};