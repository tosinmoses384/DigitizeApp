import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';
import type { SupportedLocale } from '../types/i18n';

const SUPPORTED_LANGUAGES: SupportedLocale[] = ['en', 'fr', 'es', 'ar'];
const USER_LANGUAGE_KEY = 'userLanguage';
const DEFAULT_LANGUAGE: SupportedLocale = 'en';

export class LanguageResolutionService {
  static async resolveLanguage(isAuthenticated: boolean): Promise<SupportedLocale> {
    if (isAuthenticated) {
      const userLanguage = await this.getUserLanguagePreference();
      if (userLanguage && this.isLanguageSupported(userLanguage)) {
        return userLanguage;
      }
    }
    
    const deviceLanguage = this.getDeviceLanguage();
    if (this.isLanguageSupported(deviceLanguage)) {
      return deviceLanguage;
    }
    
    return DEFAULT_LANGUAGE;
  }

  static getDeviceLanguage(): string {
    try {
      const locale = Localization.locale || Localization.getLocales()[0]?.languageCode;
      if (!locale) {
        return DEFAULT_LANGUAGE;
      }
      const languageCode = typeof locale === 'string' ? locale.split('-')[0] : locale;
      return languageCode.toLowerCase();
    } catch (error) {
      if (__DEV__) {
        console.error('Error detecting device language:', error);
      }
      return DEFAULT_LANGUAGE;
    }
  }

  static async getUserLanguagePreference(): Promise<SupportedLocale | null> {
    try {
      try {
        const storedSecure = await SecureStore.getItemAsync(USER_LANGUAGE_KEY);
        if (storedSecure) {
          return storedSecure as SupportedLocale;
        }
      } catch (secureStoreError) {
        if (__DEV__) {
          console.warn('⚠️ SecureStore not supported in this environment (Expo Go/dev) - using AsyncStorage');
        }
      }

      const storedAsync = await AsyncStorage.getItem(USER_LANGUAGE_KEY);
      if (storedAsync) {
        try {
          await SecureStore.setItemAsync(USER_LANGUAGE_KEY, storedAsync);
          await AsyncStorage.removeItem(USER_LANGUAGE_KEY);
        } catch (migrateError) {
          // Keep in AsyncStorage if SecureStore unavailable
        }
        return storedAsync as SupportedLocale;
      }

      return null;
    } catch (error) {
      if (__DEV__) {
        console.error('Error retrieving stored language:', error);
      }
      return null;
    }
  }

  static async storeLanguagePreference(
    language: SupportedLocale,
    isAuthenticated: boolean
  ): Promise<void> {
    try {
      try {
        await SecureStore.setItemAsync(USER_LANGUAGE_KEY, language);
      } catch (secureStoreError) {
        await AsyncStorage.setItem(USER_LANGUAGE_KEY, language);
      }
      
      if (isAuthenticated) {
        this.updateUserProfileLanguage(language).catch(error => {
          if (__DEV__) {
            console.warn('Background language sync failed:', error);
          }
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error storing language preference:', error);
      }
      throw error;
    }
  }

  static async updateUserProfileLanguage(language: SupportedLocale): Promise<void> {
    try {
      await apiService.patch('/user/profile', { language });
    } catch (error) {
      if (__DEV__) {
        console.warn('Language preference update failed (endpoint may not exist yet):', error);
      }
    }
  }

  static isLanguageSupported(language: string): language is SupportedLocale {
    return SUPPORTED_LANGUAGES.includes(language as SupportedLocale);
  }

  static getSupportedLanguages(): SupportedLocale[] {
    return [...SUPPORTED_LANGUAGES];
  }

  static async handleAuthStateChange(isAuthenticated: boolean): Promise<SupportedLocale> {
    const resolvedLanguage = await this.resolveLanguage(isAuthenticated);
    return resolvedLanguage;
  }

  static isRTLLanguage(language: SupportedLocale): boolean {
    const rtlLanguages: SupportedLocale[] = ['ar'];
    return rtlLanguages.includes(language);
  }
}

export default LanguageResolutionService;

