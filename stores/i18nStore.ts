import { create } from 'zustand';
import { I18nManager, AppState } from 'react-native';
import { LanguageResolutionService } from '../services/languageResolutionService';
import { I18nFallbackService } from '../utils/i18nFallbackService';
import { TranslationCache } from '../services/translationCache';
import { I18nPerformanceMonitor } from '../utils/i18nPerformanceMonitor';
import type { SupportedLocale, TranslationMessages, I18nState, I18nActions } from '../types/i18n';

type I18nStore = I18nState & I18nActions;

const calculateCoverage = (
  baseTranslations: TranslationMessages,
  targetTranslations: TranslationMessages
): number => {
  let totalKeys = 0;
  let translatedKeys = 0;

  const countKeys = (base: TranslationMessages, target: TranslationMessages) => {
    for (const key in base) {
      if (typeof base[key] === 'object' && base[key] !== null) {
        countKeys(base[key] as TranslationMessages, (target[key] as TranslationMessages) || {});
      } else {
        totalKeys++;
        const targetValue = target[key];
        if (targetValue && typeof targetValue === 'string' && targetValue.trim() !== '') {
          translatedKeys++;
        }
      }
    }
  };

  countKeys(baseTranslations, targetTranslations);
  return totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 0;
};

export const useI18nStore = create<I18nStore>((set, get) => ({
  locale: 'en',
  messages: {},
  isRTL: false,
  isLoading: false,
  isAuthenticated: false,
  translationCoverage: 100,

  setLocale: (locale: SupportedLocale) => {
    const isRTL = LanguageResolutionService.isRTLLanguage(locale);
    set({ locale, isRTL });

    if (isRTL !== I18nManager.isRTL) {
      I18nManager.forceRTL(isRTL);
    }
  },

  loadMessages: async (locale: SupportedLocale) => {
    set({ isLoading: true });
    const endTimer = I18nPerformanceMonitor.startLoadTimer();

    try {
      // In development, bypass translation caches entirely to reflect new keys immediately
      if (__DEV__) {
        I18nPerformanceMonitor.recordCacheMiss();
        const messages = await I18nFallbackService.loadTranslationWithFallback(locale);
        const baseMessages = await I18nFallbackService.loadTranslationWithFallback('en');
        const coverage = calculateCoverage(baseMessages, messages);

        const effectiveMessages = coverage < 70
          ? { ...baseMessages, ...messages }
          : messages;

        if (__DEV__) {
          console.log(`✅ i18nStore (DEV): Loaded fresh messages for ${locale}, keys count:`, Object.keys(effectiveMessages).length);
        }

        set({ 
          messages: effectiveMessages,
          translationCoverage: coverage,
          isLoading: false,
        });
        endTimer();
        return; // Skip cache path entirely in DEV
      }

      const cached = await TranslationCache.get(locale);
      if (cached) {
        I18nPerformanceMonitor.recordCacheHit();
        if (__DEV__) {
          console.log(`✅ i18nStore: Loaded cached messages for ${locale}, keys count:`, Object.keys(cached).length);
        }
        set({ messages: cached, isLoading: false });
        endTimer();
        return;
      }

      I18nPerformanceMonitor.recordCacheMiss();
      const messages = await I18nFallbackService.loadTranslationWithFallback(locale);
      if (__DEV__) {
        console.log(`✅ i18nStore: Loaded fresh messages for ${locale}, keys count:`, Object.keys(messages).length);
        console.log(`✅ i18nStore: Has settings key?`, 'settings' in messages);
      }

      const baseMessages = await I18nFallbackService.loadTranslationWithFallback('en');
      const coverage = calculateCoverage(baseMessages, messages);

      if (coverage < 70) {
        if (__DEV__) {
          console.warn(`⚠️ ${locale} translation coverage is ${coverage.toFixed(2)}%, using English fallback`);
        }
        const fallbackMessages = await I18nFallbackService.loadTranslationWithFallback('en');
        const mergedMessages = { ...fallbackMessages, ...messages };
        await TranslationCache.set(locale, mergedMessages);
        set({ 
          messages: mergedMessages, 
          translationCoverage: coverage,
          isLoading: false 
        });
      } else {
        await TranslationCache.set(locale, messages);
        set({ 
          messages, 
          translationCoverage: coverage,
          isLoading: false 
        });
      }

      endTimer();
    } catch (error) {
      if (__DEV__) {
        console.error(`Failed to load messages for ${locale}:`, error);
      }
      
      try {
        const fallbackMessages = await I18nFallbackService.loadTranslationWithFallback('en');
        set({ 
          messages: fallbackMessages, 
          translationCoverage: 0,
          isLoading: false 
        });
      } catch (fallbackError) {
        set({ 
          messages: {}, 
          translationCoverage: 0,
          isLoading: false 
        });
      }
      
      endTimer();
    }
  },

  initializeI18n: async (isAuthenticated: boolean) => {
    set({ isLoading: true, isAuthenticated });
    
    try {
      const resolvedLanguage = await LanguageResolutionService.resolveLanguage(isAuthenticated);
      const isRTL = LanguageResolutionService.isRTLLanguage(resolvedLanguage);
      set({ locale: resolvedLanguage, isRTL });

      if (isRTL !== I18nManager.isRTL) {
        I18nManager.forceRTL(isRTL);
      }
      
      await get().loadMessages(resolvedLanguage);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to initialize i18n:', error);
      }
      set({ isLoading: false });
    }
  },

  switchLanguage: async (locale: SupportedLocale) => {
    const endTimer = I18nPerformanceMonitor.startSwitchTimer();
    
    try {
      const { isAuthenticated } = get();
      await LanguageResolutionService.storeLanguagePreference(locale, isAuthenticated);
      get().setLocale(locale);
      await get().loadMessages(locale);
      endTimer();
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to switch language:', error);
      }
      endTimer();
    }
  },

  handleAuthStateChange: async (isAuthenticated: boolean) => {
    const currentAuthState = get().isAuthenticated;
    
    if (currentAuthState === isAuthenticated) {
      return;
    }
    
    set({ isAuthenticated });
    
    try {
      const resolvedLanguage = await LanguageResolutionService.resolveLanguage(isAuthenticated);
      const currentLocale = get().locale;

      if (resolvedLanguage !== currentLocale) {
        const isRTL = LanguageResolutionService.isRTLLanguage(resolvedLanguage);
        set({ locale: resolvedLanguage, isRTL });

        if (isRTL !== I18nManager.isRTL) {
          I18nManager.forceRTL(isRTL);
        }
        
        await get().loadMessages(resolvedLanguage);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to handle auth state change:', error);
      }
    }
  },

  preloadLanguage: async (locale: SupportedLocale) => {
    try {
      const messages = await I18nFallbackService.loadTranslationWithFallback(locale);
      await TranslationCache.set(locale, messages);
      
      if (__DEV__) {
        console.log(`✅ Preloaded translations for ${locale}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`Failed to preload ${locale}:`, error);
      }
    }
  },

  clearUnusedTranslations: () => {
    const currentLocale = get().locale;
    TranslationCache.clearMemoryCacheExcept(currentLocale);
  },
}));

let memoryWarningSubscription: { remove: () => void } | null = null;

if (__DEV__) {
  try {
    memoryWarningSubscription = AppState.addEventListener('memoryWarning', () => {
      useI18nStore.getState().clearUnusedTranslations();
    });
  } catch (error) {
    console.warn('Failed to set up memory warning listener:', error);
  }
}

export const cleanupI18nStore = (): void => {
  if (memoryWarningSubscription) {
    memoryWarningSubscription.remove();
    memoryWarningSubscription = null;
  }
};

export default useI18nStore;

