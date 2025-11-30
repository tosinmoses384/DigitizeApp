import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { 
  isTokenExpired, 
  shouldRefreshToken, 
  getTokenExpirationInfo, 
  TokenExpirationInfo 
} from './jwtUtils';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class TokenStore {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static isSecureStoreAvailable: boolean = false;
  private static SecureStore: any = null;
  private static initialized: boolean = false;

  /**
   * Check if we're in an environment that supports SecureStore
   */
  private static isSecureStoreEnvironment(): boolean {
    try {
      // Check if we're in Expo Go (which doesn't support SecureStore)
      const globalObj = global as any;
      const isExpoGo = typeof globalObj !== 'undefined' && 
                       globalObj.__expo && 
                       globalObj.__expo.modules && 
                       !globalObj.__expo.modules.ExpoSecureStore;

      // Check if we're in a development environment without native modules
      const isDevelopmentWithoutNative = __DEV__ && 
                                         typeof globalObj !== 'undefined' && 
                                         !globalObj.__expo?.modules?.ExpoSecureStore;

      return !isExpoGo && !isDevelopmentWithoutNative;
    } catch (error) {
      // If any error occurs in environment detection, assume no SecureStore
      console.warn('Environment detection failed, assuming no SecureStore:', error);
      return false;
    }
  }

  /**
   * Initialize the TokenStore with environment-aware SecureStore detection
   */
  private static async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // First check if we're in an environment that supports SecureStore
    if (!this.isSecureStoreEnvironment()) {
      console.warn('⚠️ SecureStore not supported in this environment (Expo Go/dev) - using AsyncStorage');
      this.isSecureStoreAvailable = false;
      this.SecureStore = null;
      this.initialized = true;
      return;
    }

    // Try to load SecureStore only in supported environments
    try {
      // Use a safer dynamic import approach
      const SecureStoreModule = await this.safeImportSecureStore();
      
      if (SecureStoreModule && typeof SecureStoreModule.setItemAsync === "function") {
        // Test if SecureStore actually works
        try {
          await SecureStoreModule.setItemAsync('__test__', 'test');
          await SecureStoreModule.deleteItemAsync('__test__');
          this.SecureStore = SecureStoreModule;
          this.isSecureStoreAvailable = true;
          // console.log('🔐 SecureStore available - using secure token storage');
        } catch (testError) {
          // console.warn('⚠️ SecureStore test failed:', testError);
          this.isSecureStoreAvailable = false;
          this.SecureStore = null;
        }
      } else {
        // console.warn('⚠️ SecureStore module not properly loaded');
        this.isSecureStoreAvailable = false;
        this.SecureStore = null;
      }
    } catch (importError) {
      // console.warn('⚠️ SecureStore import failed - using AsyncStorage fallback:', importError);
      this.isSecureStoreAvailable = false;
      this.SecureStore = null;
    }

    this.initialized = true;
  }

  /**
   * Safely import SecureStore with error handling
   */
  private static async safeImportSecureStore(): Promise<any> {
    try {
      // Only attempt import if we detect native modules are available
      const globalObj = global as any;
      if (typeof globalObj !== 'undefined' && globalObj.__expo?.modules?.ExpoSecureStore) {
        return await import('expo-secure-store');
      }
      
      // Fallback dynamic import with timeout
      return await Promise.race([
        import('expo-secure-store'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SecureStore import timeout')), 1000)
        )
      ]);
    } catch (error) {
      console.warn('SecureStore import failed:', error);
      return null;
    }
  }

  /**
   * Dynamically import SecureStore to avoid crashes
   */
  private static async getSecureStore(): Promise<any> {
    await this.initialize();
    return this.SecureStore;
  }

  /**
   * Check if SecureStore is available (requires dev build or production)
   */
  private static async checkSecureStoreAvailability(): Promise<boolean> {
    await this.initialize();
    return this.isSecureStoreAvailable === true;
  }

  /**
   * Store both access and refresh tokens securely
   */
  static async storeTokens(tokens: TokenPair): Promise<void> {
    try {
      const useSecureStore = await this.checkSecureStoreAvailability();
      
      if (useSecureStore) {
        const SecureStore = await this.getSecureStore();
        await Promise.all([
          SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, tokens.accessToken),
          SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, tokens.refreshToken),
        ]);
      } else {
        // Fallback to AsyncStorage for development
        await Promise.all([
          AsyncStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken),
          AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken),
        ]);
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Get the access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const useSecureStore = await this.checkSecureStoreAvailability();
      
      if (useSecureStore) {
        const SecureStore = await this.getSecureStore();
        return await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
      } else {
        return await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get the refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      const useSecureStore = await this.checkSecureStoreAvailability();
      
      if (useSecureStore) {
        const SecureStore = await this.getSecureStore();
        return await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
      } else {
        return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Get both tokens
   */
  static async getTokens(): Promise<TokenPair | null> {
    try {
      const useSecureStore = await this.checkSecureStoreAvailability();
      let accessToken: string | null;
      let refreshToken: string | null;
      
      if (useSecureStore) {
        const SecureStore = await this.getSecureStore();
        [accessToken, refreshToken] = await Promise.all([
          SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY),
          SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY),
        ]);
      } else {
        [accessToken, refreshToken] = await Promise.all([
          AsyncStorage.getItem(this.ACCESS_TOKEN_KEY),
          AsyncStorage.getItem(this.REFRESH_TOKEN_KEY),
        ]);
      }

      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
      return null;
    } catch (error) {
      console.error('Error getting tokens:', error);
      return null;
    }
  }

  /**
   * Update only the access token (after refresh)
   */
  static async updateAccessToken(accessToken: string): Promise<void> {
    try {
      const useSecureStore = await this.checkSecureStoreAvailability();
      
      if (useSecureStore) {
        const SecureStore = await this.getSecureStore();
        await SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, accessToken);
      } else {
        await AsyncStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      }
    } catch (error) {
      console.error('Error updating access token:', error);
      throw new Error('Failed to update access token');
    }
  }

  /**
   * Clear all stored tokens
   */
  static async clearTokens(): Promise<void> {
    try {
      const useSecureStore = await this.checkSecureStoreAvailability();
      
      if (useSecureStore) {
        const SecureStore = await this.getSecureStore();
        await Promise.all([
          SecureStore.deleteItemAsync(this.ACCESS_TOKEN_KEY),
          SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY),
        ]);
      } else {
        await Promise.all([
          AsyncStorage.removeItem(this.ACCESS_TOKEN_KEY),
          AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY),
        ]);
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
      // Don't throw here as we want to continue with logout even if clearing fails
    }
  }

  /**
   * Check if tokens exist
   */
  static async hasTokens(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      return tokens !== null;
    } catch (error) {
      console.error('Error checking for tokens:', error);
      return false;
    }
  }

  /**
   * Check if the current access token is expired
   */
  static async isAccessTokenExpired(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return true;
      }
      return isTokenExpired(accessToken);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Check if the access token should be refreshed (expires within threshold)
   */
  static async shouldRefreshAccessToken(thresholdMinutes: number = 5): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return false;
      }
      return shouldRefreshToken(accessToken, thresholdMinutes);
    } catch (error) {
      console.error('Error checking if token should refresh:', error);
      return false;
    }
  }

  /**
   * Get detailed token expiration information
   */
  static async getTokenExpirationInfo(thresholdMinutes: number = 5): Promise<TokenExpirationInfo | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return null;
      }
      return getTokenExpirationInfo(accessToken, thresholdMinutes);
    } catch (error) {
      console.error('Error getting token expiration info:', error);
      return null;
    }
  }

  /**
   * Check if we have valid (non-expired) tokens
   */
  static async hasValidTokens(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      if (!tokens) {
        return false;
      }
      
      // Check if access token is expired
      const isExpired = isTokenExpired(tokens.accessToken);
      return !isExpired;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }
}

export default TokenStore;
