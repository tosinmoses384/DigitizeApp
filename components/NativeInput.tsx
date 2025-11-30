import React, { memo, useCallback, useRef } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import type { KeyboardTypeOptions } from "react-native";

export type NativeInputProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  rightAccessory?: React.ReactNode;
  placeholder?: string;
  error?: string;
  onBlur?: () => void;
  onFocus?: () => void;
};

const NativeInput: React.FC<NativeInputProps> = memo(
  ({ 
    label, 
    value, 
    onChangeText, 
    keyboardType, 
    multiline, 
    rightAccessory,
    placeholder,
    error,
    onBlur,
    onFocus
  }) => {
    const hasValue = (value || "").length > 0;
    const inputRef = useRef<TextInput>(null);
    const handleContainerPress = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    // Handle multiline textarea separately
    if (multiline) {
      return (
        <Pressable
          onPress={handleContainerPress}
          style={[styles.textareaContainer, hasValue && styles.textareaContainerFilled]}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${label}`}
        >
          {hasValue && (
            <Text style={styles.textareaLabel}>{label}</Text>
          )}
          <View style={styles.textareaWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.textareaInput}
              placeholder={hasValue ? "" : (placeholder || label)}
              placeholderTextColor="#464F5D"
              value={value}
              onChangeText={onChangeText}
              onBlur={onBlur}
              onFocus={onFocus}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              autoCorrect={false}
              autoCapitalize="none"
              selectionColor="#FF3B4A"
            />
          </View>
        </Pressable>
      );
    }

    // Regular single-line input
    return (
      <Pressable
        onPress={handleContainerPress}
        style={[
          hasValue ? styles.inputFilledContainer : styles.inputEmptyContainer,
          error && styles.inputError,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${label}`}
      >
        {hasValue && (
          <View style={styles.inputFilledHeaderRow}>
            <Text style={[styles.inputFilledLabel, error && styles.labelError]}>{label}</Text>
            {rightAccessory}
          </View>
        )}
        <TextInput
          ref={inputRef}
          style={[
            hasValue ? styles.inputFilledValue : styles.inputEmptyText,
          ]}
          placeholder={hasValue ? "" : (placeholder || label)}
          placeholderTextColor={error ? "#FF3B4A" : "#464F5D"}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          onFocus={onFocus}
          keyboardType={keyboardType}
          autoCorrect={false}
          autoCapitalize="none"
          selectionColor="#FF3B4A"
        />
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  inputEmptyContainer: {
    width: "100%",
    backgroundColor: "#E9EAEB",
    height: 56,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: "center",
  },
  inputEmptyText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    color: "#141417",
    flex: 1,
    padding: 0,
  },
  inputFilledContainer: {
    width: "100%",
    backgroundColor: "#F6F7F7",
    borderWidth: 1,
    borderColor: "#D3D5D8",
    borderStyle: "solid",
    minHeight: 58,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputFilledHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  inputFilledLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: "#90959E",
    fontWeight: "500",
    fontFamily: "DMSans-Medium",
    alignSelf: "stretch",
    flex: 1,
  },
  inputFilledValue: {
    fontSize: 14,
    lineHeight: 20,
    color: "#141417",
    fontWeight: "500",
    fontFamily: "DMSans-Medium",
    textAlign: "left",
    flex: 1,
    padding: 0,
    minHeight: 20,
  },
  inputError: {
    borderColor: "#FF3B4A",
    backgroundColor: "#FFF5F5",
  },
  labelError: {
    color: "#FF3B4A",
  },
  textareaContainer: {
    width: "100%",
    backgroundColor: "#E9EAEB",
    height: 102,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 8,
  },
  textareaContainerFilled: {
    backgroundColor: "#F6F7F7",
    borderWidth: 1,
    borderColor: "#D3D5D8",
    borderStyle: "solid",
    paddingVertical: 7,
  },
  textareaLabel: {
    fontSize: 12,
    color: "#90959E",
    fontFamily: "DMSans-Medium",
    fontWeight: "500",
    lineHeight: 22,
    marginBottom: 2,
  },
  textareaWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  textareaInput: {
    flex: 1,
    fontSize: 14,
    color: "#141417",
    fontFamily: "DMSans-Medium",
    fontWeight: "500",
    lineHeight: 22,
    textAlignVertical: "top",
    padding: 0,
  },
});

NativeInput.displayName = "NativeInput";

export default NativeInput;