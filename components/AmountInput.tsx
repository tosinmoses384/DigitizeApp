import React, { memo, useCallback, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';

export type AmountInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: any;
  placeholder?: string;
  error?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  currency?: string;
  maxLength?: number;
  style?: ViewStyle;
  height?: number;
  autoFocus?: boolean;
};

const AmountInput: React.FC<AmountInputProps> = memo(
  ({
    label,
    value,
    onChangeText,
    keyboardType = 'numeric',
    placeholder,
    error,
    onBlur,
    onFocus,
    currency = '$',
    maxLength = 10,
    style,
    height,
    autoFocus = false,
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = (value || '').length > 0;

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      onFocus?.();
    }, [onFocus]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      onBlur?.();
    }, [onBlur]);

    const handleTextChange = useCallback(
      (text: string) => {
        // Remove any non-numeric characters except decimal point
        let cleanedText = text.replace(/[^0-9.]/g, '');

        // Ensure only one decimal point
        const parts = cleanedText.split('.');
        if (parts.length > 2) {
          cleanedText = parts[0] + '.' + parts.slice(1).join('');
        }

        // Limit decimal places to 2
        if (cleanedText.includes('.')) {
          const [integer, decimal] = cleanedText.split('.');
          if (decimal && decimal.length > 2) {
            cleanedText = integer + '.' + decimal.substring(0, 2);
          }
        }

        onChangeText(cleanedText);
      },
      [onChangeText],
    );

    const displayValue = value || '';

    // Create dynamic styles based on props
    const containerStyle = [
      hasValue ? styles.inputFilledContainer : styles.inputEmptyContainer,
      error && styles.inputError,
      isFocused && styles.inputFocused,
      height ? { height } : null,
      style,
    ].filter(Boolean);

    return (
      <>
        <View style={[containerStyle, error && styles.errorBorder]}>
          {hasValue && (
            <View style={styles.inputFilledHeaderRow}>
              <Text
                style={[styles.inputFilledLabel, error && styles.labelError]}
              >
                {label}
              </Text>
            </View>
          )}

          <View style={styles.inputContent}>
            {hasValue && (
              <View style={styles.currencyContainer}>
                <Text style={styles.currencySymbol}>{currency}</Text>
              </View>
            )}

            <TextInput
              style={[
                hasValue ? styles.inputFilledValue : styles.inputEmptyText,
                Platform.OS === 'android' ? styles.androidInputAdjust : null,
              ]}
              placeholder={hasValue ? '' : placeholder || label}
              placeholderTextColor={error ? '#FF3B4A' : '#464F5D'}
              value={displayValue}
              onChangeText={handleTextChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              keyboardType={keyboardType}
              textAlignVertical="center"
              autoCorrect={false}
              autoCapitalize="none"
              selectionColor="#FF3B4A"
              maxLength={maxLength}
              autoFocus={autoFocus}
              accessibilityLabel={`${label} input`}
              accessibilityHint={`Enter amount in ${currency}`}
            />
          </View>
        </View>

        {error && typeof error === 'string' && (
          <Text style={styles.error}>{error}</Text>
        )}
      </>
    );
  },
);

AmountInput.displayName = 'AmountInput';

const styles = StyleSheet.create({
  inputEmptyContainer: {
    width: '100%',
    backgroundColor: '#E9EAEB',
    height: 56,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 8,
  },
  inputEmptyText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
    color: '#141417',
    flex: 1,
  },
  inputFilledContainer: {
    width: '100%',
    backgroundColor: '#F6F7F7',
    borderWidth: 1,
    borderColor: '#D3D5D8',
    borderStyle: 'solid',
    height: 58,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  inputFocused: {
    borderColor: '#FF3B4A',
  },
  inputFilledHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  inputFilledLabel: {
    fontSize: 12,
    lineHeight: 22,
    color: '#90959E',
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
    alignSelf: 'stretch',
    flex: 1,
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputFilledValue: {
    fontSize: 14,
    lineHeight: 22,
    color: '#000',
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
    textAlign: 'left',
    flex: 1,
  },
  androidInputAdjust: {
    paddingVertical: 0,
    marginTop: 0,
    includeFontPadding: false,
  },
  currencyContainer: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: '#141417',
    fontFamily: 'DMSans-Medium',
  },
  inputError: {
    borderColor: '#FF3B4A',
    backgroundColor: '#FFF5F5',
  },
  labelError: {
    color: '#FF3B4A',
  },
  error: {
    color: 'rgb(241, 37, 37)',
    fontSize: 12,
  },
  errorBorder: {
    borderColor: 'red',
    borderWidth: 1,
  },
});

export default AmountInput;
