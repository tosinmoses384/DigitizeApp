import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import NewBottomModal from "./NewBottomModal";
import { Colors } from "../constants/Colors";
import { fontSz } from "../constants";
import * as Haptics from "expo-haptics";

interface DatePickerBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  title: string;
  mode?: "start" | "end";
}

const DatePickerBottomSheet: React.FC<DatePickerBottomSheetProps> = ({
  isVisible,
  onClose,
  onSelectDate,
  selectedDate,
  minimumDate,
  maximumDate,
  title,
  mode = "start",
}) => {
  const [tempDate, setTempDate] = useState<Date>(
    selectedDate || new Date()
  );

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, []);

  const getDayOfWeek = useCallback((date: Date) => {
    return date.toLocaleDateString("en-GB", { weekday: "long" });
  }, []);

  const handleDateChange = useCallback(
    (event: any, date?: Date) => {
      if (Platform.OS === "android") {
        if (event.type === "set" && date) {
          setTempDate(date);
          onSelectDate(date);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onClose();
        } else if (event.type === "dismissed") {
          onClose();
        }
      } else {
        if (date) {
          setTempDate(date);
        }
      }
    },
    [onSelectDate, onClose]
  );

  const handleDone = useCallback(() => {
    onSelectDate(tempDate);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  }, [tempDate, onSelectDate, onClose]);

  const handleCancel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  const quickDateOptions = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const options = [
      { label: "Today", date: today, icon: "today" as const },
      { label: "Yesterday", date: yesterday, icon: "calendar" as const },
    ];

    if (mode === "start") {
      options.push(
        { label: "Last Week", date: lastWeek, icon: "calendar" as const },
        { label: "Last Month", date: lastMonth, icon: "calendar" as const }
      );
    }

    return options;
  }, [mode]);

  const handleQuickDatePress = useCallback((date: Date) => {
    setTempDate(date);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <NewBottomModal isShow={isVisible} onClose={onClose} maxHeight={620}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons
              name={mode === "start" ? "calendar-outline" : "calendar"}
              size={24}
              color={Colors.light.primaryBase}
            />
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>
                {getDayOfWeek(tempDate)}, {formatDate(tempDate)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cancel date selection"
          >
            <Ionicons name="close" size={24} color="#5C6F7F" />
          </TouchableOpacity>
        </View>

        {/* Quick Date Options */}
        <View style={styles.quickOptionsContainer}>
          <Text style={styles.quickOptionsLabel}>Quick Select</Text>
          <View style={styles.quickOptionsGrid}>
            {quickDateOptions.map((option) => {
              const isSelected =
                tempDate.toDateString() === option.date.toDateString();
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.quickOptionChip,
                    isSelected && styles.quickOptionChipActive,
                  ]}
                  onPress={() => handleQuickDatePress(option.date)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${option.label}`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={option.icon}
                    size={16}
                    color={
                      isSelected ? "#FFFFFF" : Colors.light.primaryBase
                    }
                  />
                  <Text
                    style={[
                      styles.quickOptionText,
                      isSelected && styles.quickOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date Picker */}
        <View style={styles.datePickerContainer}>
          <Text style={styles.datePickerLabel}>Or choose a specific date</Text>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            style={styles.datePicker}
            themeVariant="light"
          />
        </View>

        {/* Action Buttons */}
        {Platform.OS === "ios" && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDone}
              accessibilityRole="button"
              accessibilityLabel="Confirm date selection"
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </NewBottomModal>
  );
};

export default React.memo(DatePickerBottomSheet);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  title: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(18),
    color: "#071827",
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(13),
    color: "#9E9E9E",
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  quickOptionsContainer: {
    marginBottom: 24,
  },
  quickOptionsLabel: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(14),
    color: "#071827",
    marginBottom: 12,
  },
  quickOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickOptionChip: {
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
  quickOptionChipActive: {
    backgroundColor: Colors.light.primaryBase,
    borderColor: Colors.light.primaryBase,
  },
  quickOptionText: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(13),
    color: Colors.light.primaryBase,
  },
  quickOptionTextActive: {
    color: "#FFFFFF",
    fontFamily: "DMSansBold",
  },
  datePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9EAEB",
    paddingTop: 16,
  },
  datePickerLabel: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(13),
    color: "#5C6F7F",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  datePicker: {
    height: 200,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(16),
    color: "#5C6F7F",
  },
  doneButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.primaryBase,
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
  doneButtonText: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(16),
    color: "#FFFFFF",
  },
});

