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

  // Handle navigation based on auth state
  useEffect(() => {
    const handleNavigation = async () => {
      // Wait for auth manager to initialize
      if (!isInitialized) return;

      try {
        if (isAuthenticated && profile) {
          // User is fully authenticated
          await SplashScreen.hideAsync();
          router.replace({ pathname: "/(authenticated)/(tabs)/home" } as any);
        } else if (!isCheckingAuth) {
          // Auth check complete but user not authenticated
          const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
          
          // Add platform-specific delay for better UX
          const delay = Platform.OS === "android" ? 2000 : 1500;
          
          setTimeout(async () => {
            await SplashScreen.hideAsync();
            
            if (hasSeenOnboarding) {
              
              router.replace({ pathname: "/Onboarding" });
            } else {
              
              router.replace({ pathname: "/Onboarding" });
              await AsyncStorage.setItem("hasSeenOnboarding", "true");
            }
          }, delay);
          
          setHasCheckedOnboarding(true);
        }
      } catch (error) {
        console.error("Navigation error:", error);
        await SplashScreen.hideAsync();
        router.replace({ pathname: "/Onboarding" });
      }
    };

    handleNavigation();
  }, [isInitialized, isCheckingAuth, isAuthenticated, profile, router, hasCheckedOnboarding]);

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
