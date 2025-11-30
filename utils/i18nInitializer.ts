import { Platform } from 'react-native';

export const initializeI18nPolyfills = (): void => {
  try {
    if (typeof Intl === 'undefined' || !Intl.PluralRules) {
      require('@formatjs/intl-pluralrules/polyfill');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        require('@formatjs/intl-pluralrules/locale-data/en');
        require('@formatjs/intl-pluralrules/locale-data/fr');
        require('@formatjs/intl-pluralrules/locale-data/es');
        require('@formatjs/intl-pluralrules/locale-data/ar');
      }
    }

    if (typeof Intl === 'undefined' || !Intl.Locale) {
      require('@formatjs/intl-locale/polyfill');
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to load i18n polyfills:', error);
    }
  }
};

export default initializeI18nPolyfills;

