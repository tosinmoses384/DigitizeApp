import { jwtDecode } from 'jwt-decode';

export interface JWTPayload {
  exp: number; // Expiration time (Unix timestamp)
  iat: number; // Issued at time (Unix timestamp)
  sub?: string; // Subject (user ID)
  [key: string]: any; // Additional claims
}

export interface TokenExpirationInfo {
  isExpired: boolean;
  expiresAt: Date;
  timeUntilExpiry: number; // milliseconds
  timeUntilExpiryMinutes: number;
  shouldRefresh: boolean; // true if token expires within refresh threshold
}

/**
 * Decode JWT token and extract payload
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true; // Consider invalid tokens as expired
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp <= currentTime;
};

/**
 * Get detailed token expiration information
 */
export const getTokenExpirationInfo = (
  token: string, 
  refreshThresholdMinutes: number = 5
): TokenExpirationInfo => {
  const payload = decodeJWT(token);
  
  if (!payload || !payload.exp) {
    return {
      isExpired: true,
      expiresAt: new Date(0),
      timeUntilExpiry: 0,
      timeUntilExpiryMinutes: 0,
      shouldRefresh: true
    };
  }
  
  const expiresAt = new Date(payload.exp * 1000);
  const currentTime = Date.now();
  const timeUntilExpiry = expiresAt.getTime() - currentTime;
  const timeUntilExpiryMinutes = Math.floor(timeUntilExpiry / (1000 * 60));
  const isExpired = timeUntilExpiry <= 0;
  const shouldRefresh = timeUntilExpiry <= (refreshThresholdMinutes * 60 * 1000);
  
  return {
    isExpired,
    expiresAt,
    timeUntilExpiry,
    timeUntilExpiryMinutes,
    shouldRefresh
  };
};

/**
 * Get time until token expires in a human-readable format
 */
export const getTimeUntilExpiry = (token: string): string => {
  const info = getTokenExpirationInfo(token);
  
  if (info.isExpired) {
    return 'Expired';
  }
  
  const hours = Math.floor(info.timeUntilExpiryMinutes / 60);
  const minutes = info.timeUntilExpiryMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Check if token should be refreshed based on threshold
 */
export const shouldRefreshToken = (
  token: string, 
  refreshThresholdMinutes: number = 5
): boolean => {
  const info = getTokenExpirationInfo(token, refreshThresholdMinutes);
  return info.shouldRefresh;
};

/**
 * Get the optimal refresh time (when to start refreshing)
 * Returns milliseconds until refresh should start
 */
export const getRefreshTime = (
  token: string, 
  refreshThresholdMinutes: number = 5
): number => {
  const info = getTokenExpirationInfo(token, refreshThresholdMinutes);
  
  if (info.isExpired) {
    return 0; // Refresh immediately
  }
  
  // Return time until we should start refreshing
  return info.timeUntilExpiry - (refreshThresholdMinutes * 60 * 1000);
};
