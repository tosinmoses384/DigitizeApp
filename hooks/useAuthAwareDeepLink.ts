import { useEffect, useCallback, useRef } from 'react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './use-auth';
import { useAppDispatch } from '../redux/store';
import { setSellerId } from '../redux/slice/filters/filterSlice';

// Development mode console logging utility
const isDev = __DEV__;
const devLog = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};
const devError = (...args: any[]) => {
  if (isDev) {
    console.error(...args);
  }
};

interface PendingDeepLink {
  id: string;
  type: 'post' | 'user' | 'item' | 'chat' | 'item-details';
  url: string;
  timestamp: number;
}

// Simplified global state to prevent duplicate processing
let isProcessingDeepLink = false;
let lastProcessedUrl = '';
let lastProcessedTime = 0;
const DUPLICATE_THRESHOLD_MS = 1000; // Prevent same URL within 1 second

const PENDING_DEEP_LINK_KEY = '@digitizeapp_pending_deep_link';
const DEEP_LINK_EXPIRY_HOURS = 24;

/**
 * Custom hook for authentication-aware deep linking
 * 
 * Features:
 * - Listens for incoming deep links
 * - Stores deep links when user is not authenticated
 * - Automatically navigates to stored deep links after login
 * - Handles expiration and cleanup
 */
