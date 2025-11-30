import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './use-auth';
import { useAppDispatch } from '../redux/store';
import { setSellerId } from '../redux/slice/filters/filterSlice';
import { 
  getPendingDeepLink, 
  clearPendingDeepLink, 
  PendingDeepLink 
} from '../utils/pendingDeepLink';

/**
 * Hook to handle pending deep links after successful authentication
 * This should be used in components that are rendered after login success
 */
export const usePendingDeepLink = () => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const processPendingDeepLink = async () => {
      // Only process when authentication is complete and user is authenticated
      if (isCheckingAuth || !isAuthenticated) {
        return;
      }

      console.log('🔍 Checking for pending deep links after authentication...');
      console.log('🔐 Auth state - isAuthenticated:', isAuthenticated, 'isCheckingAuth:', isCheckingAuth);
      
      try {
        const pendingLink = await getPendingDeepLink();
        console.log('📥 Retrieved pending deep link:', pendingLink);
        
        if (!pendingLink) {
          console.log('📭 No pending deep links found');
          return;
        }

        console.log('🎯 Processing pending deep link:', pendingLink);
        
        // Clear the pending deep link first
        await clearPendingDeepLink();
        
        // Process the deep link based on type
        await handlePendingDeepLink(pendingLink);
        
      } catch (error) {
        console.error('❌ Error processing pending deep link:', error);
      }
    };

    processPendingDeepLink();
  }, [isAuthenticated, isCheckingAuth, dispatch]);

  const handlePendingDeepLink = async (pendingLink: PendingDeepLink) => {
    console.log(`🚀 Navigating to pending ${pendingLink.type} deep link:`, pendingLink);
    
    switch (pendingLink.type) {
      case 'post':
        // Navigate to post details
        router.replace(`/PostDetails?postId=${pendingLink.id}`);
        break;
        
      case 'user':
        // Set seller ID in Redux and navigate to profile
        dispatch(setSellerId(pendingLink.id));
        router.replace('/SellerProfile');
        break;
        
      case 'item':
        // Navigate to item details (you can implement this when needed)
        router.replace(`/ItemDetails/${pendingLink.id}`);
        break;
        
      case 'chat':
        // Navigate to chat (you can implement this when needed)
        router.replace(`/chats/${pendingLink.id}`);
        break;
        
      default:
        console.warn('⚠️ Unknown pending deep link type:', pendingLink.type);
        // Fallback to home
        router.replace('/(authenticated)/(tabs)/home');
    }
  };
};

/**
 * Hook specifically for login success scenarios
 * Use this in your login success handler or splash screen
 */
export const useLoginSuccessDeepLink = () => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const dispatch = useAppDispatch();

  const processLoginSuccessDeepLink = async () => {
    if (isCheckingAuth || !isAuthenticated) {
      return false; // Not ready yet
    }

    console.log('🔍 Checking for pending deep links after login success...');
    
    try {
      const pendingLink = await getPendingDeepLink();
      
      if (!pendingLink) {
        console.log('📭 No pending deep links found after login');
        return false;
      }

      console.log('🎯 Processing pending deep link:', pendingLink);
      
      // Process the deep link immediately
      switch (pendingLink.type) {
        case 'post':
          console.log('🚀 Navigating to pending post deep link:', pendingLink);
          router.replace(`/PostDetails?postId=${pendingLink.id}` as any);
          break;
          
        case 'user':
          console.log('🚀 Navigating to pending user deep link:', pendingLink);
          dispatch(setSellerId(pendingLink.id));
          router.replace('/SellerProfile');
          break;
          
        case 'item':
          console.log('🚀 Navigating to pending item deep link:', pendingLink);
          router.replace(`/ItemDetails/${pendingLink.id}`);
          break;
          
        case 'chat':
          console.log('🚀 Navigating to pending chat deep link:', pendingLink);
          router.replace(`/chats/${pendingLink.id}`);
          break;
          
        default:
          console.warn('⚠️ Unknown login success deep link type:', pendingLink.type);
          break;
      }
      
      // Clear the pending deep link after navigation
      await clearPendingDeepLink();
      console.log('🧹 Cleared pending deep link after navigation');
      
      return true; // Successfully processed deep link
      
    } catch (error) {
      console.error('❌ Error processing login success deep link:', error);
      return false;
    }
  };

  return { processLoginSuccessDeepLink };
};
