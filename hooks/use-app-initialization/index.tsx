import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

export const useAppInitialization = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  
  const [loaded] = useFonts({
    DMSansRegular: require('@assets/fonts/DMSans-Regular.ttf'),
    DMSansBold: require('@assets/fonts/DMSans-Bold.ttf'),
    DMSansExtraBold: require('@assets/fonts/DMSans-ExtraBold.ttf'),
    DMSansExtraBoldItalic: require('@assets/fonts/DMSans-ExtraBoldItalic.ttf'),
    DMSansBoldItalic: require('@assets/fonts/DMSans-BoldItalic.ttf'),
    DMSansMedium: require('@assets/fonts/DMSans-Medium.ttf'),
    DMSansSemiBold: require('@assets/fonts/DMSans-SemiBold.ttf'),
    DMSansThin: require('@assets/fonts/DMSans-Thin.ttf'),
    DMSansThinItalic: require('@assets/fonts/DMSans-ThinItalic.ttf'),
    FigtreeBold: require('@assets/fonts/Figtree-Bold.ttf'),
    FigtreeMedium: require('@assets/fonts/Figtree-Medium.ttf'),
    FigtreeRegular: require('@assets/fonts/Figtree-Regular.ttf'),
    FigtreeExtraBold: require('@assets/fonts/Figtree-ExtraBold.ttf'),
    FigtreeSemiBold: require('@assets/fonts/Figtree-SemiBold.ttf'),
  });

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Prevent auto-hiding splash screen
        await SplashScreen.preventAutoHideAsync();
        
        if (loaded) {
          // Additional initialization logic can go here
          setIsAppReady(true);
          
          // Hide splash screen when everything is ready
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
        setIsAppReady(true); // Set ready even on error to prevent infinite loading
        await SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, [loaded]);

  return {
    isAppReady,
    fontsLoaded: loaded,
  };
};
