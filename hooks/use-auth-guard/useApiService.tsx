import { useCallback } from 'react';
import { useAuthGuard } from './index';
import { useAppSelector } from '../../redux/store';

export interface ApiServiceConfig {
  showToastOnError?: boolean;
  redirectOnAuthError?: boolean;
}

export const useApiService = (config: ApiServiceConfig = {}) => {
  const { 
    showToastOnError = true, 
    redirectOnAuthError = true 
  } = config;
  
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const { handleAuthError, withAuthGuard } = useAuthGuard();

  /**
   * Wrapper for API calls that automatically handles auth errors
   */
  const callApi = useCallback(async <T,>(
    apiFunction: (token: string) => Promise<T>,
    options: {
      onSuccess?: (data: T) => void;
      onError?: (error: any) => void;
      onAuthError?: () => void;
    } = {}
  ): Promise<T | null> => {
    if (!token) {
      console.warn('No token available for API call');
      if (redirectOnAuthError) {
        handleAuthError({ responseCode: 401 });
      }
      return null;
    }

    try {
      const guardedApiCall = withAuthGuard(apiFunction);
      const result = await guardedApiCall(token);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error: any) {
      console.error('API call failed:', error);
      
      // Check if it's an auth error
      const isAuthError = error?.message === 'Authentication failed' ||
                         error?.response?.status === 401 ||
                         error?.response?.responseCode === 401;
      
      if (isAuthError && options.onAuthError) {
        options.onAuthError();
      } else if (options.onError) {
        options.onError(error);
      }
      
      return null;
    }
  }, [token, withAuthGuard, handleAuthError, redirectOnAuthError]);

  /**
   * Wrapper for API calls with automatic loading state management
   */
  const callApiWithLoading = useCallback(async <T,>(
    apiFunction: (token: string) => Promise<T>,
    setLoading: (loading: boolean) => void,
    options: {
      onSuccess?: (data: T) => void;
      onError?: (error: any) => void;
      onAuthError?: () => void;
    } = {}
  ): Promise<T | null> => {
    setLoading(true);
    
    try {
      const result = await callApi(apiFunction, options);
      return result;
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  return {
    callApi,
    callApiWithLoading,
    token,
  };
};

export default useApiService;
