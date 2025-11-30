export type SupportedLocale = 'en' | 'fr' | 'es' | 'ar';

export interface TranslationMessages {
  [key: string]: string | TranslationMessages;
}

export interface I18nState {
  locale: SupportedLocale;
  messages: TranslationMessages;
  isRTL: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  translationCoverage: number;
}

export interface I18nActions {
  setLocale: (locale: SupportedLocale) => void;
  loadMessages: (locale: SupportedLocale) => Promise<void>;
  initializeI18n: (isAuthenticated: boolean) => Promise<void>;
  switchLanguage: (locale: SupportedLocale) => Promise<void>;
  handleAuthStateChange: (isAuthenticated: boolean) => Promise<void>;
  preloadLanguage: (locale: SupportedLocale) => Promise<void>;
  clearUnusedTranslations: () => void;
}

export interface CacheEntry {
  locale: SupportedLocale;
  translations: TranslationMessages;
  timestamp: number;
  version: string;
}

export interface TranslationValidationResult {
  isValid: boolean;
  missingKeys: string[];
  extraKeys: string[];
  emptyValues: string[];
}

export interface LanguageOption {
  code: SupportedLocale;
  name: string;
  flag: string;
  nativeName: string;
}

