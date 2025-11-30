import '../utils/i18nPolyfills';
import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { IntlProvider } from 'react-intl';
import { useI18nStore } from '../stores/i18nStore';
import { I18nErrorBoundary } from '../components/I18nErrorBoundary';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAppSelector } from '../redux/store';
import { flattenMessages } from '../utils/flattenMessages';

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = React.memo(({ children }) => {
  const { locale, messages, isLoading, initializeI18n, handleAuthStateChange } = useI18nStore();
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const isAuthenticated = !!token;
  const isInitializedRef = useRef(false);
  const previousAuthStateRef = useRef(isAuthenticated);

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      initializeI18n(isAuthenticated);
    }
  }, [initializeI18n, isAuthenticated]);

  useEffect(() => {
    if (isInitializedRef.current && previousAuthStateRef.current !== isAuthenticated) {
      previousAuthStateRef.current = isAuthenticated;
      handleAuthStateChange(isAuthenticated);
    }
  }, [isAuthenticated, handleAuthStateChange]);

  const flattenedMessages = useMemo(() => {
    if (Object.keys(messages).length === 0) {
      if (__DEV__) {
        console.log('⚠️ I18nProvider: Messages object is empty');
      }
      return {};
    }
    const flattened = flattenMessages(messages);
    if (__DEV__) {
      console.log('✅ I18nProvider: Flattened messages count:', Object.keys(flattened).length);
      console.log('✅ I18nProvider: Sample keys:', Object.keys(flattened).slice(0, 10));
      console.log('✅ I18nProvider: Has settings.selectPreferredLanguage?', 'settings.selectPreferredLanguage' in flattened);
    }
    return flattened;
  }, [messages]);

  // Show loading screen if we don't have any messages yet
  if (Object.keys(messages).length === 0) {
    if (__DEV__) {
      console.log('⚠️ I18nProvider: Waiting for messages to load...');
    }
    return <LoadingScreen message="Loading language..." />;
  }

  // Show loading screen if we're still loading and don't have flattened messages
  if (isLoading && Object.keys(flattenedMessages).length === 0) {
    return <LoadingScreen message="Loading language..." />;
  }

  return (
    <I18nErrorBoundary>
      <IntlProvider 
        locale={locale} 
        messages={flattenedMessages}
        defaultLocale="en"
        onError={(error) => {
          if (__DEV__) {
            console.warn('IntlProvider error:', error);
          }
        }}
      >
        {children}
      </IntlProvider>
    </I18nErrorBoundary>
  );
});

I18nProvider.displayName = 'I18nProvider';

export default I18nProvider;

