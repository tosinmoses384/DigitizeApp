import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { Colors } from '../constants/Colors';
import Duotone2 from '../assets/images/svg/duotone2.svg';
import { useI18n } from '@hooks/use-i18n';

interface PlanCalendarModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
  outfitDates?: string[];
}

const PlanCalendarModal: React.FC<PlanCalendarModalProps> = React.memo(({
  isVisible,
  onClose,
  onSelectDate,
  selectedDate,
  outfitDates = [],
}) => {
  const { t } = useI18n();
  // no local month state needed

  const monthsToDisplay = useMemo(() => {
    const months: Date[] = [];
    const startMonth = moment().subtract(1, 'month').toDate();
    
    for (let i = 0; i < 12; i++) {
      months.push(moment(startMonth).add(i, 'month').toDate());
    }
    
    return months;
  }, []);

  const getMonthDays = useCallback((monthDate: Date) => {
    const startOfMonth = moment(monthDate).startOf('month');
    const endOfMonth = moment(monthDate).endOf('month');
    const startDay = startOfMonth.day();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    let current = startOfMonth.clone();
    while (current.isSameOrBefore(endOfMonth)) {
      days.push(current.toDate());
      current.add(1, 'day');
    }
    
    return days;
  }, []);

  const hasOutfit = useCallback((date: Date | null): boolean => {
    if (!date) return false;
    const dateString = moment(date).format('YYYY-MM-DD');
    return outfitDates.includes(dateString);
  }, [outfitDates]);

  const isSelected = useCallback((date: Date | null): boolean => {
    if (!date) return false;
    return moment(date).format('YYYY-MM-DD') === moment(selectedDate).format('YYYY-MM-DD');
  }, [selectedDate]);

  const isToday = useCallback((date: Date | null): boolean => {
    if (!date) return false;
    return moment(date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD');
  }, []);

  const handleDatePress = useCallback((date: Date | null) => {
    if (!date) return;
    onSelectDate(date);
    onClose();
  }, [onSelectDate, onClose]);

  const renderDay = useCallback((day: Date | null, index: number) => {
    if (!day) {
      return <View key={`empty-${index}`} style={styles.emptyDay} />;
    }

    const isTodayDate = isToday(day);
    const isSelectedDate = isSelected(day);
    const hasOutfitDate = hasOutfit(day);

    return (
      <TouchableOpacity
        key={moment(day).format('YYYY-MM-DD')}
        style={[
          styles.day,
          isSelectedDate && styles.selectedDay,
          isTodayDate && styles.todayDay,
        ]}
        onPress={() => handleDatePress(day)}
        accessibilityRole="button"
        accessibilityLabel={t('common.accessibility.selectDateLabel', { date: moment(day).format('MMMM DD') }, `Select ${moment(day).format('MMMM DD')}`)}
        accessibilityState={{ selected: isSelectedDate }}
      >
        <Text
          style={[
            styles.dayText,
            isSelectedDate && styles.selectedDayText,
            isTodayDate && styles.todayDayText,
          ]}
        >
          {day.getDate()}
        </Text>
        {hasOutfitDate && (
          <View style={[
            styles.outfitIndicator,
            isTodayDate && styles.todayOutfitIndicator,
          ]}>
            <Duotone2 width={10} height={10} />
          </View>
        )}
      </TouchableOpacity>
    );
  }, [isToday, isSelected, hasOutfit, handleDatePress, t]);

  const renderMonth = useCallback((monthDate: Date) => {
    const days = getMonthDays(monthDate);
    const monthKey = moment(monthDate).format('YYYY-MM');

    return (
      <View key={monthKey} style={styles.monthContainer}>
        <Text style={styles.monthTitle}>
          {moment(monthDate).format('MMMM YYYY')}
        </Text>
        
        <View style={styles.weekdaysRow}>
          {[
            t('common.weekday.monShort', undefined, 'Mon'),
            t('common.weekday.tueShort', undefined, 'Tue'),
            t('common.weekday.wedShort', undefined, 'Wed'),
            t('common.weekday.thuShort', undefined, 'Thu'),
            t('common.weekday.friShort', undefined, 'Fri'),
            t('common.weekday.satShort', undefined, 'Sat'),
            t('common.weekday.sunShort', undefined, 'Sun'),
          ].map((day) => (
            <Text key={day} style={styles.weekdayText}>
              {day}
            </Text>
          ))}
        </View>
        
        <View style={styles.daysGrid}>
          {days.map((day, index) => renderDay(day, index))}
        </View>
      </View>
    );
  }, [getMonthDays, renderDay, t]);

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedButton,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('common.closeCalendar', undefined, 'Close calendar')}
          >
            <Ionicons name="chevron-back" size={24} color="#071827" />
          </Pressable>
          
          <Text style={styles.headerTitle}>{t('common.selectDate', undefined, 'Select Date')}</Text>
          
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {monthsToDisplay.map((month) => renderMonth(month))}
        </ScrollView>
      </View>
    </Modal>
  );
});

PlanCalendarModal.displayName = 'PlanCalendarModal';

export default PlanCalendarModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  pressedButton: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSansBold',
    color: '#071827',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  monthContainer: {
    marginTop: 24,
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: 'DMSansBold',
    color: '#071827',
    marginBottom: 16,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekdayText: {
    width: '13%',
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'DMSansSemiBold',
    color: '#637381',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  emptyDay: {
    width: '13%',
    height: 50,
  },
  day: {
    width: '13%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#FF3B4A',
  },
  todayDay: {
    backgroundColor: '#FFBEC3',
  },
  dayText: {
    fontSize: 16,
    fontFamily: 'DMSansSemiBold',
    color: '#353535',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  todayDayText: {
    color: '#575757',
  },
  outfitIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#FFD8DB',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayOutfitIndicator: {
    backgroundColor: '#FFFFFF',
  },
});

