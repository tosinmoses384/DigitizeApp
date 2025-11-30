import { useState, useCallback, useRef, useEffect } from "react";
import { Platform, InteractionManager } from "react-native";
import authNavigationEvents from "@utils/authNavigationEvents";
import SocialAuthService from "@services/features/social-auth/socialAuthService";
import { useAuthManager } from "../use-auth-manager";

export interface SocialAuthResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useSocialAuth = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const { saveToken, saveTokens } = useAuthManager();
  
  const googleLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const appleLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isGoogleAuthInProgressRef = useRef(false);
  const isAppleAuthInProgressRef = useRef(false);

  const clearGoogleLoading = useCallback(() => {
    if (googleLoadingTimeoutRef.current) {
      clearTimeout(googleLoadingTimeoutRef.current);
      googleLoadingTimeoutRef.current = null;
    }
    setLoading(false);
    setGoogleLoading(false);
    isGoogleAuthInProgressRef.current = false;
  }, []);

  const clearAppleLoading = useCallback(() => {
    if (appleLoadingTimeoutRef.current) {
      clearTimeout(appleLoadingTimeoutRef.current);
      appleLoadingTimeoutRef.current = null;
    }
    setLoading(false);
    setAppleLoading(false);
    isAppleAuthInProgressRef.current = false;
  }, []);

  useEffect(() => {
    // Clear loaders only after navigation completes (emitted by auth manager)
    const unsubscribe = authNavigationEvents.subscribeComplete(() => {
      InteractionManager.runAfterInteractions(() => {
        if (isGoogleAuthInProgressRef.current) {
          clearGoogleLoading();
        }
        if (isAppleAuthInProgressRef.current) {
          clearAppleLoading();
        }
      });
    });
    return unsubscribe;
  }, [clearGoogleLoading, clearAppleLoading]);

  useEffect(() => {
    return () => {
      if (googleLoadingTimeoutRef.current) {
        clearTimeout(googleLoadingTimeoutRef.current);
      }
      if (appleLoadingTimeoutRef.current) {
        clearTimeout(appleLoadingTimeoutRef.current);
      }
    };
  }, []);

  const signInWithGoogle = async (onSuccess?: (data: any) => void, onError?: (error: string) => void): Promise<SocialAuthResult> => {
    try {
      setLoading(true);
      setGoogleLoading(true);
      isGoogleAuthInProgressRef.current = true;

      googleLoadingTimeoutRef.current = setTimeout(() => {
        clearGoogleLoading();
      }, 15000);

      const googleAuth = await SocialAuthService.signInWithGoogle();

      if (!googleAuth) {
        clearGoogleLoading();
        return { success: false, error: "cancelled" };
      }

      const authData = SocialAuthService.createGoogleAuthRequest(googleAuth);
      const response = await SocialAuthService.authenticateWithBackend(authData);

      if (response && response.accessToken) {
        if (response.refreshToken) {
          await saveTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
        } else {
          await saveToken(response.accessToken);
        }
        onSuccess?.(response);
        return { success: true, data: response };
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error: any) {
      clearGoogleLoading();
      const errorMsg = error.message || '';
      if (errorMsg.includes('Signin profile does not exist')) {
        onError?.('Signin profile does not exist');
      } else if (!errorMsg.includes('cancelled') && !errorMsg.includes('Sign in was cancelled')) {
        onError?.(errorMsg);
      }
      return { success: false, error: errorMsg };
    }
  };

  const signInWithApple = async (onSuccess?: (data: any) => void, onError?: (error: string) => void): Promise<SocialAuthResult> => {
    try {
      setLoading(true);
      setAppleLoading(true);
      isAppleAuthInProgressRef.current = true;

      appleLoadingTimeoutRef.current = setTimeout(() => {
        clearAppleLoading();
      }, 15000);

      if (Platform.OS !== "ios") {
        throw new Error("Apple Sign-In is only available on iOS devices");
      }

      const appleAuth = await SocialAuthService.signInWithApple();

      if (!appleAuth) {
        clearAppleLoading();
        return { success: false, error: "cancelled" };
      }

      const authData = SocialAuthService.createAppleAuthRequest(appleAuth);
      const response = await SocialAuthService.authenticateWithBackend(authData);

      if (response && response.accessToken) {
        if (response.refreshToken) {
          await saveTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
        } else {
          await saveToken(response.accessToken);
        }
        onSuccess?.(response);
        return { success: true, data: response };
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error: any) {
      clearAppleLoading();
      const errorMsg = error.message || '';
      if (errorMsg.includes('Signin profile does not exist')) {
        onError?.('Signin profile does not exist');
      } else if (!errorMsg.includes('cancelled') && !errorMsg.includes('ERR_CANCELLED')) {
        onError?.(errorMsg);
      }
      return { success: false, error: errorMsg };
    }
  };

  const signOutFromSocial = async () => {
    try {
      // Sign out from Google if user was signed in
      const isGoogleSignedIn = await SocialAuthService.isGoogleSignedIn();
      if (isGoogleSignedIn) {
        await SocialAuthService.signOutGoogle();
      }

      // Note: Apple doesn't have a sign-out method as it doesn't maintain sessions
    } catch (error) {
      console.error("Error signing out from social providers:", error);
    }
  };

  return {
    // State
    loading,
    googleLoading,
    appleLoading,
    setAppleLoading,
    setLoading,   
    // Actions
    signInWithGoogle,
    signInWithApple,
    signOutFromSocial,
    setGoogleLoading,
    // Utilities
    isGoogleAvailable: true, // Google is available on both platforms
    isAppleAvailable: Platform.OS === "ios", // Apple only on iOS
  };
};
