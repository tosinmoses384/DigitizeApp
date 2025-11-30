import { useAuth } from '@hooks/use-auth';
import { useAppInitialization } from '@hooks/use-app-initialization';
import { useNavigationSetup } from '@hooks/use-navigation-setup';
import { useDeepLinking } from '@hooks/use-deep-linking';
import { useColorScheme } from '@hooks/useColorScheme';

export const useLayoutSetup = () => {
  const colorScheme = useColorScheme();
  const { isAppReady, fontsLoaded } = useAppInitialization();
  const { navigation } = useNavigationSetup();
  const { isCheckingAuth, isAuthenticated, token, profile } = useAuth();

  // Handle Stripe URLs or other deep links
  const handleURLCallback = async (url: string): Promise<boolean> => {
    // Add your URL handling logic here
    // Return true if the URL was handled, false otherwise
    try {
      // Example: Check if it's a Stripe URL
      if (url.includes('stripe')) {
        console.log('Stripe URL handled:', url);
        return true;
      }
      
      // Handle other deep links
      console.log('Other URL received:', url);
      return false;
    } catch (error) {
      console.error('Error handling URL:', error);
      return false;
    }
  };

  // Disabled redundant deep link handler to prevent conflicts with useAuthAwareDeepLink
  // const { handleDeepLink } = useDeepLinking(handleURLCallback);

  return {
    // App state
    isAppReady,
    fontsLoaded,
    isCheckingAuth,
    isAuthenticated,
    
    // User data
    token,
    profile,
    
    // Theme
    colorScheme,
    
    // Navigation
    navigation,
    
    // Deep linking - disabled to prevent conflicts
    // handleDeepLink,
  };
};
