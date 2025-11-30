import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NewBottomModal from "../components/NewBottomModal";
import DatePickerBottomSheet from "../components/DatePickerBottomSheet";
import { Colors } from "../constants/Colors";
import { fontSz } from "../constants";
import { useI18n } from "@hooks/use-i18n";
import * as Haptics from "expo-haptics";

interface PayoutFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    requestStatus?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  currentFilters?: {
    requestStatus?: string;
    startDate?: string;
    endDate?: string;
  };
  totalCount?: number;
  statusCounts?: {
    all: number;
    pending: number;
    paid: number;
    cancelled: number;
  };
}

interface DatePreset {
  label: string;
  days: number;
  icon: string;
}

const PayoutFilterModal: React.FC<PayoutFilterModalProps> = ({
  isVisible,
  onClose,
  onApplyFilters,
  currentFilters,
  totalCount = 0,
  statusCounts,
}) => {
  const { t } = useI18n();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    currentFilters?.requestStatus
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    currentFilters?.startDate ? new Date(currentFilters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    currentFilters?.endDate ? new Date(currentFilters.endDate) : undefined
  );
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string>("");
  const [isCustomDateExpanded, setIsCustomDateExpanded] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setSelectedStatus(currentFilters?.requestStatus);
      setStartDate(
        currentFilters?.startDate ? new Date(currentFilters.startDate) : undefined
      );
      setEndDate(
        currentFilters?.endDate ? new Date(currentFilters.endDate) : undefined
      );
      setDateError("");
      setSelectedPreset(null);
    }
  }, [isVisible, currentFilters]);

  const datePresets: DatePreset[] = useMemo(
    () => [
      { label: t('balance.last7Days'), days: 7, icon: "calendar" },
      { label: t('balance.last30Days'), days: 30, icon: "calendar" },
      { label: t('balance.last90Days'), days: 90, icon: "calendar" },
      { label: t('balance.thisYear'), days: -1, icon: "calendar" },
    ],
    [t]
  );

  const statusOptions = useMemo(
    () => [
      { 
        label: t('balance.all'), 
        value: undefined, 
        count: statusCounts?.all 
      },
      { 
        label: t('balance.pending'), 
        value: "0", 
        count: statusCounts?.pending 
      },
      { 
        label: t('balance.paid'), 
        value: "1", 
        count: statusCounts?.paid 
      },
      { 
        label: t('balance.cancelled'), 
        value: "2", 
        count: statusCounts?.cancelled 
      },
    ],
    [statusCounts, t]
  );

  const handleStatusPress = useCallback((value: string | undefined) => {
    setSelectedStatus(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePresetPress = useCallback((preset: DatePreset) => {
    const today = new Date();
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    
    let start: Date;
    
    if (preset.days === -1) {
      start = new Date(today.getFullYear(), 0, 1);
    } else {
      start = new Date(today);
      start.setDate(start.getDate() - preset.days + 1);
      start.setHours(0, 0, 0, 0);
    }
    
    setStartDate(start);
    setEndDate(end);
    setSelectedPreset(preset.label);
    setDateError("");
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setIsCustomDateExpanded(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleStartDatePress = useCallback(() => {
    setShowEndDatePicker(false);
    setShowStartDatePicker(true);
    setSelectedPreset(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleEndDatePress = useCallback(() => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(true);
    setSelectedPreset(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleStartDateSelect = useCallback((date: Date) => {
    const error = validateDates(date, endDate);
    setDateError(error);
    setStartDate(date);
    setSelectedPreset(null);
  }, [endDate, validateDates]);

  const handleEndDateSelect = useCallback((date: Date) => {
    const error = validateDates(startDate, date);
    setDateError(error);
    setEndDate(date);
    setSelectedPreset(null);
  }, [startDate, validateDates]);

  const toggleCustomDateSection = useCallback(() => {
    setIsCustomDateExpanded((prev) => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const validateDates = useCallback((start?: Date, end?: Date): string => {
    if (start && end && start > end) {
      return "Start date must be before end date";
    }
    if (end && end > new Date()) {
      return "End date cannot be in the future";
    }
    return "";
  }, []);


  const formatDate = useCallback((date?: Date, compact = false) => {
    if (!date) return t('balance.selectDate');
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: compact ? undefined : "numeric",
    });
  }, [t]);

  const formatDateForChip = useCallback((start: Date, end: Date) => {
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    const sameYear = startYear === endYear;
    const currentYear = new Date().getFullYear();
    
    if (sameYear && startYear === currentYear) {
      return `${formatDate(start, true)} - ${formatDate(end, true)}`;
    }
    if (sameYear) {
      return `${formatDate(start, true)} - ${formatDate(end, true)} ${endYear}`;
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  }, [formatDate]);

  const formatRelativeDate = useCallback((date: Date) => {
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('balance.today');
    if (diffDays === 1) return t('balance.yesterday');
    if (diffDays < 7) return `${diffDays} ${t('balance.daysAgo')}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${t('balance.weeksAgo')}`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${t('balance.monthsAgo')}`;
    return formatDate(date);
  }, [formatDate, t]);

  const getDayOfWeek = useCallback((date: Date) => {
    return date.toLocaleDateString("en-GB", { weekday: "short" });
  }, []);

  const daysBetween = useMemo(() => {
    if (!startDate || !endDate) return null;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [startDate, endDate]);

  const handleApply = useCallback(() => {
    if (dateError) return;

    const filters: {
      requestStatus?: string;
      startDate?: string;
      endDate?: string;
    } = {};

    if (selectedStatus) {
      filters.requestStatus = selectedStatus;
    }

    if (startDate) {
      filters.startDate = startDate.toISOString().split("T")[0];
    }

    if (endDate) {
      filters.endDate = endDate.toISOString().split("T")[0];
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onApplyFilters(filters);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    onClose();
  }, [selectedStatus, startDate, endDate, onApplyFilters, onClose, dateError]);

  const handleClearFilters = useCallback(() => {
    setSelectedStatus(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setSelectedPreset(null);
    setDateError("");
    setIsCustomDateExpanded(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(selectedStatus || startDate || endDate);
  }, [selectedStatus, startDate, endDate]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedStatus) count++;
    if (startDate || endDate) count++;
    return count;
  }, [selectedStatus, startDate, endDate]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; onRemove: () => void }> = [];
    
    if (selectedStatus) {
      const statusLabel = statusOptions.find(opt => opt.value === selectedStatus)?.label || t('balance.status');
      chips.push({
        label: statusLabel,
        onRemove: () => setSelectedStatus(undefined),
      });
    }
    
    if (startDate && endDate) {
      const daysCount = daysBetween ? ` (${daysBetween}d)` : "";
      chips.push({
        label: `${formatDateForChip(startDate, endDate)}${daysCount}`,
        onRemove: () => {
          setStartDate(undefined);
          setEndDate(undefined);
          setSelectedPreset(null);
        },
      });
    } else if (startDate) {
      chips.push({
        label: `${t('balance.from')} ${formatDate(startDate, true)}`,
        onRemove: () => setStartDate(undefined),
      });
    } else if (endDate) {
      chips.push({
        label: `${t('balance.until')} ${formatDate(endDate, true)}`,
        onRemove: () => setEndDate(undefined),
      });
    }
    
    return chips;
  }, [selectedStatus, startDate, endDate, statusOptions, formatDate, daysBetween, t]);

  return (
    <NewBottomModal isShow={isVisible} onClose={onClose} maxHeight={820}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t('balance.filterPayouts')}</Text>
              {totalCount > 0 && (
                <Text style={styles.resultCount}>
                  {totalCount} {totalCount === 1 ? t('balance.transaction') : t('balance.transactions')}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('balance.closeFilterModal')}
            >
              <Ionicons name="close" size={24} color="#5C6F7F" />
            </TouchableOpacity>
          </View>

          {/* Active Filter Chips */}
          {hasActiveFilters && activeFilterChips.length > 0 && (
            <View style={styles.activeFiltersContainer}>
              <Text style={styles.activeFiltersLabel}>{t('balance.activeFilters')}</Text>
              <View style={styles.activeFiltersChips}>
                {activeFilterChips.map((chip, index) => (
                  <View key={index} style={styles.filterChip}>
                    <Text style={styles.filterChipText} numberOfLines={1}>
                      {chip.label}
                    </Text>
                    <TouchableOpacity
                      onPress={chip.onRemove}
                      style={styles.filterChipRemove}
                      accessibilityRole="button"
                      accessibilityLabel={t('balance.removeFilter', { filter: chip.label })}
                    >
                      <Ionicons name="close" size={14} color={Colors.light.primaryBase} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={handleClearFilters}
                  style={styles.clearAllChip}
                  accessibilityRole="button"
                  accessibilityLabel={t('balance.clearAllFilters')}
                >
                  <Ionicons name="refresh" size={14} color={Colors.light.primaryBase} />
                  <Text style={styles.clearAllChipText}>{t('balance.clearAll')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('balance.status')}</Text>
            <View style={styles.statusGrid}>
              {statusOptions.map((option) => {
                const isSelected = selectedStatus === option.value;
                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.statusChip,
                      isSelected && styles.statusChipActive,
                    ]}
                    onPress={() => handleStatusPress(option.value)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by ${option.label}`}
                    accessibilityState={{ selected: isSelected }}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#FFFFFF"
                        style={styles.checkIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.statusChipText,
                        isSelected && styles.statusChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.count !== undefined && option.count > 0 && (
                      <View style={[
                        styles.countBadge,
                        isSelected && styles.countBadgeActive
                      ]}>
                        <Text style={[
                          styles.countBadgeText,
                          isSelected && styles.countBadgeTextActive
                        ]}>
                          {option.count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date Range Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('balance.dateRange')}</Text>
            <Text style={styles.sectionSubtitle}>
              {t('balance.quickSelectOrChoose')}
            </Text>

            {/* Quick Date Presets */}
            <View style={styles.presetsSection}>
              <Text style={styles.presetsSectionLabel}>{t('balance.quickSelect') || 'Quick Select'}</Text>
              <View style={styles.presetsContainer}>
                {datePresets.map((preset) => {
                  const isActive = selectedPreset === preset.label;
                  const isDisabled = isCustomDateExpanded && (startDate || endDate) && !selectedPreset;
                  return (
                    <TouchableOpacity
                      key={preset.label}
                      style={[
                        styles.presetChip,
                        isActive && styles.presetChipActive,
                        isDisabled && styles.presetChipDisabled,
                      ]}
                      onPress={() => handlePresetPress(preset)}
                      disabled={isDisabled}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Quick filter: ${preset.label}`}
                    >
                      <Ionicons
                        name={preset.icon as any}
                        size={14}
                        color={
                          isDisabled
                            ? "#BDBDBD"
                            : isActive
                            ? "#FFFFFF"
                            : Colors.light.primaryBase
                        }
                      />
                      <Text
                        style={[
                          styles.presetChipText,
                          isActive && styles.presetChipTextActive,
                          isDisabled && styles.presetChipTextDisabled,
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('balance.or') || 'or'}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Custom Date Selection */}
            <View style={styles.customDatesContainer}>
              <TouchableOpacity
                style={styles.customDateHeader}
                onPress={toggleCustomDateSection}
                accessibilityRole="button"
                accessibilityLabel={
                  isCustomDateExpanded ? "Collapse custom date range" : "Expand custom date range"
                }
                activeOpacity={0.7}
              >
                <View style={styles.customDateHeaderLeft}>
                  <Text style={styles.customDatesLabel}>{t('balance.customRange') || 'Custom Range'}</Text>
                  {(startDate || endDate) && (
                    <View style={styles.customDateBadge}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.light.primaryBase} />
                    </View>
                  )}
                </View>
                <Ionicons
                  name={isCustomDateExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#5C6F7F"
                />
              </TouchableOpacity>
              
              {isCustomDateExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.dateContainer}>
                    {/* Start Date */}
                    <TouchableOpacity
                      style={[styles.dateCard, startDate && styles.dateCardActive]}
                      onPress={handleStartDatePress}
                      accessibilityRole="button"
                      accessibilityLabel="Select start date"
                      accessibilityHint="Double tap to open date picker"
                      activeOpacity={0.7}
                    >
                      <View style={styles.dateCardHeader}>
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color={startDate ? Colors.light.primaryBase : "#9E9E9E"}
                        />
                        <Text style={styles.dateLabel}>{t('balance.startDate')}</Text>
                        <View style={styles.editIconContainer}>
                          <Ionicons name="create-outline" size={16} color="#9E9E9E" />
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.dateValue,
                          !startDate && styles.dateValuePlaceholder,
                        ]}
                      >
                        {formatDate(startDate)}
                      </Text>
                      {!startDate && (
                        <Text style={styles.tapHintText}>{t('balance.tapToSelect') || 'Tap to select'}</Text>
                      )}
                      {startDate && (
                        <>
                          <Text style={styles.relativeDateText}>
                            {getDayOfWeek(startDate)} • {formatRelativeDate(startDate)}
                          </Text>
                          <TouchableOpacity
                            style={styles.clearDateButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              setStartDate(undefined);
                              setSelectedPreset(null);
                              setDateError("");
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Clear start date"
                          >
                            <Ionicons name="close-circle" size={20} color="#9E9E9E" />
                          </TouchableOpacity>
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Date Range Arrow */}
                    <View style={styles.dateArrow}>
                      <Ionicons 
                        name="arrow-forward" 
                        size={daysBetween && daysBetween > 0 ? 24 : 20} 
                        color={daysBetween && daysBetween > 0 ? Colors.light.primaryBase : "#BDBDBD"} 
                      />
                      {daysBetween && daysBetween > 0 && (
                        <View style={styles.dayCountBadge}>
                          <Text style={styles.dayCountText}>{daysBetween}d</Text>
                        </View>
                      )}
                    </View>

                    {/* End Date */}
                    <TouchableOpacity
                      style={[styles.dateCard, endDate && styles.dateCardActive]}
                      onPress={handleEndDatePress}
                      accessibilityRole="button"
                      accessibilityLabel="Select end date"
                      accessibilityHint="Double tap to open date picker"
                      activeOpacity={0.7}
                    >
                      <View style={styles.dateCardHeader}>
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color={endDate ? Colors.light.primaryBase : "#9E9E9E"}
                        />
                        <Text style={styles.dateLabel}>{t('balance.endDate')}</Text>
                        <View style={styles.editIconContainer}>
                          <Ionicons name="create-outline" size={16} color="#9E9E9E" />
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.dateValue,
                          !endDate && styles.dateValuePlaceholder,
                        ]}
                      >
                        {formatDate(endDate)}
                      </Text>
                      {!endDate && (
                        <Text style={styles.tapHintText}>{t('balance.tapToSelect') || 'Tap to select'}</Text>
                      )}
                      {endDate && (
                        <>
                          <Text style={styles.relativeDateText}>
                            {getDayOfWeek(endDate)} • {formatRelativeDate(endDate)}
                          </Text>
                          <TouchableOpacity
                            style={styles.clearDateButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              setEndDate(undefined);
                              setSelectedPreset(null);
                              setDateError("");
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Clear end date"
                          >
                            <Ionicons name="close-circle" size={20} color="#9E9E9E" />
                          </TouchableOpacity>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Date Error */}
              {dateError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#F44336" />
                  <Text style={styles.errorText}>{dateError}</Text>
                </View>
              ) : null}

              {/* Date Range Info */}
              {startDate && endDate && daysBetween && !dateError && (
                <View style={styles.dateRangeInfo}>
                  <Ionicons name="information-circle-outline" size={16} color={Colors.light.primaryBase} />
                  <Text style={styles.dateRangeInfoText}>
                    {`${t('balance.showingDaysOfTransactions').replace('{{days}}', daysBetween.toString())}`}
                  </Text>
                </View>
              )}
            </View>

          </View>

        {/* Date Picker Bottom Sheets */}
        <DatePickerBottomSheet
          isVisible={showStartDatePicker}
          onClose={() => setShowStartDatePicker(false)}
          onSelectDate={handleStartDateSelect}
          selectedDate={startDate}
          maximumDate={endDate || new Date()}
          title={t('balance.selectStartDate') || 'Select Start Date'}
          mode="start"
        />

        <DatePickerBottomSheet
          isVisible={showEndDatePicker}
          onClose={() => setShowEndDatePicker(false)}
          onSelectDate={handleEndDateSelect}
          selectedDate={endDate}
          minimumDate={startDate}
          maximumDate={new Date()}
          title={t('balance.selectEndDate') || 'Select End Date'}
          mode="end"
        />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.applyButton,
                dateError && styles.applyButtonDisabled
              ]}
              onPress={handleApply}
              disabled={!!dateError}
              accessibilityRole="button"
              accessibilityLabel={t('balance.applyFilters')}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>
                {activeFilterCount > 0 
                  ? t('balance.applyFiltersWithCount').replace('{{count}}', activeFilterCount.toString())
                  : t('balance.applyFilters')
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </NewBottomModal>
  );
};

export default React.memo(PayoutFilterModal);

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(22),
    color: "#071827",
  },
  resultCount: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(13),
    color: "#9E9E9E",
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  activeFiltersContainer: {
    marginBottom: 20,
  },
  activeFiltersLabel: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(12),
    color: "#5C6F7F",
    marginBottom: 8,
  },
  activeFiltersChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.primaryBase}10`,
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: `${Colors.light.primaryBase}30`,
    maxWidth: "80%",
    gap: 6,
  },
  filterChipText: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(12),
    color: Colors.light.primaryBase,
    flexShrink: 1,
  },
  filterChipRemove: {
    padding: 2,
  },
  clearAllChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.light.primaryBase,
    gap: 4,
  },
  clearAllChipText: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(12),
    color: Colors.light.primaryBase,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(16),
    color: "#071827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(13),
    color: "#9E9E9E",
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E9EAEB",
    gap: 6,
  },
  statusChipActive: {
    backgroundColor: Colors.light.primaryBase,
    borderColor: Colors.light.primaryBase,
  },
  checkIcon: {
    marginRight: -2,
  },
  statusChipText: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(14),
    color: "#5C6F7F",
  },
  statusChipTextActive: {
    color: "#FFFFFF",
    fontFamily: "DMSansBold",
  },
  countBadge: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: "center",
  },
  countBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  countBadgeText: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(11),
    color: "#5C6F7F",
  },
  countBadgeTextActive: {
    color: "#FFFFFF",
  },
  presetsSection: {
    marginBottom: 20,
  },
  presetsSectionLabel: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(14),
    color: "#071827",
    marginBottom: 12,
  },
  presetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: `${Colors.light.primaryBase}08`,
    borderWidth: 1,
    borderColor: `${Colors.light.primaryBase}30`,
    gap: 6,
  },
  presetChipActive: {
    backgroundColor: Colors.light.primaryBase,
    borderColor: Colors.light.primaryBase,
  },
  presetChipText: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(13),
    color: Colors.light.primaryBase,
  },
  presetChipTextActive: {
    color: "#FFFFFF",
    fontFamily: "DMSansBold",
  },
  presetChipDisabled: {
    opacity: 0.4,
  },
  presetChipTextDisabled: {
    color: "#BDBDBD",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E9EAEB",
  },
  dividerText: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(12),
    color: "#9E9E9E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  customDatesContainer: {
    marginTop: 4,
  },
  customDateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginBottom: 12,
  },
  customDateHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customDatesLabel: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(14),
    color: "#071827",
  },
  customDateBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: `${Colors.light.primaryBase}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  expandedContent: {
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: "#E9EAEB",
    minHeight: 110,
    position: "relative",
  },
  dateCardActive: {
    borderColor: Colors.light.primaryBase,
    backgroundColor: `${Colors.light.primaryBase}05`,
    shadowColor: Colors.light.primaryBase,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    position: "relative",
  },
  editIconContainer: {
    marginLeft: "auto",
    padding: 4,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  dateLabel: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(11),
    color: "#9E9E9E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateValue: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(14),
    color: "#071827",
    marginBottom: 4,
  },
  dateValuePlaceholder: {
    color: "#BDBDBD",
    fontFamily: "DMSansRegular",
  },
  tapHintText: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(10),
    color: "#9E9E9E",
    fontStyle: "italic",
    marginTop: 2,
  },
  relativeDateText: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(11),
    color: "#9E9E9E",
  },
  clearDateButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 4,
  },
  dateArrow: {
    paddingHorizontal: 6,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCountBadge: {
    backgroundColor: Colors.light.primaryBase,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  dayCountText: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(11),
    color: "#FFFFFF",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(13),
    color: "#F44336",
    flex: 1,
  },
  dateRangeInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.primaryBase}10`,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  dateRangeInfoText: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(13),
    color: Colors.light.primaryBase,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  applyButton: {
    width: "100%",
    backgroundColor: Colors.light.primaryBase,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.primaryBase,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonDisabled: {
    backgroundColor: "#BDBDBD",
    shadowOpacity: 0,
    elevation: 0,
  },
  applyButtonText: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(16),
    color: "#FFFFFF",
  },
});
