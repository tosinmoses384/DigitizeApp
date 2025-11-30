import axios from 'axios';
import TokenStore from './tokenStore';
import networkRequestGuard from './networkRequestGuard';

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

interface RefreshState {
  isRefreshing: boolean;
  refreshPromise: Promise<string> | null;
  lastRefreshAttempt: number;
  consecutiveFailures: number;
}

const REFRESH_TIMEOUT_MS = 15000;
const QUEUE_TIMEOUT_MS = 30000;
const MIN_REFRESH_INTERVAL_MS = 2000;
const MAX_CONSECUTIVE_FAILURES = 3;
const FAILURE_COOLDOWN_MS = 60000;

class TokenRefreshManager {
  private static instance: TokenRefreshManager;
  private state: RefreshState = {
    isRefreshing: false,
    refreshPromise: null,
    lastRefreshAttempt: 0,
    consecutiveFailures: 0,
  };
  private queue: QueuedRequest[] = [];
  private authFailureCallback: (() => void) | null = null;

  private constructor() {}

  static getInstance(): TokenRefreshManager {
    if (!TokenRefreshManager.instance) {
      TokenRefreshManager.instance = new TokenRefreshManager();
    }
    return TokenRefreshManager.instance;
  }

  setAuthFailureCallback(callback: () => void): void {
    this.authFailureCallback = callback;
  }

  private notifyAuthFailure(): void {
    if (this.authFailureCallback) {
      this.authFailureCallback();
    } else {
      try {
        const logoutHandler = (global as unknown as Record<string, unknown>).__authLogoutHandler;
        if (typeof logoutHandler === 'function') {
          logoutHandler();
        }
      } catch {}
    }
  }

  private processQueue(error: Error | null, token: string | null): void {
    const now = Date.now();
    
    this.queue.forEach(({ resolve, reject, timestamp }) => {
      if (now - timestamp > QUEUE_TIMEOUT_MS) {
        reject(new Error('Token refresh timeout - request was in queue too long'));
        return;
      }

      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      } else {
        reject(new Error('No token available after refresh'));
      }
    });

    this.queue = [];
  }

  private isInCooldown(): boolean {
    if (this.state.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      const timeSinceLastAttempt = Date.now() - this.state.lastRefreshAttempt;
      return timeSinceLastAttempt < FAILURE_COOLDOWN_MS;
    }
    return false;
  }

  private shouldThrottle(): boolean {
    const timeSinceLastRefresh = Date.now() - this.state.lastRefreshAttempt;
    return timeSinceLastRefresh < MIN_REFRESH_INTERVAL_MS;
  }

  async refreshToken(): Promise<string> {
    if (this.isInCooldown()) {
      const error = new Error('Token refresh temporarily disabled due to repeated failures');
      if (__DEV__) {
        console.warn('🛑 Token refresh in cooldown period');
      }
      throw error;
    }

    if (this.state.isRefreshing && this.state.refreshPromise) {
      if (__DEV__) {
        console.log('🔄 Refresh already in progress, waiting for existing request...');
      }
      return this.state.refreshPromise;
    }

    if (this.shouldThrottle()) {
      const existingToken = await TokenStore.getAccessToken();
      if (existingToken) {
        return existingToken;
      }
    }

    this.state.isRefreshing = true;
    this.state.lastRefreshAttempt = Date.now();

    this.state.refreshPromise = this.executeRefresh();

    try {
      const token = await this.state.refreshPromise;
      this.state.consecutiveFailures = 0;
      return token;
    } catch (error) {
      this.state.consecutiveFailures++;
      throw error;
    } finally {
      this.state.isRefreshing = false;
      this.state.refreshPromise = null;
    }
  }

  private async executeRefresh(): Promise<string> {
    const controller = new AbortController();
    const requestId = `token-refresh-${Date.now()}`;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    networkRequestGuard.registerRequest(requestId, controller, REFRESH_TIMEOUT_MS);

    try {
      const refreshToken = await TokenStore.getRefreshToken();

      if (!refreshToken) {
        const error = new Error('No refresh token available');
        this.processQueue(error, null);
        throw error;
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        if (__DEV__) {
          console.warn('⚠️ EXPO_PUBLIC_API_BASE_URL is not defined');
        }
      }

      const refreshUrl = `${baseUrl}/identity/v1/signin/refresh-token`;

      if (__DEV__) {
        console.log(`🔄 Refreshing token at: ${refreshUrl}`);
      }

      timeoutId = setTimeout(() => {
        controller.abort();
      }, REFRESH_TIMEOUT_MS);

      const response = await axios.post<{
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
      }>(
        refreshUrl,
        { refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: REFRESH_TIMEOUT_MS,
          signal: controller.signal,
        }
      );

      const responseData = response.data?.data || response.data;
      const accessToken = responseData?.accessToken || responseData?.access_token;
      const newRefreshToken = responseData?.refreshToken || responseData?.refresh_token;

      if (!accessToken) {
        const error = new Error('No access token in refresh response');
        this.processQueue(error, null);
        throw error;
      }

      if (__DEV__) {
        console.log('✅ Token refresh successful');
      }

      await TokenStore.storeTokens({
        accessToken,
        refreshToken: newRefreshToken || refreshToken,
      });

      this.processQueue(null, accessToken);
      return accessToken;

    } catch (error: unknown) {
      if (__DEV__) {
        const axiosError = error as { response?: { status?: number; data?: unknown }; message?: string };
        console.error('❌ Token refresh failed:', error);
        console.error('Error details:', {
          status: axiosError?.response?.status,
          data: axiosError?.response?.data,
          message: axiosError?.message,
        });
      }

      const axiosError = error as { response?: { status?: number }; name?: string };
      const status = axiosError?.response?.status;
      const isAborted = axiosError?.name === 'AbortError' || axiosError?.name === 'CanceledError';

      if (status === 401 || status === 403) {
        if (__DEV__) {
          console.error('🚨 Auth error during refresh - clearing tokens and logging out');
        }
        await TokenStore.clearTokens();
        this.notifyAuthFailure();
      }

      const errorToReject = isAborted 
        ? new Error('Token refresh request timed out')
        : error instanceof Error ? error : new Error('Token refresh failed');

      this.processQueue(errorToReject, null);
      throw errorToReject;

    } finally {
      networkRequestGuard.unregisterRequest(requestId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  async waitForRefresh(): Promise<string> {
    if (this.state.refreshPromise) {
      return this.state.refreshPromise;
    }

    return new Promise<string>((resolve, reject) => {
      this.queue.push({
        resolve,
        reject,
        timestamp: Date.now(),
      });

      setTimeout(() => {
        const index = this.queue.findIndex(
          (item) => item.resolve === resolve && item.reject === reject
        );
        if (index !== -1) {
          this.queue.splice(index, 1);
          reject(new Error('Token refresh wait timeout'));
        }
      }, QUEUE_TIMEOUT_MS);
    });
  }

  isRefreshing(): boolean {
    return this.state.isRefreshing;
  }

  reset(): void {
    this.state = {
      isRefreshing: false,
      refreshPromise: null,
      lastRefreshAttempt: 0,
      consecutiveFailures: 0,
    };
    this.queue = [];
  }
}

export default TokenRefreshManager.getInstance();

