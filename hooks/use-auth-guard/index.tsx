import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '../../redux/store';
import { setProfile, setToken } from '../../redux/slice/profile/profileSlice';
import { useToast } from 'react-native-toast-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthErrorResponse {
  responseCode?: string | number;
  status?: number;
  message?: string;
  detail?: string;
}

export interface UseAuthGuardReturn {
  handleAuthError: (response: AuthErrorResponse) => boolean;
  handleApiResponse: <T>(response: T) => T | null;
  withAuthGuard: <T extends any[], R>(
    apiCall: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R>;
}

export const useAuthGuard = (): UseAuthGuardReturn => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();

  const clearAuthState = useCallback(async () => {
    try {
      // Use selective clearing to preserve onboarding status (like auth manager)
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      // Clear only auth-related data
      await AsyncStorage.multiRemove(['accessToken', 'userProfile']);
      
      // Restore onboarding status
      if (hasSeenOnboarding) {
        await AsyncStorage.setItem('hasSeenOnboarding', hasSeenOnboarding);
      }
      
      dispatch(setProfile(null));
      dispatch(setToken(''));
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  }, [dispatch]);

  const handleAuthError = useCallback((response: AuthErrorResponse): boolean => {
    const isAuthError = 
      response?.responseCode === 401 || 
      response?.responseCode === '401' || 
      response?.status === 401;

    if (isAuthError) {
      console.log('Authentication error detected, redirecting to login');
      
      clearAuthState();
      
      // Show user-friendly message
      toast.show('Your session has expired. Please log in again.', {
        type: 'warning',
        duration: 3000,
      });

      // Redirect to login
      router.replace('/Onboarding');
      
      return true;
    }

    return false;
  }, [clearAuthState, router, toast]);

  const handleApiResponse = useCallback(<T,>(response: T): T | null => {
    if (response && typeof response === 'object' && response !== null) {
      const authErrorHandled = handleAuthError(response as AuthErrorResponse);
      if (authErrorHandled) {
        return null; // Auth error was handled, don't proceed with normal flow
      }
    }
    return response;
  }, [handleAuthError]);

  const withAuthGuard = useCallback(<T extends any[], R>(
    apiCall: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        const response = await apiCall(...args);
        const guardedResponse = handleApiResponse(response);
        
        if (guardedResponse === null) {
          // Auth error was handled, throw to prevent further processing
          throw new Error('Authentication failed');
        }
        
        return guardedResponse;
      } catch (error: any) {
        // Check if the error response contains auth error
        if (error?.response) {
          const authErrorHandled = handleAuthError(error.response);
          if (authErrorHandled) {
            throw new Error('Authentication failed');
          }
        }
        
        // Re-throw the original error if it's not an auth error
        throw error;
      }
    };
  }, [handleApiResponse, handleAuthError]);

  return {
    handleAuthError,
    handleApiResponse,
    withAuthGuard,
  };
};

export default useAuthGuard;
