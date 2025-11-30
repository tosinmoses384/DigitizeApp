import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import Animated, {
  configureReanimatedLogger,
} from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import data from "../constants/Data";
import Pagination from "../components/Pagination";
import GoogleLogo from "@assets/images/svg/google.svg";
import { Ionicons } from "@expo/vector-icons";
import { useSocialAuth } from "@hooks/use-social-auth";
import ModalAuth from "@components/ModalAuth";
import { useToast } from "react-native-toast-notifications";
import { useI18n } from "@hooks/use-i18n";
import { useFocusEffect } from "@react-navigation/native";
import authNavigationEvents from "@utils/authNavigationEvents";
import { useOnboardingAnimation } from "@hooks/use-onboarding-animation";
import OnboardingSlideItem from "@components/OnboardingSlideItem";

configureReanimatedLogger({
  strict: false,
});

const Onboarding = () => {
  const { t } = useI18n();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const infiniteData = React.useMemo(() => [...data, { ...data[0], id: 'fake-first' }], []);

  const {
    flatListRef,
    x,
    progress,
    currentIndex,
    loopProgress,
    onScroll,
    startLoop,
    stopLoop,
    SCREEN_WIDTH,
  } = useOnboardingAnimation({
    dataLength: data.length,
  });

  const [showModalAuth, setShowModalAuth] = useState(false);
  const { signInWithGoogle, signInWithApple, googleLoading, appleLoading, isAppleAvailable } = useSocialAuth();

  const handleOpenModalAuth = useCallback(() => {
    setShowModalAuth(true);
  }, []);

  const handleCloseModalAuth = useCallback(() => {
    setShowModalAuth(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        authNavigationEvents.emitComplete();
      };
    }, [])
  );

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signInWithGoogle(
        () => { },
        (error) => {
          if (error.includes("Signin profile does not exist")) {
            toast.show(t('auth.accountNotFound'), { type: "warning" });
          } else if (!error.includes("cancelled")) {
            toast.show(error, { type: "danger" });
          }
        }
      );
    } catch (error) {
      if (__DEV__) {
        console.error("Google sign-in error:", error);
      }
    }
  }, [signInWithGoogle, toast, t]);

  const handleAppleSignIn = useCallback(async () => {
    try {
      await signInWithApple(
        () => { },
        (error) => {
          if (error.includes("Signin profile does not exist")) {
            toast.show(t('auth.accountNotFound'), { type: "warning" });
          } else if (!error.includes("cancelled")) {
            toast.show(error, { type: "danger" });
          }
        }
      );
    } catch (error) {
      if (__DEV__) {
        console.error("Apple sign-in error:", error);
      }
    }
  }, [signInWithApple, toast, t]);

  useEffect(() => {
    startLoop();
    return stopLoop;
  }, [startLoop, stopLoop]);

  const renderItem = useCallback(({ item, index }: { item: typeof data[0], index: number }) => {
    return <OnboardingSlideItem item={item} width={SCREEN_WIDTH} index={index} x={x} />;
  }, [SCREEN_WIDTH, x]);

  const getItemLayout = useCallback((_data: ArrayLike<typeof data[0]> | null | undefined, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  }), [SCREEN_WIDTH]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.sliderContainer}>
        <View style={styles.paginationContainer}>
          <Pagination
            data={data}
            progress={progress}
            currentIndex={currentIndex}
            loopProgress={loopProgress}
            activeColor="#FF3B4A"
            inactiveColor="#FFD8DB"
          />
        </View>

        <Animated.FlatList
          ref={flatListRef}
          data={infiniteData}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          getItemLayout={getItemLayout}
          decelerationRate="fast"
          initialNumToRender={3}
          maxToRenderPerBatch={2}
          windowSize={5}
          removeClippedSubviews={false}
        />
      </View>

      <View style={[styles.buttonGroup, { paddingBottom: insets.bottom + 5 }]}>
        <View style={[styles.socialButtonsContainer, !isAppleAvailable && styles.singleSocialContainer]}>
          <TouchableOpacity
            style={[
              styles.socialButton,
              (googleLoading || appleLoading) && styles.socialButtonDisabled,
              !isAppleAvailable && styles.socialButtonSingle
            ]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading || appleLoading}
            accessibilityLabel="Sign in with Google"
            accessibilityRole="button"
          >
            <View style={styles.buttonContent}>
              <GoogleLogo width={18} height={18} />
              {googleLoading && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color="#4285F4" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          {isAppleAvailable && (
            <TouchableOpacity
              style={[
                styles.socialButton,
                (googleLoading || appleLoading) && styles.socialButtonDisabled
              ]}
              onPress={handleAppleSignIn}
              disabled={googleLoading || appleLoading}
              accessibilityLabel="Sign in with Apple"
              accessibilityRole="button"
            >
              <View style={styles.buttonContent}>
                <Ionicons name="logo-apple" size={24} color="#000" />
                {appleLoading && (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color="#000" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>

        {(googleLoading || appleLoading) && (
          <Text style={styles.loadingText}>Signing you in...</Text>
        )}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (googleLoading || appleLoading) && styles.continueButtonDisabled
          ]}
          onPress={handleOpenModalAuth}
          disabled={googleLoading || appleLoading}
          accessibilityLabel="Continue with email"
          accessibilityRole="button"
          accessibilityState={{ disabled: googleLoading || appleLoading }}
        >
          <Text style={styles.continueButtonText}>Continue with Email</Text>
        </TouchableOpacity>
      </View>

      <ModalAuth
        visible={showModalAuth}
        onClose={handleCloseModalAuth}
      />
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sliderContainer: {
    flex: 1,
  },
  paginationContainer: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 20,
    zIndex: 1,
    width: "100%",
  },
  buttonGroup: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    gap: 16,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  singleSocialContainer: {
    justifyContent: "center",
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#07090C",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  socialButtonSingle: {
    flex: 0,
    width: "48%",
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loaderContainer: {
    marginLeft: 4,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "DMSansMedium",
    color: "#464F5D",
    textAlign: "center",
    marginTop: 12,
    opacity: 0.8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#464F5D",
  },
  dividerText: {
    fontSize: 14,
    fontFamily: "DMSansMedium",
    color: "#464F5D",
    lineHeight: 20,
  },
  continueButton: {
    width: "100%",
    backgroundColor: "#FF3B4A",
    borderWidth: 2,
    borderColor: "#FF3B4A",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonDisabled: {
    opacity: 0.5,
    backgroundColor: "#FFB3B8",
    borderColor: "#FFB3B8",
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: "DMSansMedium",
    color: "#fff",
    lineHeight: 20,
  },
});
