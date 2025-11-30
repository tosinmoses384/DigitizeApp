import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '../redux/store';
import { setSellerId } from '../redux/slice/filters/filterSlice';

export const useDeepLinking = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Disabled to prevent conflicts with useAuthAwareDeepLink
  // useEffect(() => {
  //   // Handle deep links when app is already open
  //   const handleDeepLink = (event: { url: string }) => {
  //     handleIncomingURL(event.url);
  //   };

  //   // Handle deep links when app is opened from closed state
  //   const getInitialURL = async () => {
  //     const initialUrl = await Linking.getInitialURL();
  //     if (initialUrl) {
  //       handleIncomingURL(initialUrl);
  //     }
  //   };

  //   // Set up listeners
  //   const subscription = Linking.addEventListener('url', handleDeepLink);
  //   getInitialURL();

  //   return () => {
  //     subscription?.remove();
  //   };
  // }, []);

  const handleIncomingURL = (url: string) => {
    // Skip Expo development client URLs and other non-app URLs
    if (url.includes('expo-development-client') || 
        url.includes('192.168.') || 
        url.includes('localhost') ||
        url.startsWith('exp+') ||
        url.includes('?url=http')) {
      console.log(`⏭️ Skipping development/non-app URL in useDeepLinking: ${url}`);
      return;
    }

    console.log('🔗 Deep link received:', url);
    
    // Use Expo's built-in URL parsing
    const parsed = Linking.parse(url);
    console.log('📋 Parsed URL:', parsed);
    
    if (!parsed || !parsed.path) {
      console.log('❌ Failed to parse deep link:', url);
      return;
    }

    // Extract path segments
    const segments = parsed.path.split('/').filter(Boolean);
    console.log('📋 Path segments:', segments);

    try {
      // Route based on deep link structure
      if (segments.length === 0) {
        // Root link - go to home
        router.push('/(authenticated)/(tabs)/' as any);
        return;
      }

      const [firstSegment, secondSegment] = segments;

      switch (firstSegment) {
        case 'item':
          if (secondSegment) {
            router.push(`/ItemDetails/${secondSegment}` as any);
          }
          break;

        case 'user':
          if (secondSegment) {
            console.log('🎯 Setting sellerId in Redux:', secondSegment);
            // Set the sellerId in Redux first
            dispatch(setSellerId(secondSegment));
            // Then navigate to SellerProfile screen
            router.push('/SellerProfile' as any);
          }
          break;

        case 'chat':
          if (secondSegment) {
            router.push(`/chats/${secondSegment}` as any);
          }
          break;

        case 'edit-item':
          if (secondSegment) {
            router.push(`/(authenticated)/editProfileItem/${secondSegment}` as any);
          }
          break;

        case 'home':
          router.push('/(authenticated)/(tabs)/' as any);
          break;

        case 'wardrobe':
          router.push('/(authenticated)/(tabs)/wardrobe' as any);
          break;

        case 'add':
          router.push('/(authenticated)/(tabs)/add' as any);
          break;

        case 'profile':
          router.push('/(authenticated)/(tabs)/profile' as any);
          break;

        case 'login':
          router.push('/Login' as any);
          break;

        case 'signup':
          router.push('/Signup' as any);
          break;

        case 'filter':
          router.push('/filterPage' as any);
          break;

        default:
          console.log('Unknown deep link path:', firstSegment);
          // Fallback to home
          router.push('/(authenticated)/(tabs)/' as any);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
      // Fallback to home on error
      router.push('/(authenticated)/(tabs)/' as any);
    }
  };

  return {
    handleIncomingURL,
  };
};
