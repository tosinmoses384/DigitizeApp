import React, { useEffect } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { ToastProvider } from "react-native-toast-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar, LogBox } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { initAnalytics, setGlobalEventContext, maybeEmitFirstOpenOnVersion, trackEvent } from '@services/analyticsService';
import Constants from 'expo-constants';
import { setupGlobalErrorHandlers } from '@services/errorService';
import { ErrorBoundary } from '@components/ErrorBoundary';
import * as Linking from 'expo-linking';
import { useI18nStore } from '@stores/i18nStore';

import SafeKeyboardProviderComponent from "@components/SafeKeyboardProvider";

import { store } from "@redux/store";
import { useAppInitialization } from "@hooks/use-app-initialization";
import AppTrackingTransparencyWrapper from "@components/AppTrackingTransparencyWrapper";
import { useColorScheme } from "@hooks/useColorScheme";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProviderComponent from "@providers/AuthProvider";
import { I18nProvider } from "@providers/I18nProvider";
import GlobalOfflineProvider from "@providers/GlobalOfflineProvider";

// Components
import { LoadingScreen } from "@components/LoadingScreen";
import { AppNavigationStack } from "@components/AppNavigationStack";

// Ensure WebBrowser auth session completion is available globally
WebBrowser.maybeCompleteAuthSession();

// Suppress expected native module warnings in Expo Go and development builds
if (__DEV__) {
  LogBox.ignoreLogs([
    'vexo-analytics: NativeModules.RNVexo is undefined',
    '[@RNC/AsyncStorage]: NativeModule: AsyncStorage is null',
    'NativeModule: AsyncStorage is null',
    'Vexo Analytics',
  ]);

  // Also suppress console warnings for these specific errors
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('AsyncStorage is null') ||
      message.includes('RNVexo is undefined') ||
      message.includes('vexo-analytics')
    ) {
      return;
    }
    originalWarn(...args);
  };
}

// Inner component that can use Redux hooks
function AppContent() {
  return <AppNavigationStack />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,  // Mobile doesn't need this - saves unnecessary refetches
      refetchOnMount: false,        // Skip refetch on mount if data exists - significant perf win
    },
  },
});

export default function RootLayout() {
  const { isAppReady, fontsLoaded } = useAppInitialization();
  const colorScheme = useColorScheme();
  const locale = useI18nStore((s) => s.locale);
  useEffect(() => {
    setupGlobalErrorHandlers();
    const start = async () => {
      try {
        const apiKey =
          (Constants.expoConfig?.extra as any)?.vexoApiKey ||
          process.env.EXPO_VEXO_API_KEY ||
          '';

        initAnalytics(apiKey);
        await maybeEmitFirstOpenOnVersion();
      } catch (error) {
        if (__DEV__) {
          console.error('Analytics initialization error', error);
        }
      }
    };
    start();
  }, []);

  useEffect(() => {
    setGlobalEventContext({ locale, theme: colorScheme });
  }, [colorScheme, locale]);

  useEffect(() => {
    const handler = (event: { url: string }) => {
      try {
        const url = event?.url || '';
        const path = (() => {
          try { return new URL(url).pathname; } catch { return url; }
        })();
        trackEvent('deep-link-opened', { path });
      } catch { }
    };
    const sub = Linking.addEventListener('url', handler);
    return () => {
      try { (sub as any)?.remove?.(); } catch { }
    };
  }, []);

  // Show loading screen while app is initializing
  if (!isAppReady || !fontsLoaded) {
    return <LoadingScreen message="Initializing app..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <I18nProvider>
          <SafeKeyboardProviderComponent>
            <AppTrackingTransparencyWrapper>
              <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="dark-content"
              />
              <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                  <ToastProvider
                    placement="top"
                    duration={3000}
                    animationType="slide-in"
                    offset={40}
                  >
                    <AuthProviderComponent>
                      <GlobalOfflineProvider>
                        <ErrorBoundary>
                          <AppContent />
                        </ErrorBoundary>
                      </GlobalOfflineProvider>
                    </AuthProviderComponent>
                  </ToastProvider>
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </AppTrackingTransparencyWrapper>
          </SafeKeyboardProviderComponent>
        </I18nProvider>
      </Provider>
    </QueryClientProvider>
  );
}
