import { useCallback, useEffect } from 'react';
import { Linking } from 'react-native';

export const useDeepLinking = (handleURLCallback: (url: string) => Promise<boolean>) => {
  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        // Skip Expo development client URLs and other non-app URLs
        if (url.includes('expo-development-client') || 
            url.includes('192.168.') || 
            url.includes('localhost') ||
            url.startsWith('exp+') ||
            url.includes('?url=http')) {
          console.log(`⏭️ Skipping development/non-app URL in use-deep-linking: ${url}`);
          return;
        }

        try {
          const stripeHandled = await handleURLCallback(url);
          if (stripeHandled) {
            console.log('Stripe URL handled successfully');
          } else {
            console.log('Non-Stripe URL received:', url);
            // Handle other deep links here
          }
        } catch (error) {
          console.error('Error handling deep link:', error);
        }
      }
    },
    [handleURLCallback]
  );

  // Disabled to prevent conflicts with useAuthAwareDeepLink
  // useEffect(() => {
  //   const getUrlAsync = async () => {
  //     try {
  //       const initialUrl = await Linking.getInitialURL();
  //       handleDeepLink(initialUrl);
  //     } catch (error) {
  //       console.error('Error getting initial URL:', error);
  //     }
  //   };

  //   getUrlAsync();

  //   const deepLinkListener = Linking.addEventListener('url', (event: { url: string }) => {
  //     handleDeepLink(event.url);
  //   });

  //   return () => deepLinkListener.remove();
  // }, [handleDeepLink]);

  return { handleDeepLink };
};
