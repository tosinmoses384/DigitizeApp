/**
 * Social Authentication Error Handling Utilities
 */

export interface SocialAuthError {
  code: string;
  message: string;
  userFriendlyMessage: string;
}

export const GOOGLE_ERROR_CODES = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_ACCOUNT: 'INVALID_ACCOUNT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const APPLE_ERROR_CODES = {
  ERR_CANCELLED: 'ERR_CANCELLED',
  ERR_FAILED: 'ERR_FAILED',
  ERR_INVALID_RESPONSE: 'ERR_INVALID_RESPONSE',
  ERR_NOT_HANDLED: 'ERR_NOT_HANDLED',
  ERR_UNKNOWN: 'ERR_UNKNOWN',
  ERR_NOT_AVAILABLE: 'ERR_NOT_AVAILABLE',
} as const;

export const BACKEND_ERROR_CODES = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

/**
 * Maps Google Sign-In error codes to user-friendly messages
 */
export const mapGoogleError = (error: any): SocialAuthError => {
  const code = error?.code || GOOGLE_ERROR_CODES.UNKNOWN_ERROR;
  
  switch (code) {
    case GOOGLE_ERROR_CODES.SIGN_IN_CANCELLED:
      return {
        code,
        message: error.message || 'User cancelled Google Sign-In',
        userFriendlyMessage: 'Sign in was cancelled',
      };
    
    case GOOGLE_ERROR_CODES.IN_PROGRESS:
      return {
        code,
        message: error.message || 'Google Sign-In is already in progress',
        userFriendlyMessage: 'Sign in is already in progress',
      };
    
    case GOOGLE_ERROR_CODES.PLAY_SERVICES_NOT_AVAILABLE:
      return {
        code,
        message: error.message || 'Google Play Services not available',
        userFriendlyMessage: 'Google Play Services is required for this feature',
      };
    
    case GOOGLE_ERROR_CODES.NETWORK_ERROR:
      return {
        code,
        message: error.message || 'Network error during Google Sign-In',
        userFriendlyMessage: 'Network error. Please check your connection',
      };
    
    default:
      return {
        code: GOOGLE_ERROR_CODES.UNKNOWN_ERROR,
        message: error.message || 'Unknown Google Sign-In error',
        userFriendlyMessage: 'Failed to sign in with Google. Please try again',
      };
  }
};

/**
 * Maps Apple Sign-In error codes to user-friendly messages
 */
export const mapAppleError = (error: any): SocialAuthError => {
  const code = error?.code || APPLE_ERROR_CODES.ERR_UNKNOWN;
  
  switch (code) {
    case APPLE_ERROR_CODES.ERR_CANCELLED:
      return {
        code,
        message: error.message || 'User cancelled Apple Sign-In',
        userFriendlyMessage: 'Sign in was cancelled',
      };
    
    case APPLE_ERROR_CODES.ERR_NOT_AVAILABLE:
      return {
        code,
        message: error.message || 'Apple Sign-In not available',
        userFriendlyMessage: 'Apple Sign-In is not available on this device',
      };
    
    case APPLE_ERROR_CODES.ERR_FAILED:
      return {
        code,
        message: error.message || 'Apple Sign-In failed',
        userFriendlyMessage: 'Failed to sign in with Apple. Please try again',
      };
    
    case APPLE_ERROR_CODES.ERR_INVALID_RESPONSE:
      return {
        code,
        message: error.message || 'Invalid response from Apple',
        userFriendlyMessage: 'Invalid response from Apple. Please try again',
      };
    
    default:
      return {
        code: APPLE_ERROR_CODES.ERR_UNKNOWN,
        message: error.message || 'Unknown Apple Sign-In error',
        userFriendlyMessage: 'Failed to sign in with Apple. Please try again',
      };
  }
};

/**
 * Maps backend authentication error responses to user-friendly messages
 */
export const mapBackendError = (error: any): SocialAuthError => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const message = data?.message || data?.detail || error?.message;
  
  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      return {
        code: BACKEND_ERROR_CODES.INVALID_TOKEN,
        message: message || 'Invalid authentication data',
        userFriendlyMessage: 'Invalid authentication data. Please try again',
      };
    
    case 401:
      return {
        code: BACKEND_ERROR_CODES.TOKEN_EXPIRED,
        message: message || 'Authentication token expired',
        userFriendlyMessage: 'Session expired. Please sign in again',
      };
    
    case 404:
      return {
        code: BACKEND_ERROR_CODES.USER_NOT_FOUND,
        message: message || 'User not found',
        userFriendlyMessage: 'Account not found. Please check your credentials',
      };
    
    case 409:
      return {
        code: BACKEND_ERROR_CODES.EMAIL_ALREADY_EXISTS,
        message: message || 'Email already exists',
        userFriendlyMessage: 'An account with this email already exists',
      };
    
    case 423:
      return {
        code: BACKEND_ERROR_CODES.ACCOUNT_DISABLED,
        message: message || 'Account is disabled',
        userFriendlyMessage: 'Your account has been disabled. Please contact support',
      };
    
    case 500:
    case 502:
    case 503:
      return {
        code: BACKEND_ERROR_CODES.SERVER_ERROR,
        message: message || 'Server error',
        userFriendlyMessage: 'Server error. Please try again later',
      };
    
    default:
      // Handle network errors
      if (!status && error?.code === 'NETWORK_ERROR') {
        return {
          code: BACKEND_ERROR_CODES.NETWORK_ERROR,
          message: 'Network connection error',
          userFriendlyMessage: 'Network error. Please check your connection',
        };
      }
      
      return {
        code: BACKEND_ERROR_CODES.SERVER_ERROR,
        message: message || 'Unknown authentication error',
        userFriendlyMessage: 'Authentication failed. Please try again',
      };
  }
};

/**
 * General purpose error mapper for social authentication
 */
export const mapSocialAuthError = (error: any, provider: 'google' | 'apple' | 'backend'): SocialAuthError => {
  switch (provider) {
    case 'google':
      return mapGoogleError(error);
    case 'apple':
      return mapAppleError(error);
    case 'backend':
      return mapBackendError(error);
    default:
      return {
        code: 'UNKNOWN_ERROR',
        message: error?.message || 'Unknown error',
        userFriendlyMessage: 'An unexpected error occurred. Please try again',
      };
  }
};

/**
 * Check if an error is a user cancellation (should not show error toast)
 */
export const isUserCancellation = (error: SocialAuthError): boolean => {
  return [
    GOOGLE_ERROR_CODES.SIGN_IN_CANCELLED,
    APPLE_ERROR_CODES.ERR_CANCELLED,
  ].includes(error.code as any);
};

/**
 * Check if an error is recoverable (user can retry)
 */
export const isRecoverableError = (error: SocialAuthError): boolean => {
  const nonRecoverableCodes = [
    GOOGLE_ERROR_CODES.PLAY_SERVICES_NOT_AVAILABLE,
    APPLE_ERROR_CODES.ERR_NOT_AVAILABLE,
    BACKEND_ERROR_CODES.ACCOUNT_DISABLED,
    BACKEND_ERROR_CODES.EMAIL_ALREADY_EXISTS,
  ];
  
  return !nonRecoverableCodes.includes(error.code as any);
};
