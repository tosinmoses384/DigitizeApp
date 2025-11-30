import { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useI18nStore } from '../stores/i18nStore';
import { I18nDevTools } from '../utils/i18nDevTools';
import type { SupportedLocale } from '../types/i18n';

export const useI18n = () => {
  const intl = useIntl();
  const {
    locale,
    messages,
    isRTL,
    isLoading,
    isAuthenticated,
    translationCoverage,
    initializeI18n,
    switchLanguage,
    handleAuthStateChange,
  } = useI18nStore();

  const t = useCallback(
    (key: string, values?: Record<string, any>, fallbackText?: string) => {
      try {
        const message = intl.formatMessage({ id: key }, values);
        
        if (message === key) {
          if (__DEV__) {
            I18nDevTools.logMissingKey(key);
            return `[MISSING: ${key}]`;
          }
          return fallbackText || key.split('.').pop() || 'Text not available';
        }

        return message;
      } catch (error) {
        if (__DEV__) {
          console.error(`❌ Translation error for key "${key}":`, error);
        }
        
        if (__DEV__) {
          return `[ERROR: ${key}]`;
        }
        
        return fallbackText || 'Text not available';
      }
    },
    [intl]
  );

  const changeLanguage = useCallback(
    async (newLocale: SupportedLocale) => {
      await switchLanguage(newLocale);
    },
    [switchLanguage]
  );

  const formatDate = useCallback(
    (date: Date | number, options?: Intl.DateTimeFormatOptions) => {
      return intl.formatDate(date, options);
    },
    [intl]
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      return intl.formatNumber(value, options);
    },
    [intl]
  );

  const formatTime = useCallback(
    (date: Date | number, options?: Intl.DateTimeFormatOptions) => {
      return intl.formatTime(date, options);
    },
    [intl]
  );

  const formatCurrency = useCallback(
    (value: number, currency: string = 'USD') => {
      return intl.formatNumber(value, {
        style: 'currency',
        currency,
      });
    },
    [intl]
  );

  const formatRelativeTime = useCallback(
    (value: number, unit: Intl.RelativeTimeFormatUnit) => {
      return intl.formatRelativeTime(value, unit);
    },
    [intl]
  );

  return useMemo(
    () => ({
      t,
      locale,
      isRTL,
      isLoading,
      isAuthenticated,
      translationCoverage,
      changeLanguage,
      formatDate,
      formatNumber,
      formatTime,
      formatCurrency,
      formatRelativeTime,
      messages,
    }),
    [
      t,
      locale,
      isRTL,
      isLoading,
      isAuthenticated,
      translationCoverage,
      changeLanguage,
      formatDate,
      formatNumber,
      formatTime,
      formatCurrency,
      formatRelativeTime,
      messages,
    ]
  );
};

export default useI18n;

