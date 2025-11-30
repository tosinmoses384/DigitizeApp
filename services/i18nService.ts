import { LanguageResolutionService } from './languageResolutionService';
import type { SupportedLocale } from '../types/i18n';

export class I18nService {
  static async initializeLanguage(isAuthenticated: boolean): Promise<SupportedLocale> {
    return await LanguageResolutionService.resolveLanguage(isAuthenticated);
  }

  static async changeLanguage(
    newLanguage: SupportedLocale,
    isAuthenticated: boolean
  ): Promise<void> {
    await LanguageResolutionService.storeLanguagePreference(newLanguage, isAuthenticated);
  }

  static getDeviceLanguage(): string {
    return LanguageResolutionService.getDeviceLanguage();
  }

  static getSupportedLanguages(): SupportedLocale[] {
    return LanguageResolutionService.getSupportedLanguages();
  }

  static isRTLLanguage(language: SupportedLocale): boolean {
    return LanguageResolutionService.isRTLLanguage(language);
  }

  static isLanguageSupported(language: string): language is SupportedLocale {
    return LanguageResolutionService.isLanguageSupported(language);
  }
}

export default I18nService;

