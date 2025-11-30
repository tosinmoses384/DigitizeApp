import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useI18n } from '../../hooks/use-i18n';
import { useIntl } from 'react-intl';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import SafeText from '../../components/SafeText';
import TranslatedText from '../../components/TranslatedText';

export default function I18nTestScreen() {
  const { 
    t, 
    locale, 
    isRTL, 
    changeLanguage,
    formatDate,
    formatNumber,
    formatCurrency,
    translationCoverage,
  } = useI18n();

  const intl = useIntl();

  const handleQuickSwitch = React.useCallback(async (lang: 'en' | 'fr' | 'es' | 'ar') => {
    await changeLanguage(lang);
  }, [changeLanguage]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌍 i18n Test Screen</Text>
        <Text style={styles.headerSubtitle}>Test all internationalization features</Text>
      </View>

      {/* Current Language Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Current Language</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Locale:</Text>
          <Text style={styles.value}>{locale}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Direction:</Text>
          <Text style={styles.value}>{isRTL ? 'RTL (Right-to-Left) →' : 'LTR (Left-to-Right) ←'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Coverage:</Text>
          <Text style={styles.value}>{translationCoverage.toFixed(0)}%</Text>
        </View>
      </View>

      {/* Test useI18n Hook */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎣 useI18n Hook (t function)</Text>
        <Text style={styles.exampleLabel}>Simple:</Text>
        <Text style={styles.translatedText}>{t('common.welcome')}</Text>
        
        <Text style={styles.exampleLabel}>Nested:</Text>
        <Text style={styles.translatedText}>{t('auth.loginSuccess')}</Text>
        
        <Text style={styles.exampleLabel}>With variables:</Text>
        <Text style={styles.translatedText}>{t('validation.minLength', { min: 8 })}</Text>
        
        <Text style={styles.exampleLabel}>With fallback:</Text>
        <Text style={styles.translatedText}>{t('nonexistent.key', {}, 'Fallback Text')}</Text>
      </View>

      {/* Test React-Intl Direct */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚛️ React-Intl Direct (intl.formatMessage)</Text>
        <Text style={styles.exampleLabel}>Using intl.formatMessage:</Text>
        <Text style={styles.translatedText}>
          {intl.formatMessage({ id: 'common.welcome' })}
        </Text>
        <Text style={styles.translatedText}>
          {intl.formatMessage({ id: 'auth.email' })}
        </Text>
        <Text style={styles.translatedText}>
          {intl.formatMessage({ id: 'validation.required' })}
        </Text>
      </View>

      {/* Test Components */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧩 Translation Components</Text>
        <Text style={styles.exampleLabel}>SafeText (with fallback):</Text>
        <SafeText 
          translationKey="common.welcome" 
          fallbackText="Welcome!"
          style={styles.translatedText}
        />
        
        <Text style={styles.exampleLabel}>TranslatedText (optimized):</Text>
        <TranslatedText 
          translationKey="auth.email"
          style={styles.translatedText}
        />
      </View>

      {/* Test Formatting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Formatting Functions</Text>
        <View style={styles.formatRow}>
          <Text style={styles.formatLabel}>Date:</Text>
          <Text style={styles.formatValue}>
            {formatDate(new Date(), { dateStyle: 'full' })}
          </Text>
        </View>
        <View style={styles.formatRow}>
          <Text style={styles.formatLabel}>Number:</Text>
          <Text style={styles.formatValue}>{formatNumber(1234567.89)}</Text>
        </View>
        <View style={styles.formatRow}>
          <Text style={styles.formatLabel}>Currency:</Text>
          <Text style={styles.formatValue}>{formatCurrency(99.99, 'USD')}</Text>
        </View>
      </View>

      {/* Quick Language Switcher */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Language Switch</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, locale === 'en' && styles.activeButton]} 
            onPress={() => handleQuickSwitch('en')}
          >
            <Text style={styles.buttonEmoji}>🇺🇸</Text>
            <Text style={styles.buttonText}>English</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, locale === 'fr' && styles.activeButton]} 
            onPress={() => handleQuickSwitch('fr')}
          >
            <Text style={styles.buttonEmoji}>🇫🇷</Text>
            <Text style={styles.buttonText}>Français</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, locale === 'es' && styles.activeButton]} 
            onPress={() => handleQuickSwitch('es')}
          >
            <Text style={styles.buttonEmoji}>🇪🇸</Text>
            <Text style={styles.buttonText}>Español</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, locale === 'ar' && styles.activeButton]} 
            onPress={() => handleQuickSwitch('ar')}
          >
            <Text style={styles.buttonEmoji}>🇸🇦</Text>
            <Text style={styles.buttonText}>العربية</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Language Switcher Component */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎛️ Language Switcher Component</Text>
        <LanguageSwitcher 
          onLanguageChange={(newLocale) => {
            if (__DEV__) {
              console.log(`Language changed to: ${newLocale}`);
            }
          }}
        />
      </View>

      {/* Available Keys Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Available Translation Keys</Text>
        <Text style={styles.keyCategory}>Common:</Text>
        <Text style={styles.keyExample}>common.welcome, common.login, common.signup</Text>
        
        <Text style={styles.keyCategory}>Auth:</Text>
        <Text style={styles.keyExample}>auth.email, auth.password, auth.loginSuccess</Text>
        
        <Text style={styles.keyCategory}>Navigation:</Text>
        <Text style={styles.keyExample}>navigation.home, navigation.profile, navigation.settings</Text>
        
        <Text style={styles.note}>
          💡 Check locales/en.json for all 147 available keys!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF3B4A',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212B36',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#637381',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#212B36',
  },
  exampleLabel: {
    fontSize: 12,
    color: '#637381',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
  },
  translatedText: {
    fontSize: 16,
    color: '#212B36',
    marginBottom: 8,
    paddingLeft: 8,
  },
  formatRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  formatLabel: {
    fontSize: 14,
    color: '#637381',
    width: 80,
    fontWeight: '600',
  },
  formatValue: {
    fontSize: 14,
    color: '#212B36',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeButton: {
    backgroundColor: '#FFD8DB',
    borderColor: '#FF3B4A',
  },
  buttonEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    color: '#212B36',
    fontWeight: '600',
    fontSize: 14,
  },
  keyCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212B36',
    marginTop: 8,
  },
  keyExample: {
    fontSize: 12,
    color: '#637381',
    marginBottom: 8,
    paddingLeft: 8,
  },
  note: {
    fontSize: 12,
    color: '#637381',
    fontStyle: 'italic',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F4F6F8',
    borderRadius: 6,
  },
});

