import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { trackEvent } from '@services/analyticsService';
import TokenStore, { TokenPair } from '../utils/tokenStore';
import { shouldRefreshToken } from '../utils/jwtUtils';
import tokenRefreshManager from '../utils/tokenRefreshManager';

export interface RefreshTokenResponse {
  data?: {
    accessToken?: string;
    access_token?: string;
    refreshToken?: string;
    refresh_token?: string;
  };
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
      timeout: 90000,
      validateStatus: (status) => {
        return status >= 200 && status < 500;
      },
      maxRedirects: 5,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        (config as unknown as Record<string, unknown>).metadata = { startTime: Date.now() };

        try {
          const currentToken = await TokenStore.getAccessToken();
          if (currentToken && shouldRefreshToken(currentToken)) {
            if (__DEV__) {
              console.log('🔄 Proactive token refresh triggered by interceptor');
            }
            await this.refreshTokenProactively();
          }
        } catch (error) {
          if (__DEV__) {
            console.warn('⚠️ Proactive refresh failed, proceeding with existing token:', error);
          }
        }

        const accessToken = await TokenStore.getAccessToken();

        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        try {
          const url = originalRequest?.url || '';
          const metadata = originalRequest as Record<string, { startTime?: number }> | undefined;
          const start = metadata?.metadata?.startTime || Date.now();
          const latency = Date.now() - start;
          const endpointGroup = groupEndpoint(url);
          const status = error?.response?.status ?? 0;
          const isNetworkError = !error?.response;
          trackEvent('api-error', {
            endpointGroup,
            statusCode: status,
            isNetworkError: Boolean(isNetworkError),
            latencyBucket: bucketLatency(latency),
          });
        } catch {}

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const accessToken = await this.refreshTokenProactively();
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.axiosInstance(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public async refreshTokenProactively(): Promise<string> {
    return tokenRefreshManager.refreshToken();
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const mergedConfig = {
      ...config,
      timeout: config?.timeout || this.axiosInstance.defaults.timeout
    };
    return this.axiosInstance.get<T>(url, mergedConfig);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const mergedConfig = {
      ...config,
      timeout: config?.timeout || this.axiosInstance.defaults.timeout
    };
    return this.axiosInstance.post<T>(url, data, mergedConfig);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const mergedConfig = {
      ...config,
      timeout: config?.timeout || this.axiosInstance.defaults.timeout
    };
    return this.axiosInstance.put<T>(url, data, mergedConfig);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const mergedConfig = {
      ...config,
      timeout: config?.timeout || this.axiosInstance.defaults.timeout
    };
    return this.axiosInstance.delete<T>(url, mergedConfig);
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const mergedConfig = {
      ...config,
      timeout: config?.timeout || this.axiosInstance.defaults.timeout
    };
    return this.axiosInstance.patch<T>(url, data, mergedConfig);
  }

  // Method to manually set tokens (for login)
  public async setTokens(tokens: TokenPair): Promise<void> {
    await TokenStore.storeTokens(tokens);
  }

  // Method to clear tokens (for logout)
  public async clearTokens(): Promise<void> {
    await TokenStore.clearTokens();
  }

  // Get current access token
  public async getAccessToken(): Promise<string | null> {
    return TokenStore.getAccessToken();
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

function groupEndpoint(url: string): string {
  try {
    const u = new URL(url, 'https://placeholder');
    const parts = (u.pathname || '/')
      .split('/')
      .filter(Boolean)
      .map((p) => (isLikelyId(p) ? '*' : p));
    const collapsed = parts.slice(0, 3).join('/');
    return collapsed || '/';
  } catch {
    return '/';
  }
}

function isLikelyId(segment: string): boolean {
  if (!segment) return false;
  if (/^[0-9]+$/.test(segment)) return true;
  if (/^[0-9a-fA-F-]{8,}$/.test(segment)) return true;
  return false;
}

function bucketLatency(ms: number): string {
  if (ms < 200) return '<200ms';
  if (ms < 500) return '200-499ms';
  if (ms < 1000) return '500-999ms';
  if (ms < 2000) return '1-1.9s';
  return '>=2s';
}
