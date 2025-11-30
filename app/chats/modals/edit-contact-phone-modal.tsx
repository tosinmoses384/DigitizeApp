/**
 * Edit Contact Phone Modal for Shipping Label
 * Allows user to edit their contact phone number for shipping purposes
 * Following the existing ContactDetailsModal pattern
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from 'react-native';
import NewBottomModal from '@components/NewBottomModal';
import CustomButton from '@components/CustomButton';
import CloseIcon from '@assets/images/svg/x-close.svg';
import InlineCountryCodePicker from '@components/InlineCountryCodePicker';
import { Country } from '@components/CountryCodeSelector';
import { sanitizePhoneNumber } from '@utils/phoneValidation';

interface IEditContactPhoneModal {
  isVisible: boolean;
  onClose: () => void;
  initialPhone?: string;
  initialCountryCode?: string;
  initialCountryIsoCode?: string;
  onSave: (phoneNumber: string) => void;
}

/**
 * Edit Contact Phone Modal Component
 * Displays a bottom sheet modal for editing contact phone number
 */
const EditContactPhoneModal = React.memo<IEditContactPhoneModal>(
  ({
    isVisible,
    onClose,
    initialPhone = '',
    initialCountryCode = '234',
    initialCountryIsoCode = 'NG',
    onSave,
  }) => {
    const [phoneNumber, setPhoneNumber] = useState(initialPhone);
    const [countryCode, setCountryCode] = useState(initialCountryCode);
    const [countryIsoCode, setCountryIsoCode] = useState(initialCountryIsoCode);

    // Update phone number when initial value changes
    useEffect(() => {
      if (initialPhone) {
        // Remove country code prefix if present
        const cleanedPhone = initialPhone.replace(/^\+\d+/, '').trim();
        setPhoneNumber(cleanedPhone);
      }
    }, [initialPhone]);

    // Handle save action
    const handleSave = useCallback(() => {
      const trimmedPhone = phoneNumber.trim();
      if (trimmedPhone) {
        // Combine country code and phone number
        const fullPhoneNumber = `+${countryCode}${trimmedPhone}`;
        onSave(fullPhoneNumber);
        onClose();
      }
    }, [phoneNumber, countryCode, onSave, onClose]);

    // Handle country code selection
    const handleSelectCountryCode = useCallback((country: Country) => {
      setCountryCode(country.dialCode);
      setCountryIsoCode(country.code);
    }, []);

    // Handle modal close
    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    return (
      <NewBottomModal
        isShow={isVisible}
        onClose={handleClose}
        maxHeight={400}
      >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Edit Contact Details</Text>
              <Pressable
                onPress={handleClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseIcon width={24} height={24} />
              </Pressable>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>Update your phone number</Text>
              <Text style={styles.description}>
                The shipping company may use it to send you shipping updates or
                contact you. Only a local phone number can be used.
              </Text>

              {/* Phone Input */}
              <View style={styles.phoneInputContainer}>
                <InlineCountryCodePicker
                  selectedCountryCode={countryIsoCode}
                  selectedDialCode={countryCode}
                  onSelect={handleSelectCountryCode}
                />

                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter Phone Number"
                  placeholderTextColor="#A0B1C0"
                  value={phoneNumber}
                  onChangeText={text => setPhoneNumber(sanitizePhoneNumber(text))}
                  keyboardType="phone-pad"
                  maxLength={15}
                  accessibilityLabel="Phone number input"
                  accessibilityRole="none"
                />
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
              <CustomButton
                title="Save"
                buttonStyle={[
                  styles.saveButton,
                  !phoneNumber.trim() && styles.saveButtonDisabled,
                ]}
                textStyle={styles.saveButtonText}
                onPress={handleSave}
                disabled={!phoneNumber.trim()}
              />
            </View>
          </View>
      </NewBottomModal>
    );
  }
);

EditContactPhoneModal.displayName = 'EditContactPhoneModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'visible', // Allow dropdown to overflow
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'DMSans',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24, // Add space between input and Save button
    overflow: 'visible', // Allow dropdown to overflow
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'DMSans',
    color: '#637381',
    lineHeight: 20,
    marginBottom: 24,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'visible', // Changed from 'hidden' to allow dropdown to appear
    zIndex: 100, // Ensure dropdown can appear above other elements
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'DMSans',
    color: '#1C1C1E',
    height: 48,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  saveButton: {
    backgroundColor: '#FF3B4A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#FFA8AE',
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans',
    color: '#FFFFFF',
  },
});

export default EditContactPhoneModal;

