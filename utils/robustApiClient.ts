/**
 * Robust API Client with Retry Logic
 * 
 * A world-class API client that handles network issues gracefully with:
 * - Intelligent retry logic with exponential backoff
 * - Circuit breaker pattern for failing services
 * - Network status monitoring
 * - Comprehensive error handling
 * - Request/response logging for debugging
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { networkErrorHandler, NetworkError } from './networkErrorHandler';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

export interface RequestConfig extends AxiosRequestConfig {
  retryConfig?: Partial<RetryConfig>;
  circuitBreakerConfig?: Partial<CircuitBreakerConfig>;
  skipRetry?: boolean;
  context?: string;
}

class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit breaker: Attempting recovery');
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
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
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
      console.log(`🚨 Circuit breaker: OPEN after ${this.failures} failures`);
    }
  }

  getState(): string {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }
}

export class RobustApiClient {
  private axiosInstance: AxiosInstance;
  private circuitBreaker: CircuitBreaker;
  private defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
  };

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Connection': 'close'
      },
      validateStatus: (status) => status >= 200 && status < 500
    });

    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: 30000,
      monitoringPeriod: 60000
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ API Error: ${error?.response?.status || 'NO_STATUS'} ${error?.config?.url}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request with retry logic
   * Returns only the data part of the response
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.requestWithRetry(() => this.axiosInstance.get<T>(url, config), config);
    return response.data;
  }

  /**
   * Make a POST request with retry logic
   * Returns only the data part of the response
   */
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.requestWithRetry(() => this.axiosInstance.post<T>(url, data, config), config);
    return response.data;
  }

  /**
   * Make a PUT request with retry logic
   * Returns only the data part of the response
   */
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.requestWithRetry(() => this.axiosInstance.put<T>(url, data, config), config);
    return response.data;
  }

  /**
   * Make a DELETE request with retry logic
   * Returns only the data part of the response
   */
  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.requestWithRetry(() => this.axiosInstance.delete<T>(url, config), config);
    return response.data;
  }

  /**
   * Make a PATCH request with retry logic
   * Returns only the data part of the response
   */
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.requestWithRetry(() => this.axiosInstance.patch<T>(url, data, config), config);
    return response.data;
  }

  /**
   * Execute request with retry logic and circuit breaker
   */
  private async requestWithRetry<T>(
    operation: () => Promise<AxiosResponse<T>>,
    config?: RequestConfig
  ): Promise<AxiosResponse<T>> {
    const retryConfig = { ...this.defaultRetryConfig, ...config?.retryConfig };
    const context = config?.context || 'API Request';
    let lastError: any;

    // Check network connectivity first
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      throw new Error('No internet connection available');
    }

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        // Use circuit breaker
        const result = await this.circuitBreaker.execute(operation);
        return result;
      } catch (error) {
        lastError = error;
        
        // Analyze the error
        const networkError = await networkErrorHandler.handleError(error, context);
        
        // Check if we should retry
        if (config?.skipRetry || !networkErrorHandler.shouldRetry(networkError, attempt)) {
          throw networkError;
        }

        // Calculate delay for next attempt
        const delay = networkErrorHandler.calculateRetryDelay(attempt);
        
        console.log(`🔄 Retry attempt ${attempt}/${retryConfig.maxAttempts} after ${delay}ms delay`);
        
        // Wait before retry
        if (attempt < retryConfig.maxAttempts) {
          await this.delay(delay);
        }
      }
    }

    // All retries failed
    const finalError = await networkErrorHandler.handleError(lastError, context);
    throw finalError;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if service is available (circuit breaker state)
   */
  isServiceAvailable(): boolean {
    return this.circuitBreaker.getState() !== 'OPEN';
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): { state: string; failures: number } {
    return {
      state: this.circuitBreaker.getState(),
      failures: this.circuitBreaker.getFailures()
    };
  }

  /**
   * Update retry configuration
   */
  updateRetryConfig(config: Partial<RetryConfig>): void {
    this.defaultRetryConfig = { ...this.defaultRetryConfig, ...config };
  }

  /**
   * Update circuit breaker configuration
   */
  updateCircuitBreakerConfig(config: Partial<CircuitBreakerConfig>): void {
    // Note: This would require recreating the circuit breaker
    // For now, we'll just log the request
    console.log('Circuit breaker config update requested:', config);
  }
}

// Create singleton instance
export const robustApiClient = new RobustApiClient(process.env.EXPO_PUBLIC_API_BASE_URL || '');

// Export helper function for easy integration
export const withRobustApi = async <T>(
  operation: () => Promise<T>,
  config?: RequestConfig
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const networkError = await networkErrorHandler.handleError(error, config?.context || 'API Request');
    throw networkError;
  }
};