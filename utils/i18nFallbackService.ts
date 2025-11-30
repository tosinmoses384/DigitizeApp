import type { SupportedLocale, TranslationMessages } from '../types/i18n';
import enTranslations from '../locales/en.json';
import frTranslations from '../locales/fr.json';
import esTranslations from '../locales/es.json';
import arTranslations from '../locales/ar.json';

const translationMap: Record<SupportedLocale, TranslationMessages> = {
  en: enTranslations,
  fr: frTranslations,
  es: esTranslations,
  ar: arTranslations,
};

export class I18nFallbackService {
  private static fallbackChain: Record<string, SupportedLocale[]> = {
    'es-MX': ['es', 'en'],
    'es-AR': ['es', 'en'],
    'fr-CA': ['fr', 'en'],
    'ar-SA': ['ar', 'en'],
  };

  static getFallbackLocales(locale: string): SupportedLocale[] {
    if (this.fallbackChain[locale]) {
      return this.fallbackChain[locale];
    }

    const baseLocale = locale.split('-')[0];
    const supportedLocales: SupportedLocale[] = ['en', 'fr', 'es', 'ar'];
    
    if (supportedLocales.includes(baseLocale as SupportedLocale)) {
      return [baseLocale as SupportedLocale, 'en'];
    }

    return ['en'];
  }

  static async loadTranslationWithFallback(locale: SupportedLocale): Promise<TranslationMessages> {
    const fallbackLocales = this.getFallbackLocales(locale);
    const localesToTry = [locale, ...fallbackLocales];

    for (const fallbackLocale of localesToTry) {
      try {
        const messages = translationMap[fallbackLocale];
        if (messages) {
          if (__DEV__) {
            console.log(`✅ Loaded translations for: ${fallbackLocale}`);
          }
          return messages;
        }
      } catch (error) {
        if (__DEV__) {
          console.warn(`⚠️ Failed to load translations for ${fallbackLocale}, trying next fallback...`);
        }
      }
    }

    if (__DEV__) {
      console.error('❌ All translation fallbacks failed, using empty translations');
    }
    return {};
  }
}

export default I18nFallbackService;

