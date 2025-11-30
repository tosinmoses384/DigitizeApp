import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import StackHeader from '../../components/StackHeader';
import AppTabWrapper from '@components/AppTabWrapper';
import { router } from 'expo-router';
import { getUserConsent, setUserConsent } from '@services/analyticsService';
import { useI18n } from '@hooks/use-i18n';

const AnalyticsConsentScreen: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useI18n();

  useEffect(() => {
    const load = async () => {
      try {
        const c = await getUserConsent();
        setEnabled(c);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onToggle = useCallback(async (value: boolean) => {
    setEnabled(value);
    try {
      await setUserConsent(value);
    } catch {}
  }, []);

  return (
    <AppTabWrapper>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
        <View style={styles.headerContainer}>
          <StackHeader title={t('settings.analyticsAndPrivacy')} onPress={() => router.back()} />
        </View>
        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{t('settings.allowAnalytics')}</Text>
              <Text style={styles.subtitle}>{t('settings.allowAnalyticsDescription')}</Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={onToggle}
              disabled={loading}
              trackColor={{ false: '#cbd5e1', true: Colors.light.primaryBase }}
              thumbColor={'#fff'}
              accessibilityLabel={t('settings.allowAnalytics')}
              accessibilityRole="switch"
            />
          </View>
        </View>
        </View>
      </SafeAreaView>
    </AppTabWrapper>
  );
};

export default AnalyticsConsentScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontFamily: 'DMSansBold',
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'DMSansRegular',
    fontSize: 13,
    color: '#475569',
  },
});


