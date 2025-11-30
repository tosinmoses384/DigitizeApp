import { useState, useCallback } from 'react';
import identityServices from '../services/features/identity-service/loginService';
import { ICheckSignInMethodsRequest } from '../services/features/identity-service/models';

interface SignInMethodsData {
  userId: string;
  userExists: boolean;
  signInOptions: string[];
  socialIdentityProviders: string[];
  nextAction: string;
}

interface UseSignInMethodsReturn {
  checkSignInMethods: (emailAddress: string) => Promise<SignInMethodsData | null>;
  isLoading: boolean;
  error: string | null;
  data: SignInMethodsData | null;
}

export const useSignInMethods = (): UseSignInMethodsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SignInMethodsData | null>(null);

  const checkSignInMethods = useCallback(async (emailAddress: string): Promise<SignInMethodsData | null> => {
    if (!emailAddress || !emailAddress.trim()) {
      setError('Email address is required');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const request: ICheckSignInMethodsRequest = {
        emailAddress: emailAddress.trim(),
      };

      const response = await identityServices.checkSignInMethods(request);

      if (response?.responseCode === '0' && response?.data) {
        const methodsData: SignInMethodsData = {
          userId: response.data.userId || '',
          userExists: response.data.userExists || false,
          signInOptions: response.data.signInOptions || [],
          socialIdentityProviders: response.data.socialIdentityProviders || [],
          nextAction: response.data.nextAction || '',
        };

        setData(methodsData);
        return methodsData;
      } else {
        const errorMessage = response?.message || 'Failed to check sign-in methods';
        setError(errorMessage);
        return null;
      }
    } catch (err: unknown) {
      if (__DEV__) {
        console.error('Error checking sign-in methods:', err);
      }

      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Unable to check sign-in methods. Please try again.';

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    checkSignInMethods,
    isLoading,
    error,
    data,
  };
};

