import React, { useCallback, useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useI18n } from '../hooks/use-i18n';
import { Colors, primaryBase, primaryLight, white } from '../constants/Colors';
import type { SupportedLocale, LanguageOption } from '../types/i18n';

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
];

interface LanguageSwitcherProps {
  onLanguageChange?: (locale: SupportedLocale) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = React.memo(({ onLanguageChange }) => {
  const { locale, changeLanguage } = useI18n();

  const handleLanguagePress = useCallback(
    async (selectedLocale: SupportedLocale) => {
      if (selectedLocale === locale) {
        return;
      }

      await changeLanguage(selectedLocale);
      onLanguageChange?.(selectedLocale);
    },
    [locale, changeLanguage, onLanguageChange]
  );

  const renderLanguageOption = useCallback(
    (lang: LanguageOption) => {
      const isSelected = locale === lang.code;

      return (
        <TouchableOpacity
          key={lang.code}
          style={[styles.languageButton, isSelected && styles.activeLanguage]}
          onPress={() => handleLanguagePress(lang.code)}
          accessibilityLabel={`Select ${lang.name} language`}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          <Text style={styles.flag}>{lang.flag}</Text>
          <View style={styles.languageInfo}>
            <Text style={[styles.languageName, isSelected && styles.activeText]}>
              {lang.nativeName}
            </Text>
            <Text style={[styles.languageNameEn, isSelected && styles.activeTextSecondary]}>
              {lang.name}
            </Text>
          </View>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      );
    },
    [locale, handleLanguagePress]
  );

  const languageOptions = useMemo(
    () => LANGUAGE_OPTIONS.map(renderLanguageOption),
    [renderLanguageOption]
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {languageOptions}
      </ScrollView>
    </View>
  );
});

LanguageSwitcher.displayName = 'LanguageSwitcher';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    backgroundColor: white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeLanguage: {
    backgroundColor: primaryLight,
    borderColor: primaryBase,
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  languageNameEn: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },
  activeText: {
    color: primaryBase,
  },
  activeTextSecondary: {
    color: primaryBase,
    opacity: 0.8,
  },
  checkmark: {
    fontSize: 20,
    color: primaryBase,
    fontWeight: 'bold',
  },
});

export default LanguageSwitcher;

