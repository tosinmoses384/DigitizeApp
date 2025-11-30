import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import CustomButton from '@components/CustomButton';
import { useI18n } from '@hooks/use-i18n';

interface PlanEmptyStateProps {
  selectedDate: Date;
  onPrimaryPress: () => void;
}

const PlanEmptyState: React.FC<PlanEmptyStateProps> = React.memo(({ selectedDate, onPrimaryPress }) => {
  const { t } = useI18n();
  const isToday = useMemo(() => moment(selectedDate).isSame(moment(), 'day'), [selectedDate]);
  const isPast = useMemo(() => moment(selectedDate).isBefore(moment(), 'day'), [selectedDate]);

  const title = useMemo(() => {
    if (isToday) return t('wardrobe.plan.empty.todayTitle', undefined, 'No outfit planned for Today');
    return t('wardrobe.plan.empty.otherTitle', { date: moment(selectedDate).format('ddd, DD MMM YYYY') }, `No outfit planned for ${moment(selectedDate).format('ddd, DD MMM YYYY')}`);
  }, [selectedDate, isToday, t]);

  const subtitle = useMemo(() => {
    if (isPast) return t('wardrobe.plan.empty.pastSubtitle', undefined, 'This date is past already, but you can plan outfits for later dates.');
    if (isToday) return t('wardrobe.plan.empty.todaySubtitle', undefined, "You don't have an outfit planned for today. Let's help you with that.");
    return t('wardrobe.plan.empty.defaultSubtitle', undefined, 'You can plan an outfit for this day.');
  }, [selectedDate, isToday, isPast, t]);

  const ctaText = useMemo(() => {
    if (isPast) return t('wardrobe.plan.empty.ctaPast', undefined, 'Plan my Outfit for Later');
    return t('wardrobe.plan.empty.ctaDefault', undefined, 'Plan my Outfit');
  }, [isPast, t]);

  return (
    <View style={styles.container}>
      <View style={styles.illustration} accessibilityLabel={t('wardrobe.plan.empty.a11y.noOutfitIllustration', undefined, 'No outfit illustration')} accessibilityRole="image">
        <Ionicons name="shirt-outline" size={40} color="#AEB4B9" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.buttonContainer}>
        <CustomButton title={ctaText} onPress={onPrimaryPress} variant="primary" buttonStyle={styles.button} textStyle={styles.buttonText} />
      </View>
    </View>
  );
});

PlanEmptyState.displayName = 'PlanEmptyState';

export default PlanEmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: 'DMSansBold',
    color: '#071827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#637381',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#FF3B4A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