export const useAuthAwareDeepLink = () => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const dispatch = useAppDispatch();

  const processingRef = useRef(false);
  const lastProcessedUrlRef = useRef<string | null>(null);

  // Save a deep link for later processing
  const savePendingDeepLink = useCallback(async (deepLink: PendingDeepLink) => {
    try {
      await AsyncStorage.setItem(PENDING_DEEP_LINK_KEY, JSON.stringify(deepLink));
      devLog('💾 Saved pending deep link:', deepLink);
    } catch (error) {
      devError('❌ Error saving pending deep link:', error);
    }
  }, []);

  // Get stored deep link
  const getPendingDeepLink = useCallback(async (): Promise<PendingDeepLink | null> => {
    try {
      const stored = await AsyncStorage.getItem(PENDING_DEEP_LINK_KEY);
      if (!stored) return null;

      const deepLink: PendingDeepLink = JSON.parse(stored);
      
      // Check if expired (24 hours)
      const now = Date.now();
      const expiryTime = deepLink.timestamp + (DEEP_LINK_EXPIRY_HOURS * 60 * 60 * 1000);
      
      if (now > expiryTime) {
        devLog('⏰ Pending deep link expired, removing...');
        await AsyncStorage.removeItem(PENDING_DEEP_LINK_KEY);
        return null;
      }

      return deepLink;
    } catch (error) {
      devError('❌ Error getting pending deep link:', error);
      return null;
    }
  }, []);

  // Clear stored deep link
  const clearPendingDeepLink = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(PENDING_DEEP_LINK_KEY);
      devLog('🧹 Cleared pending deep link');
    } catch (error) {
      devError('❌ Error clearing pending deep link:', error);
    }
  }, []);

  // Process a deep link URL and either navigate immediately or store for later
  const handleDeepLink = useCallback(async (url: string) => {
    const now = Date.now();
    
    // Skip Expo development client URLs and other non-app URLs
    if (url.includes('expo-development-client') || 
        url.includes('192.168.') || 
        url.includes('localhost') ||
        url.startsWith('exp+') ||
        url.includes('?url=http')) {
      devLog(`⏭️ Skipping development/non-app URL: ${url}`);
      return;
    }
    
    // Simple duplicate prevention: same URL within threshold time
    if (lastProcessedUrl === url && (now - lastProcessedTime) < DUPLICATE_THRESHOLD_MS) {
      devLog(`⏭️ Skipping duplicate deep link: ${url}`);
      return;
    }
    
    // Prevent concurrent processing globally
    if (isProcessingDeepLink) {
      devLog(`⏳ Deep link processing in progress, skipping: ${url}`);
      return;
    }
    
    isProcessingDeepLink = true;
    lastProcessedUrl = url;
    lastProcessedTime = now;
    
    devLog('🔗 Processing deep link:', url);
    try {
      // Parse the deep link URL
      const parsedUrl = Linking.parse(url);
      devLog('📋 Parsed deep link:', parsedUrl);
      devLog('📋 Raw URL:', url);
      devLog('📋 Hostname:', parsedUrl.hostname);
      devLog('📋 Path:', parsedUrl.path);
      
      if (!parsedUrl.hostname || !parsedUrl.path) {
        devLog('❌ Invalid deep link format - missing hostname or path');
        devLog('❌ Hostname exists:', !!parsedUrl.hostname);
        devLog('❌ Path exists:', !!parsedUrl.path);
        return;
      }

      // Extract type and ID from the path
      const pathSegments = parsedUrl.path.split('/').filter(segment => segment.length > 0);
      devLog('📋 Path segments:', pathSegments);
      devLog('📋 Path segments length:', pathSegments.length);
      
      if (pathSegments.length < 2) {
        devLog('❌ Deep link missing required path segments');
        devLog('❌ Expected at least 2 segments, got:', pathSegments.length);
        return;
      }

      const type = pathSegments[0] as 'post' | 'user' | 'item' | 'chat';
      const id = pathSegments[1];

      devLog(`🎯 Deep link parsed - Type: ${type}, ID: ${id}`);
      devLog(`🎯 ID length: ${id.length}, ID format: ${id}`);

      const deepLink: PendingDeepLink = {
        id,
        type,
        url,
        timestamp: Date.now()
      };

      if (isAuthenticated && !isCheckingAuth) {
        // User is authenticated, navigate immediately
        devLog('✅ User authenticated, navigating immediately');
        await navigateToDeepLink(deepLink);
      } else {
        // User not authenticated, save for later
        devLog('🚫 User not authenticated, saving deep link for after login');
        devLog('🔐 Auth state in hook - isAuthenticated:', isAuthenticated, 'isCheckingAuth:', isCheckingAuth);
        await savePendingDeepLink(deepLink);
        devLog('✅ Deep link saved successfully');
      }
    } catch (error) {
      devError('❌ Error handling deep link:', error);
    } finally {
      // Reset processing flag
      isProcessingDeepLink = false;
    }
  }, [isAuthenticated, isCheckingAuth, savePendingDeepLink]);

  // Get the navigation URL for a deep link type
  const getNavigationUrl = (type: string, id: string): string => {
    switch (type) {
      case 'post':
        return `/PostDetails?postId=${id}`;
      case 'user':
        return '/SellerProfile';
      case 'item':
        return `/ItemDetails/${id}`;
      case 'chat':
        return `/chats/${id}`;
      default:
        return '/home';
    }
  };

  // Navigate to a deep link destination
  const navigateToDeepLink = useCallback(async (deepLink: PendingDeepLink) => {
    devLog('🚀 Navigating to deep link:', deepLink);

    // Set flag to coordinate with auth manager
    await AsyncStorage.setItem('@digitizeapp_deep_link_just_processed', 'true');

    switch (deepLink.type) {
      case 'post':
        router.replace(`/PostDetails?postId=${deepLink.id}` as any);
        break;
      case 'user':
        dispatch(setSellerId(deepLink.id));
        router.replace('/SellerProfile?fromDeepLink=true');
        break;
        case 'item-details':
          router.replace(`/preloved/item-details/${deepLink.id}` as any);
          break;
      case 'item':
        router.replace(`/ItemDetails/${deepLink.id}` as any);
        break;
      case 'chat':
        router.replace(`/chats/${deepLink.id}` as any);
        break;
      default:
        devLog('❌ Unknown deep link type:', deepLink.type);
        router.replace('/home' as any);
        break;
    }

    // Clear the flag after a delay to allow auth manager to check it
    setTimeout(async () => {
      await AsyncStorage.removeItem('@digitizeapp_deep_link_just_processed');
    }, 1000);
  }, [router, dispatch]);

  // Process pending deep links after authentication (simplified singleton pattern)
  const processPendingDeepLink = useCallback(async () => {
    if (!isAuthenticated || isCheckingAuth) return;

    // Simple singleton check to prevent multiple concurrent executions
    if (isProcessingDeepLink) {
      devLog('⏳ Deep link processing already in progress, skipping pending check');
      return;
    }

    isProcessingDeepLink = true;
    devLog('🔍 Checking for pending deep links after authentication...');
    
    try {
      const pendingLink = await getPendingDeepLink();
      if (!pendingLink) {
        devLog('📭 No pending deep links found');
        return;
      }

      devLog('📥 Found pending deep link:', pendingLink);
      
      // Clear the pending deep link IMMEDIATELY to prevent duplicate processing
      await clearPendingDeepLink();
      devLog('🧹 Cleared pending deep link BEFORE navigation');
      
      // Set a flag to prevent auth manager from overriding navigation
      await AsyncStorage.setItem('@digitizeapp_deep_link_just_processed', 'true');
      
      // Navigate to the deep link
      await navigateToDeepLink(pendingLink);
      
      // Clear the flag after a delay to allow normal navigation for future logins
      setTimeout(async () => {
        await AsyncStorage.removeItem('@digitizeapp_deep_link_just_processed');
      }, 2000);
    } catch (error) {
      devError('❌ Error processing pending deep link:', error);
    } finally {
      // Always reset the processing flag
      isProcessingDeepLink = false;
    }
  }, [isAuthenticated, isCheckingAuth, getPendingDeepLink, navigateToDeepLink, clearPendingDeepLink]);

  // Set up deep link listeners
  useEffect(() => {
    devLog('🔧 Setting up deep link listeners...');
    
    // Handle deep links when app is already open
    const handleIncomingLink = (event: { url: string }) => {
      devLog('📱 *** INCOMING DEEP LINK EVENT ***:', event.url);
      console.log('📱 *** INCOMING DEEP LINK EVENT ***:', event.url);
      handleDeepLink(event.url);
    };

    // Handle deep links when app is opened from closed state
    const getInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        devLog('🚀 *** INITIAL URL CHECK ***:', initialUrl);
        console.log('🚀 *** INITIAL URL CHECK ***:', initialUrl);
        if (initialUrl) {
          devLog('🚀 *** PROCESSING INITIAL DEEP LINK ***:', initialUrl);
          console.log('🚀 *** PROCESSING INITIAL DEEP LINK ***:', initialUrl);
          handleDeepLink(initialUrl);
        } else {
          devLog('📭 No initial URL found');
          console.log('📭 No initial URL found');
        }
      } catch (error) {
        devError('❌ Error getting initial URL:', error);
        console.error('❌ Error getting initial URL:', error);
      }
    };

    // Set up listeners
    devLog('🔗 Adding URL event listener...');
    console.log('🔗 Adding URL event listener...');
    const subscription = Linking.addEventListener('url', handleIncomingLink);
    getInitialURL();

    return () => {
      devLog('🧹 Removing URL event listener...');
      console.log('🧹 Removing URL event listener...');
      subscription?.remove();
    };
  }, [handleDeepLink]);

  // Process pending deep links when authentication state changes
  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      processPendingDeepLink();
    }
  }, [isAuthenticated, isCheckingAuth, processPendingDeepLink]);

  return {
    handleDeepLink,
    savePendingDeepLink,
    getPendingDeepLink,
    clearPendingDeepLink,
    processPendingDeepLink
  };
};
