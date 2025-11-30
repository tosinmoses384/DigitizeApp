import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from "expo-router";
import { InteractionManager } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigationState } from "@react-navigation/native";
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import {
  setToken,
  setProfile,
  setRefetchUserState,
  setProfileLoaderState,
  setShowSocialOnboardingModal,
  setHasCompletedSocialOnboarding
} from '../../redux/slice/profile/profileSlice';
import { resetFeatures } from '../../redux/slice/features/featuresSlice';
import identityServices from '../../services/features/identity-service/loginService';
import SocialAuthService from '../../services/features/social-auth/socialAuthService';
import TokenStore, { TokenPair } from '../../utils/tokenStore';
import authNavigationEvents from '@utils/authNavigationEvents';
// import apiService from '../../services/api';

/**
 * Centralized Authentication Manager
 * Fixes login loop by providing single source of truth for auth state
 */
export const useAuthManager = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current navigation state to prevent unwanted navigation
  const navigationState = useNavigationState(state => state);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const retryCountRef = useRef(0);
  const hasNavigatedRef = useRef(false);
  const isFreshLoginRef = useRef(false);

  const MAX_RETRIES = 2;

  const { token, profile, refetchUserState, hasCompletedSocialOnboarding } = useAppSelector(
    (state) => state?.userProfileSlice
  );

  // Clear authentication data with selective approach
  const clearAuthData = useCallback(async (preserveOnboarding = true) => {
    try {
      // Store onboarding status if preserving
      let hasSeenOnboarding = null;
      if (preserveOnboarding) {
        hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      }

      // Clear all auth-related data (both AsyncStorage and SecureStore)
      await AsyncStorage.multiRemove(['accessToken', 'userProfile']);
      await TokenStore.clearTokens();

      // Sign out from social providers
      try {
        await SocialAuthService.signOutGoogle();
      } catch (error) {
        console.warn('Failed to sign out from social providers:', error);
      }

      // Restore onboarding status if needed
      if (preserveOnboarding && hasSeenOnboarding) {
        await AsyncStorage.setItem('hasSeenOnboarding', hasSeenOnboarding);
      }

      // Clear React Query cache - removes all cached configuration and API data
      queryClient.clear();
      console.log('✅ React Query cache cleared on logout');

      // Clear Redux state
      dispatch(setProfile(null));
      dispatch(setToken(''));
      dispatch(setHasCompletedSocialOnboarding(false));
      dispatch(resetFeatures());
      retryCountRef.current = 0;
      hasNavigatedRef.current = false;
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }, [dispatch, queryClient]);

  // Handle authentication failure with retry logic
  const handleAuthFailure = useCallback(async (error?: any, isInitialCheck = false) => {
    // Don't retry on 401s or during initial auth check
    const shouldRetry = retryCountRef.current < MAX_RETRIES &&
      error?.response?.status !== 401 &&
      !isInitialCheck;

    if (shouldRetry) {
      retryCountRef.current += 1;
      console.log(`Auth retry ${retryCountRef.current}/${MAX_RETRIES}`);

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCountRef.current));
      return false; // Indicate retry
    }

    // Final failure - logout user
    console.log('Auth failure - clearing data and redirecting');
    await clearAuthData();
    setIsCheckingAuth(false);
    router.replace({ pathname: '/Onboarding' } as any);
    return true; // Indicate final failure
  }, [clearAuthData, router]);

  // Fetch user profile with improved error handling and deduplication via React Query
  const fetchUserProfile = useCallback(async (skipLoader = false, isInitialCheck = false) => {
    if (!token) return false;

    try {
      if (!skipLoader) {
        dispatch(setProfileLoaderState(true));
      }

      // Use React Query to fetch and deduplicate requests
      // staleTime: 1000 * 60 * 5 (5 minutes) - prevents re-fetching if data is fresh
      const fetchedProfile = await queryClient.fetchQuery({
        queryKey: ['userProfile', token],
        queryFn: async () => {
          const res = await identityServices.getUserProfile(token);
          if (res?.status === 200 && res?.data) {
            return res.data;
          }
          throw res; // Throw to handle in catch block
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
      });

      const mergedProfile = {
        ...(profile || {}),
        ...fetchedProfile,
        biography: fetchedProfile?.biography ?? profile?.biography,
        countryId: fetchedProfile?.countryId ?? profile?.countryId,
        locationId: fetchedProfile?.locationId ?? profile?.locationId,
        countryName: fetchedProfile?.countryName ?? profile?.countryName,
        locationName: fetchedProfile?.locationName ?? profile?.locationName,
        shouldShowLocation: fetchedProfile?.shouldShowLocation ?? profile?.shouldShowLocation,
        actionRequired: fetchedProfile?.actionRequired ?? profile?.actionRequired,
        // Fix: Preserve profileImageUrl if backend returns empty string
        // Use backend value only if it's a valid non-empty string, otherwise keep existing value
        profileImageUrl: (fetchedProfile?.profileImageUrl &&
          fetchedProfile?.profileImageUrl !== '' &&
          fetchedProfile?.profileImageUrl !== null &&
          fetchedProfile?.profileImageUrl !== undefined)
          ? fetchedProfile?.profileImageUrl
          : (profile?.profileImageUrl || ''),
      };

      dispatch(setProfile(mergedProfile));
      dispatch(setRefetchUserState(false));
      retryCountRef.current = 0;
      setIsCheckingAuth(false);

      if (!hasCompletedSocialOnboarding && mergedProfile.actionRequired !== null && mergedProfile.actionRequired !== undefined) {
        dispatch(setShowSocialOnboardingModal(true));
      }

      return true;

    } catch (error: any) {
      console.error('Error fetching user profile:', error);

      // Handle non-200 responses from the thrown error
      if (error?.responseCode === 401 || error?.responseCode === '401' || error?.response?.status === 401) {
        console.log('401 response - token invalid');
        const finalFailure = await handleAuthFailure(error, isInitialCheck);
        return !finalFailure;
      }

      // For initial check, don't retry - just clear and continue
      if (isInitialCheck) {
        console.log('Initial profile check failed - clearing auth data');
        await clearAuthData();
        setIsCheckingAuth(false);
        return false;
      }

      // For network errors during normal operation, allow retry
      const finalFailure = await handleAuthFailure(error, isInitialCheck);
      return !finalFailure;
    } finally {
      dispatch(setProfileLoaderState(false));
    }
  }, [token, dispatch, handleAuthFailure, clearAuthData, profile, hasCompletedSocialOnboarding, queryClient]);

  const initializeAuth = useCallback(async () => {
    try {
      setIsCheckingAuth(true);

      let storedToken = await TokenStore.getAccessToken();

      if (!storedToken) {
        storedToken = await AsyncStorage.getItem('accessToken');

        if (storedToken) {
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          if (refreshToken) {
            await TokenStore.storeTokens({ accessToken: storedToken, refreshToken });
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
          }
        }
      }

      if (storedToken) {
        isFreshLoginRef.current = false;
        dispatch(setToken(storedToken));
        dispatch(setRefetchUserState(true));
      } else {
        setIsCheckingAuth(false);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setIsCheckingAuth(false);
    } finally {
      setIsInitialized(true);
    }
  }, [dispatch]);

  const saveTokens = useCallback(async (tokens: TokenPair, isFreshLogin = true) => {
    try {
      isFreshLoginRef.current = isFreshLogin;
      await TokenStore.storeTokens(tokens);
      await AsyncStorage.setItem('accessToken', tokens.accessToken);
      dispatch(setToken(tokens.accessToken));
      dispatch(setRefetchUserState(true));
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }, [dispatch]);

  const saveToken = useCallback(async (newToken: string, isFreshLogin = true) => {
    try {
      isFreshLoginRef.current = isFreshLogin;
      await AsyncStorage.setItem('accessToken', newToken);
      dispatch(setToken(newToken));
      dispatch(setRefetchUserState(true));
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }, [dispatch]);

  // Listen for logout events from API service
  useEffect(() => {
    const handleAuthLogout = () => {
      console.log('Auth logout event received from API service');
      clearAuthData();
      router.replace({ pathname: '/Onboarding' } as any);
    };

    // React Native doesn't have window object, so we'll handle logout differently
    // The API service will directly call clearAuthData when tokens fail
    // This event listener pattern is not needed in React Native

    // Store the handler for potential future use
    (global as any).__authLogoutHandler = handleAuthLogout;

    return () => {
      delete (global as any).__authLogoutHandler;
    };
  }, [clearAuthData, router]);

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  useEffect(() => {
    if (isInitialized && refetchUserState && token && !profile) {
      fetchUserProfile(false, true);
    } else if (isInitialized && refetchUserState && token && profile) {
      fetchUserProfile(true, false);
    }
  }, [isInitialized, refetchUserState, token, profile, fetchUserProfile]);

  useEffect(() => {
    if (!isInitialized || !token || !profile || isCheckingAuth || hasNavigatedRef.current) {
      return;
    }

    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
      authTimeoutRef.current = null;
    }

    const performNavigation = async () => {
      if (hasNavigatedRef.current) {
        return;
      }

      const deepLinkJustProcessed = await AsyncStorage.getItem('@digitizeapp_deep_link_just_processed');

      if (deepLinkJustProcessed) {
        await AsyncStorage.removeItem('@digitizeapp_deep_link_just_processed');
        hasNavigatedRef.current = true;
        isFreshLoginRef.current = false;
        return;
      }

      const currentRoute = navigationState?.routes?.[navigationState?.index]?.name;
      const destinationScreens = ['home', 'PostDetails', 'SellerProfile', 'ItemDetails', 'chats'];

      if (currentRoute && destinationScreens.includes(currentRoute)) {
        hasNavigatedRef.current = true;
        // Emit completion if this originated from a fresh login
        if (isFreshLoginRef.current) {
          InteractionManager.runAfterInteractions(() => {
            authNavigationEvents.emitComplete();
          });
        }
        isFreshLoginRef.current = false;
        return;
      }

      const loginScreens = ['Onboarding', 'Login', 'Register', 'SplashScreen', '__root', 'Onboarding'];
      if (!currentRoute || loginScreens.includes(currentRoute)) {
        hasNavigatedRef.current = true;
        router.replace({ pathname: '/(authenticated)/(tabs)/home' } as any);
        if (isFreshLoginRef.current) {
          InteractionManager.runAfterInteractions(() => {
            authNavigationEvents.emitComplete();
          });
        }
        isFreshLoginRef.current = false;
      } else {
        hasNavigatedRef.current = true;
        isFreshLoginRef.current = false;
      }
    };

    const navigationDelay = isFreshLoginRef.current ? 0 : 100;
    authTimeoutRef.current = setTimeout(performNavigation, navigationDelay);

    return () => {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
    };
  }, [isInitialized, token, profile, isCheckingAuth, navigationState, router]);

  return {
    isCheckingAuth,
    isInitialized,
    isAuthenticated: !!token && !!profile,
    token,
    profile,
    saveToken,
    saveTokens,
    clearAuthData,
    fetchUserProfile,
    handleAuthFailure,
  };
};