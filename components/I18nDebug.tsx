import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useI18n } from '../hooks/use-i18n';
import { useI18nStore } from '../stores/i18nStore';

export const I18nDebug: React.FC = () => {
  const { locale, messages, isLoading } = useI18nStore();
  const { t } = useI18n();

  const messageKeys = Object.keys(messages);
  const hasSettingsKey = 'settings' in messages;
  const settingsKeys = hasSettingsKey && typeof messages.settings === 'object' 
    ? Object.keys(messages.settings as Record<string, any>) 
    : [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>I18n Debug Info</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Current Locale:</Text>
        <Text style={styles.value}>{locale}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Is Loading:</Text>
        <Text style={styles.value}>{isLoading ? 'Yes' : 'No'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Messages Object Keys Count:</Text>
        <Text style={styles.value}>{messageKeys.length}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Has Settings Key:</Text>
        <Text style={styles.value}>{hasSettingsKey ? 'Yes' : 'No'}</Text>
      </View>

      {hasSettingsKey && (
        <View style={styles.section}>
          <Text style={styles.label}>Settings Keys:</Text>
          <Text style={styles.value}>{settingsKeys.join(', ')}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Test Translation (settings.language):</Text>
        <Text style={styles.value}>{t('settings.language')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Test Translation (settings.selectPreferredLanguage):</Text>
        <Text style={styles.value}>{t('settings.selectPreferredLanguage')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Top Level Keys:</Text>
        <Text style={styles.value}>{messageKeys.join(', ')}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#666',
  },
});

