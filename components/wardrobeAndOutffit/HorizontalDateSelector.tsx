import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { useI18n } from '@hooks/use-i18n';

interface HorizontalDateSelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onCalendarPress: () => void;
  outfitDates?: string[];
}

const HorizontalDateSelector: React.FC<HorizontalDateSelectorProps> = React.memo(({
  selectedDate,
  onDateSelect,
  onCalendarPress,
  outfitDates = [],
}) => {
  const { t } = useI18n();
  const scrollViewRef = useRef<ScrollView>(null);
  const dateLayoutsRef = useRef<{ [key: string]: { x: number; width: number } }>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const hasInitialCentered = useRef(false);

  const monthDates = useMemo(() => {
    const selected = moment(selectedDate);
    const dates: Date[] = [];
    
    const startDate = selected.clone().subtract(7, 'days');
    const endDate = selected.clone().add(23, 'days');
    
    let current = startDate.clone();
    while (current.isSameOrBefore(endDate)) {
      dates.push(current.toDate());
      current.add(1, 'day');
    }
    
    return dates;
  }, [selectedDate]);

  const todayDateString = useMemo(() => moment().format('YYYY-MM-DD'), []);

  const isToday = useCallback((date: Date): boolean => {
    return moment(date).format('YYYY-MM-DD') === todayDateString;
  }, [todayDateString]);

  const isSelected = useCallback((date: Date): boolean => {
    return moment(date).format('YYYY-MM-DD') === moment(selectedDate).format('YYYY-MM-DD');
  }, [selectedDate]);

  const hasOutfit = useCallback((date: Date): boolean => {
    const dateString = moment(date).format('YYYY-MM-DD');
    return outfitDates.includes(dateString);
  }, [outfitDates]);

  const handleDatePress = useCallback((date: Date) => {
    onDateSelect(date);
  }, [onDateSelect]);

  const handleLayout = useCallback((dateString: string, x: number, width: number) => {
    dateLayoutsRef.current[dateString] = { x, width };
  }, []);

  const getVisibleViewportWidth = useCallback(() => {
    const calendarButtonSpace = 48;
    return Math.max(0, containerWidth - calendarButtonSpace);
  }, [containerWidth]);

  const scrollToCenter = useCallback((dateString: string, animated: boolean) => {
    const layout = dateLayoutsRef.current[dateString];
    if (!layout || !scrollViewRef.current || containerWidth <= 0 || contentWidth <= 0) return;

    const viewport = getVisibleViewportWidth();
    const target = layout.x + layout.width / 2 - viewport / 2;
    const maxOffset = Math.max(0, contentWidth - viewport);
    const clamped = Math.max(0, Math.min(target, maxOffset));
    scrollViewRef.current.scrollTo({ x: clamped, animated });
  }, [containerWidth, contentWidth, getVisibleViewportWidth]);

  useEffect(() => {
    const selectedDateString = moment(selectedDate).format('YYYY-MM-DD');
    scrollToCenter(selectedDateString, true);
  }, [selectedDate, scrollToCenter]);

  useEffect(() => {
    if (hasInitialCentered.current) return;
    const selectedDateString = moment(selectedDate).format('YYYY-MM-DD');
    scrollToCenter(selectedDateString, false);
    if (dateLayoutsRef.current[selectedDateString] && containerWidth > 0 && contentWidth > 0) {
      hasInitialCentered.current = true;
    }
  }, [containerWidth, contentWidth, scrollToCenter, selectedDate]);

  const renderDateChip = useCallback((date: Date, index: number) => {
    const isTodayDate = isToday(date);
    const isSelectedDate = isSelected(date);
    const hasOutfitDate = hasOutfit(date);
    const dateString = moment(date).format('YYYY-MM-DD');

    return (
      <Pressable
        key={dateString}
        style={({ pressed }) => [
          styles.dateChip,
          isSelectedDate && styles.selectedDateChip,
          pressed && styles.pressedDateChip,
        ]}
        onPress={() => handleDatePress(date)}
        onLayout={(event) => handleLayout(dateString, event.nativeEvent.layout.x, event.nativeEvent.layout.width)}
        accessibilityRole="button"
        accessibilityLabel={t('common.accessibility.selectDateLabel', { date: moment(date).format('MMMM DD') }, `Select ${moment(date).format('MMMM DD')}`)}
        accessibilityState={{ selected: isSelectedDate }}
      >
        <Text style={[
          styles.dayText,
          isSelectedDate && styles.selectedDayText,
        ]}>
          {isTodayDate ? t('common.todayUpper', undefined, 'TODAY') : moment(date).format('ddd').toUpperCase()}
        </Text>
        <Text style={[
          styles.dateText,
          isSelectedDate && styles.selectedDateText,
        ]}>
          {moment(date)?.format('DD MMM')?.toUpperCase() || ''}
        </Text>
        {hasOutfitDate && (
          <View style={styles.outfitIndicator} />
        )}
      </Pressable>
    );
  }, [isToday, isSelected, hasOutfit, handleDatePress, handleLayout, t]);

  return (
    <View style={styles.container} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={(w) => setContentWidth(w)}
      >
        {monthDates.map((date, index) => renderDateChip(date, index))}
      </ScrollView>
      
      <Pressable
        style={({ pressed }) => [
          styles.calendarButton,
          pressed && styles.pressedCalendarButton,
        ]}
        onPress={onCalendarPress}
        accessibilityRole="button"
        accessibilityLabel={t('common.openCalendar', undefined, 'Open calendar')}
      >
        <Ionicons name="calendar-outline" size={20} color="#FF3B4A" />
      </Pressable>
    </View>
  );
});

HorizontalDateSelector.displayName = 'HorizontalDateSelector';

export default HorizontalDateSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingRight: 8,
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDateChip: {
    backgroundColor: '#FF3B4A',
  },
  pressedDateChip: {
    opacity: 0.7,
  },
  dayText: {
    fontSize: 10,
    fontFamily: 'DMSansSemiBold',
    color: '#071827',
    marginBottom: 2,
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 10,
    fontFamily: 'DMSansRegular',
    color: '#637381',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  outfitIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF3B4A',
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFD8DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  pressedCalendarButton: {
    opacity: 0.7,
  },
});

