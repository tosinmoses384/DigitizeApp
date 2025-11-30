import type { TranslationMessages, TranslationValidationResult } from '../types/i18n';

export class TranslationValidator {
  static validateTranslations(
    baseTranslations: TranslationMessages,
    targetTranslations: TranslationMessages,
    prefix = ''
  ): TranslationValidationResult {
    const result: TranslationValidationResult = {
      isValid: true,
      missingKeys: [],
      extraKeys: [],
      emptyValues: [],
    };

    for (const key in baseTranslations) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof baseTranslations[key] === 'object') {
        const nestedResult = this.validateTranslations(
          baseTranslations[key] as TranslationMessages,
          (targetTranslations[key] as TranslationMessages) || {},
          fullKey
        );
        result.missingKeys.push(...nestedResult.missingKeys);
        result.extraKeys.push(...nestedResult.extraKeys);
        result.emptyValues.push(...nestedResult.emptyValues);
      } else {
        if (!(key in targetTranslations)) {
          result.missingKeys.push(fullKey);
          result.isValid = false;
        } else {
          const value = targetTranslations[key];
          if (typeof value === 'string' && (!value || value.trim() === '')) {
            result.emptyValues.push(fullKey);
            result.isValid = false;
          }
        }
      }
    }

    for (const key in targetTranslations) {
      if (!(key in baseTranslations)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        result.extraKeys.push(fullKey);
      }
    }

    return result;
  }

  static async generateValidationReport(): Promise<void> {
    if (!__DEV__) {
      return;
    }

    try {
      const enTranslations = require('../locales/en.json');
      const frTranslations = require('../locales/fr.json');
      const esTranslations = require('../locales/es.json');
      const arTranslations = require('../locales/ar.json');

      const languages = [
        { code: 'fr', translations: frTranslations },
        { code: 'es', translations: esTranslations },
        { code: 'ar', translations: arTranslations },
      ];

      console.log('🔍 Translation Validation Report\n');

      for (const { code, translations } of languages) {
        try {
          const result = this.validateTranslations(
            enTranslations,
            translations
          );

          console.log(`\n📍 ${code.toUpperCase()} Validation:`);
          console.log(`   Status: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`);
          
          if (result.missingKeys.length > 0) {
            console.log(`   🔴 Missing Keys (${result.missingKeys.length}):`);
            result.missingKeys.slice(0, 5).forEach(key => console.log(`      - ${key}`));
            if (result.missingKeys.length > 5) {
              console.log(`      ... and ${result.missingKeys.length - 5} more`);
            }
          }

          if (result.emptyValues.length > 0) {
            console.log(`   ⚠️  Empty Values (${result.emptyValues.length}):`);
            result.emptyValues.slice(0, 5).forEach(key => console.log(`      - ${key}`));
            if (result.emptyValues.length > 5) {
              console.log(`      ... and ${result.emptyValues.length - 5} more`);
            }
          }

          if (result.extraKeys.length > 0) {
            console.log(`   ℹ️  Extra Keys (${result.extraKeys.length}):`);
            result.extraKeys.slice(0, 5).forEach(key => console.log(`      - ${key}`));
            if (result.extraKeys.length > 5) {
              console.log(`      ... and ${result.extraKeys.length - 5} more`);
            }
          }
        } catch (error) {
          console.error(`❌ Failed to validate ${code}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Failed to generate validation report:', error);
    }
  }
}

export default TranslationValidator;

