/* eslint-disable */
// @ts-nocheck
// Polyfills must use require() for conditional loading
import { Platform } from 'react-native';

try {
  // Polyfill Intl.Locale
  if (typeof Intl === 'undefined' || !Intl.Locale) {
    require('@formatjs/intl-locale/polyfill');
    if (__DEV__) {
      console.log('✅ Loaded Intl.Locale polyfill');
    }
  }

  // Polyfill Intl.PluralRules
  if (typeof Intl === 'undefined' || !Intl.PluralRules) {
    require('@formatjs/intl-pluralrules/polyfill');
    if (__DEV__) {
      console.log('✅ Loaded Intl.PluralRules polyfill');
    }
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      require('@formatjs/intl-pluralrules/locale-data/en');
      require('@formatjs/intl-pluralrules/locale-data/fr');
      require('@formatjs/intl-pluralrules/locale-data/es');
      require('@formatjs/intl-pluralrules/locale-data/ar');
      if (__DEV__) {
        console.log('✅ Loaded PluralRules locale data');
      }
    }
  }

  // Polyfill Intl.NumberFormat
  if (typeof Intl === 'undefined' || !Intl.NumberFormat) {
    require('@formatjs/intl-numberformat/polyfill');
    if (__DEV__) {
      console.log('✅ Loaded Intl.NumberFormat polyfill');
    }
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      require('@formatjs/intl-numberformat/locale-data/en');
      require('@formatjs/intl-numberformat/locale-data/fr');
      require('@formatjs/intl-numberformat/locale-data/es');
      require('@formatjs/intl-numberformat/locale-data/ar');
      if (__DEV__) {
        console.log('✅ Loaded NumberFormat locale data');
      }
    }
  }

  // Polyfill Intl.DateTimeFormat
  if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
    require('@formatjs/intl-datetimeformat/polyfill');
    if (__DEV__) {
      console.log('✅ Loaded Intl.DateTimeFormat polyfill');
    }
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      require('@formatjs/intl-datetimeformat/locale-data/en');
      require('@formatjs/intl-datetimeformat/locale-data/fr');
      require('@formatjs/intl-datetimeformat/locale-data/es');
      require('@formatjs/intl-datetimeformat/locale-data/ar');
      require('@formatjs/intl-datetimeformat/add-golden-tz');
      if (__DEV__) {
        console.log('✅ Loaded DateTimeFormat locale data');
      }
    }
  }

  if (__DEV__) {
    console.log('✅ All i18n polyfills loaded successfully');
  }
} catch (error) {
  if (__DEV__) {
    console.error('❌ Failed to load i18n polyfills:', error);
  }
}

export {};

