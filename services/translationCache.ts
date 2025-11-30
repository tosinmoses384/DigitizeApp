import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupportedLocale, TranslationMessages, CacheEntry } from '../types/i18n';

const CACHE_KEY_PREFIX = '@digitizeapp:i18n:';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
// Bump this to invalidate previously cached translation payloads
const CACHE_VERSION = '1.0.1';

export class TranslationCache {
  private static memoryCache = new Map<SupportedLocale, TranslationMessages>();

  static async get(locale: SupportedLocale): Promise<TranslationMessages | null> {
    if (this.memoryCache.has(locale)) {
      if (__DEV__) {
        console.log(`✅ Loaded ${locale} from memory cache`);
      }
      return this.memoryCache.get(locale)!;
    }

    try {
      const cacheKey = this.getCacheKey(locale);
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) {
        return null;
      }

      const cacheEntry: CacheEntry = JSON.parse(cached);

      if (!this.isCacheValid(cacheEntry)) {
        await this.remove(locale);
        return null;
      }

      this.memoryCache.set(locale, cacheEntry.translations);
      if (__DEV__) {
        console.log(`✅ Loaded ${locale} from AsyncStorage cache`);
      }
      
      return cacheEntry.translations;
    } catch (error) {
      if (__DEV__) {
        console.error(`Cache retrieval error for ${locale}:`, error);
      }
      return null;
    }
  }

  static async set(locale: SupportedLocale, translations: TranslationMessages): Promise<void> {
    try {
      this.memoryCache.set(locale, translations);

      const cacheEntry: CacheEntry = {
        locale,
        translations,
        timestamp: Date.now(),
        version: CACHE_VERSION, // Version for cache validation
      };

      const cacheKey = this.getCacheKey(locale);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      
      if (__DEV__) {
        console.log(`✅ Cached translations for ${locale}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`Cache storage error for ${locale}:`, error);
      }
    }
  }

  static async remove(locale: SupportedLocale): Promise<void> {
    this.memoryCache.delete(locale);
    const cacheKey = this.getCacheKey(locale);
    await AsyncStorage.removeItem(cacheKey);
  }

  static async clearAll(): Promise<void> {
    this.memoryCache.clear();
    const keys = await AsyncStorage.getAllKeys();
    const i18nKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(i18nKeys);
    
    if (__DEV__) {
      console.log('✅ Cleared all translation caches');
    }
  }

  private static isCacheValid(cacheEntry: CacheEntry): boolean {
    try {
      const currentVersion = CACHE_VERSION; // Version for cache validation
      
      const isExpired = Date.now() - cacheEntry.timestamp > CACHE_DURATION;
      const isVersionMatch = cacheEntry.version === currentVersion;

      return !isExpired && isVersionMatch;
    } catch (error) {
      return false;
    }
  }

  private static getCacheKey(locale: SupportedLocale): string {
    return `${CACHE_KEY_PREFIX}${locale}`;
  }

  static clearMemoryCacheExcept(currentLocale: SupportedLocale): void {
    this.memoryCache.forEach((_, locale) => {
      if (locale !== currentLocale) {
        this.memoryCache.delete(locale);
      }
    });
    
    if (__DEV__) {
      console.log('🧹 Cleared unused translations from memory');
    }
  }
}

export default TranslationCache;

