import React, { useMemo, forwardRef, useState, useCallback } from "react";
import { View, StyleSheet, Text, TextInput, KeyboardTypeOptions, Platform, Pressable, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import AppTextInput from "@components/AppTextInput";
import CustomDropdown, { DropdownOption } from "@components/CustomDropdown";
import { IPayoutRequirementField } from "@services/walletService";

interface DynamicFormFieldProps {
  field: IPayoutRequirementField;
  value: string;
  onChange: (fieldName: string, value: string) => void;
  onBlur?: (fieldName: string, value: string) => void;
  error?: string;
  submitCount: number;
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
}

const DynamicFormField = forwardRef<TextInput, DynamicFormFieldProps>(({ 
  field,
  value,
  onChange,
  onBlur,
  error,
  submitCount,
  returnKeyType = "done",
  onSubmitEditing,
}, ref) => {
  const dropdownOptions: DropdownOption[] = useMemo(() => {
    if (field.fieldType !== "Select" || !field.options) {
      return [];
    }

    return Object.entries(field.options).map(([key, label]) => ({
      key,
      value: key,
      label: String(label),
    }));
  }, [field.fieldType, field.options]);

  const fieldLabel = useMemo(() => {
    return field.isRequired ? `${field.displayName} *` : field.displayName;
  }, [field.displayName, field.isRequired]);

  const placeholderText = useMemo(() => {
    if (field.placeholder) {
      return field.placeholder;
    }
    
    if (field.fieldType === "Select") {
      return `Select ${field.displayName}`;
    }
    
    return `Enter ${field.displayName.toLowerCase()}`;
  }, [field.placeholder, field.displayName, field.fieldType]);

  const handleTextChange = (text: string) => {
    const { isDigitsOnly, maxLength } = parsePattern(field.validationPattern);
    let nextValue = text;
    if (isDigitsOnly) {
      nextValue = nextValue.replace(/\D/g, "");
    }
    if (maxLength && nextValue.length > maxLength) {
      nextValue = nextValue.slice(0, maxLength);
    }
    onChange(field.fieldName, nextValue);
  };

  const handleDropdownChange = (selectedValue: string | number) => {
    onChange(field.fieldName, String(selectedValue));
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const openDatePicker = useCallback(() => {
    setTempDate(value ? new Date(value) : new Date());
    setShowDatePicker(true);
  }, [value]);

  const closeDatePicker = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  const handleDateChange = useCallback(
    (_event: any, selected?: Date) => {
      if (!selected) {
        if (Platform.OS === "android") setShowDatePicker(false);
        return;
      }
      const formatted = moment(selected).format("YYYY-MM-DD");
      onChange(field.fieldName, formatted);
      if (Platform.OS === "android") setShowDatePicker(false);
      onBlur?.(field.fieldName, formatted);
    },
    [field.fieldName, onBlur, onChange]
  );

  const handleTempDateChange = useCallback((_e: any, selected?: Date) => {
    if (selected) {
      setTempDate(selected);
    }
  }, []);

  const handleConfirmDate = useCallback(() => {
    const commit = tempDate || new Date();
    const formatted = moment(commit).format("YYYY-MM-DD");
    onChange(field.fieldName, formatted);
    onBlur?.(field.fieldName, formatted);
    setShowDatePicker(false);
  }, [field.fieldName, onBlur, onChange, tempDate]);

  if (field.fieldType === "Select" && dropdownOptions.length > 0) {
    return (
      <View style={styles.fieldContainer}>
        <CustomDropdown
          label={fieldLabel}
          placeholder={placeholderText}
          value={value}
          options={dropdownOptions}
          onChange={handleDropdownChange}
          searchable={dropdownOptions.length > 5}
          error={submitCount > 0 && error ? error : undefined}
          labelStyle={styles.dropdownLabel}
          containerStyle={{ marginBottom: 0 }}
        />
        {field.description && (
          <Text style={styles.helperText}>{field.description}</Text>
        )}
      </View>
    );
  }

  if (field.fieldType === "Date") {
    const displayValue = value ? moment(value).format("MM/DD/YYYY") : "";
    return (
      <View style={styles.fieldContainer}>
        <Pressable onPress={openDatePicker} accessibilityLabel={`Select ${field.displayName}`} accessibilityRole="button">
          <AppTextInput
            label={fieldLabel}
            placeholder={placeholderText}
            value={displayValue}
            onChangeText={() => {}}
            editable={false}
            isShowInnerLabel
            error={submitCount > 0 && error ? error : undefined}
            iconRight={<Ionicons name="calendar-outline" size={18} color="#919EAB" />}
          />
        </Pressable>
        {Platform.OS === "android" && showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={value ? new Date(value) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        {Platform.OS === "ios" && (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="fade"
            onRequestClose={closeDatePicker}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContainer}>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={tempDate || (value ? new Date(value) : new Date())}
                  mode="date"
                  display="spinner"
                  onChange={handleTempDateChange}
                />
                <View style={styles.modalActions}>
                  <Pressable
                    onPress={closeDatePicker}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel date selection"
                    style={styles.modalAction}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleConfirmDate}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm date selection"
                    style={styles.modalAction}
                  >
                    <Text style={styles.confirmText}>Done</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}
        {field.description && (
          <Text style={styles.helperText}>{field.description}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.fieldContainer}>
      <AppTextInput
        ref={ref}
        label={fieldLabel}
        placeholder={placeholderText}
        value={value}
        onChangeText={handleTextChange}
        error={submitCount > 0 && error ? error : undefined}
        isShowInnerLabel
        keyboardType={getKeyboardType(field.validationPattern)}
        maxLength={parsePattern(field.validationPattern).maxLength}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        onBlur={() => onBlur?.(field.fieldName, value)}
      />
      {field.description && (
        <Text style={styles.helperText}>{field.description}</Text>
      )}
    </View>
  );
});

DynamicFormField.displayName = "DynamicFormField";

function parsePattern(pattern?: string | null): { isDigitsOnly: boolean; maxLength?: number } {
  if (!pattern) return { isDigitsOnly: false };
  const isDigitsOnly = /\\d/.test(pattern) && !/[A-Za-z]/.test(pattern);
  const lenMatch = pattern.match(/\\d\{(\d+)\}/) || pattern.match(/\d\{(\d+)\}/);
  const maxLength = lenMatch ? Number(lenMatch[1]) : undefined;
  return { isDigitsOnly, maxLength };
}

function getKeyboardType(pattern?: string | null): KeyboardTypeOptions {
  const { isDigitsOnly } = parsePattern(pattern);
  return isDigitsOnly ? "number-pad" : "default";
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginVertical: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    fontFamily: "DMSansMedium",
    color: "#071827",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    fontFamily: "DMSansRegular",
    color: "#6B727E",
    marginTop: 6,
    lineHeight: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalAction: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelText: {
    color: "#6B727E",
    fontSize: 16,
    fontFamily: "DMSansMedium",
  },
  confirmText: {
    color: "#FF3B4A",
    fontSize: 16,
    fontFamily: "DMSansSemiBold",
  },
});

export default DynamicFormField;

