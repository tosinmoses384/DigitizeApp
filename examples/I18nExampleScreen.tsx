import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useI18n } from '../hooks/use-i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SafeText from '../components/SafeText';
import TranslatedText from '../components/TranslatedText';
import { Colors, white } from '../constants/Colors';

const I18nExampleScreen: React.FC = () => {
  const { t, locale, isRTL, formatDate, formatNumber, formatCurrency } = useI18n();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Language</Text>
        <Text style={styles.value}>Locale: {locale}</Text>
        <Text style={styles.value}>Direction: {isRTL ? 'RTL' : 'LTR'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Translation</Text>
        <Text style={styles.example}>{t('common.welcome')}</Text>
        <Text style={styles.example}>{t('auth.loginSuccess')}</Text>
        <Text style={styles.example}>{t('navigation.home')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Translation with Values</Text>
        <Text style={styles.example}>
          {t('validation.minLength', { min: 8 })}
        </Text>
        <Text style={styles.example}>
          {t('validation.maxValue', { max: 100 })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SafeText Component</Text>
        <SafeText 
          translationKey="common.welcome" 
          fallbackText="Welcome!"
          style={styles.example}
        />
        <SafeText 
          translationKey="auth.email" 
          style={styles.example}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TranslatedText Component</Text>
        <TranslatedText 
          translationKey="common.loading" 
          style={styles.example}
        />
        <TranslatedText 
          translationKey="validation.required" 
          style={styles.example}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Formatting Examples</Text>
        <Text style={styles.example}>
          Date: {formatDate(new Date(), { dateStyle: 'full' })}
        </Text>
        <Text style={styles.example}>
          Number: {formatNumber(123456.789)}
        </Text>
        <Text style={styles.example}>
          Currency: {formatCurrency(99.99, 'USD')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language Switcher</Text>
        <LanguageSwitcher />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: white,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.light.text,
  },
  value: {
    fontSize: 16,
    color: Colors.light.secondaryText,
    marginBottom: 8,
  },
  example: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 8,
  },
});

export default I18nExampleScreen;

