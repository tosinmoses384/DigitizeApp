import {
  Dimensions,
  Image,
  StyleSheet,
  Platform,
  View,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Assets } from "@constants/Assets";
import { useAppSelector } from "@redux/store";
import { useAuthManager } from "@hooks/use-auth-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
SplashScreen.preventAutoHideAsync();

const Splash = () => {
  const router = useRouter();
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  const {
    isCheckingAuth,
    isInitialized,
    isAuthenticated,
    profile
  } = useAuthManager();

  const { profileLoader } = useAppSelector(
    (state) => state?.userProfileSlice
  );

  // Debug: Track SplashScreen lifecycle
  useEffect(() => {
    if (__DEV__) {
      console.log('[SplashScreen] MOUNTED - SplashScreen component is active');
    }
    return () => {
      if (__DEV__) {
        console.log('[SplashScreen] UNMOUNTED - SplashScreen component destroyed');
      }
    };
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (__DEV__) {
      console.log('[SplashScreen] useEffect triggered');
      console.log('[SplashScreen] isInitialized:', isInitialized);
      console.log('[SplashScreen] isCheckingAuth:', isCheckingAuth);
      console.log('[SplashScreen] isAuthenticated:', isAuthenticated);
      console.log('[SplashScreen] hasCheckedOnboarding:', hasCheckedOnboarding);
    }

    const handleNavigation = async () => {
      // Wait for auth manager to initialize
      if (!isInitialized) {
        if (__DEV__) console.log('[SplashScreen] Not initialized yet, waiting...');
        return;
      }

      try {
        if (isAuthenticated && profile) {
          if (__DEV__) console.log('[SplashScreen] User authenticated, navigating to home');
          // User is fully authenticated - the useAuthAwareDeepLink hook handles pending deep links
          await SplashScreen.hideAsync();

          // Navigate to home - the custom hook will handle any pending deep links
          router.replace({ pathname: "/(authenticated)/(tabs)/home" } as any);
        } else if (!isCheckingAuth) {
          // CRITICAL FIX: Prevent multiple setTimeout calls
          if (hasCheckedOnboarding) {
            if (__DEV__) console.log('[SplashScreen] Already checked onboarding, skipping to prevent duplicate navigation');
            return;
          }

          if (__DEV__) console.log('[SplashScreen] User not authenticated, checking onboarding...');
          // Auth check complete but user not authenticated
          const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");

          // Add platform-specific delay for better UX
          const delay = Platform.OS === "android" ? 2000 : 1500;

          if (__DEV__) console.log(`[SplashScreen] Setting ${delay}ms timeout for Onboarding navigation`);

          // Set flag BEFORE setTimeout to prevent race conditions
          setHasCheckedOnboarding(true);

          setTimeout(async () => {
            if (__DEV__) console.log('[SplashScreen] Timeout complete, navigating to Onboarding');
            await SplashScreen.hideAsync();

            if (hasSeenOnboarding) {
              if (__DEV__) console.log('[SplashScreen] Has seen onboarding, navigating to /Onboarding');
              router.replace({ pathname: "/Onboarding" });
            } else {
              if (__DEV__) console.log('[SplashScreen] First time, navigating to /Onboarding and setting flag');
              router.replace({ pathname: "/Onboarding" });
              await AsyncStorage.setItem("hasSeenOnboarding", "true");
            }
          }, delay);
        }
      } catch (error) {
        console.error("[SplashScreen] Navigation error:", error);
        await SplashScreen.hideAsync();
        router.replace({ pathname: "/Onboarding" });
      }
    };

    handleNavigation();
  }, [isInitialized, isCheckingAuth, isAuthenticated, profile, router]);
  // REMOVED hasCheckedOnboarding from dependencies to prevent infinite loop

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.container}>
        <Image style={styles.images} source={Assets.logo} />
        {(profileLoader || isCheckingAuth) && (
          <View style={styles.loaderView}>
            <View style={styles.loaderCircle}>
              <ActivityIndicator size={"small"} color={"#FF3B4A"} />
            </View>
          </View>
        )}
      </View>
    </>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF3B4A",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  images: {
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
    resizeMode: "contain",
  },
  loaderView: {
    position: "absolute",
    zIndex: 1,
    width: "100%",
    bottom: 70,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderCircle: {
    width: 45,
    height: 45,
    borderRadius: 45,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
