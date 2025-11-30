import React, { createContext, useContext, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useAuthManager } from '../hooks/use-auth-manager';
import { useDispatch } from 'react-redux';
import { setIsShownLoginModal } from '../redux/slice/profile/profileSlice';
import apiService from '../services/api';
import TokenStore, { TokenPair } from '../utils/tokenStore';
import { getRefreshTime } from '../utils/jwtUtils';
import { useTokenRefresh } from '../hooks/useTokenRefresh';
import axios from 'axios';
import { identifyUser } from '@services/analyticsService';

export interface LoginCredentials {
  emailAddress: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: any;
}

interface AuthContextType {
  // Auth state
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  isInitialized: boolean;
  token: string | null;
  profile: any;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Legacy support
  saveToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authManager = useAuthManager();
  const dispatch = useDispatch();
  const lastIdentifiedRef = useRef<string | null>(null);

  // Login function that handles JWT tokens
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/signin/user`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract tokens from the nested response structure
      const responseData = response.data?.data || response.data;
      const accessToken = responseData?.accessToken || responseData?.access_token;
      const refreshToken = responseData?.refreshToken || responseData?.refresh_token;
      const user = responseData?.user || {};

      if (!accessToken) {
        throw new Error('Invalid response: missing access token');
      }

      // If no refresh token, we'll still proceed but log a warning
      if (!refreshToken) {
        console.warn('No refresh token received from server');
      }

      // Store tokens securely (mark as fresh login for immediate navigation)
      const tokens: TokenPair = {
        accessToken,
        refreshToken: refreshToken || '' // Fallback to empty string if no refresh token
      };
      await authManager.saveTokens(tokens, true);

      // Hide the login modal after successful login
      dispatch(setIsShownLoginModal(false));

      try {
        await identifyUser(credentials.emailAddress);
      } catch { }

      return { accessToken, refreshToken: refreshToken || '', user };
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Login failed. Please check your connection and try again.');
      }
    }
  }, [authManager, dispatch]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Optional: Call logout endpoint to invalidate tokens on server
      try {
        const token = authManager.token;
        if (token) {
          await apiService.post('/identity/v1/account/logout', {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          await apiService.post('/identity/v1/account/logout');
        }
      } catch (error) {
        console.warn('Server logout failed, continuing with local logout:', error);
      }

      // Clear local auth data
      await authManager.clearAuthData();
      try {
        await identifyUser(null);
      } catch { }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local data
      await authManager.clearAuthData();
    }
  }, [authManager]);

  // Refresh user profile
  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      await authManager.fetchUserProfile();
    } catch (error) {
      console.error('Profile refresh error:', error);
      throw error;
    }
  }, [authManager]);

  // Legacy token save function for backward compatibility
  const saveToken = useCallback(async (token: string): Promise<void> => {
    await authManager.saveToken(token);
  }, [authManager]);

  // Use the new token refresh hook
  useTokenRefresh();

  // Identify user by email on app start/return when profile is available
  useEffect(() => {
    const syncIdentity = async () => {
      if (authManager.isAuthenticated && authManager.profile?.emailAddress) {
        const email = String(authManager.profile.emailAddress).toLowerCase().trim();
        if (email && lastIdentifiedRef.current !== email) {
          try {
            await identifyUser(email);
            lastIdentifiedRef.current = email;
          } catch { }
        }
      } else if (!authManager.isAuthenticated && lastIdentifiedRef.current !== null) {
        try {
          await identifyUser(null);
        } catch { }
        lastIdentifiedRef.current = null;
      }
    };
    syncIdentity();
  }, [authManager.isAuthenticated, authManager.profile?.emailAddress]);

  const contextValue: AuthContextType = {
    // Auth state from useAuthManager
    isAuthenticated: authManager.isAuthenticated,
    isCheckingAuth: authManager.isCheckingAuth,
    isInitialized: authManager.isInitialized,
    token: authManager.token,
    profile: authManager.profile,

    // Auth actions
    login,
    logout,
    refreshProfile,
    saveToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for components that require authentication
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isCheckingAuth } = useAuth();

    if (isCheckingAuth) {
      // You can return a loading component here
      return null;
    }

    if (!isAuthenticated) {
      // You can redirect to login or return a login component here
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
};

export default AuthProvider;
