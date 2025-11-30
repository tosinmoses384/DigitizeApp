/**
 * Edit Return Address Modal for Shipping Label
 * Allows user to edit their return address for shipping purposes
 * Following the existing ReturnAddressForm pattern
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import NewBottomModal from '@components/NewBottomModal';
import CustomButton from '@components/CustomButton';
import NativeInput from '@components/NativeInput';
import { DropdownSelect } from '@components/dropdownSelect';
import CloseIcon from '@assets/images/svg/x-close.svg';
import type { ReturnAddressValues } from '@stores/types';
import { useAppSelector } from '@redux/store';
import configurationServices from '@services/features/configuration-service/configurationService';
import { capitalizeFirstLetter } from '@helper/capiterlize-first-letter';

interface IEditReturnAddressModal {
  isVisible: boolean;
  onClose: () => void;
  initialAddress?: ReturnAddressValues | null;
  onSave: (address: ReturnAddressValues) => void;
}

/**
 * Edit Return Address Modal Component
 * Displays a bottom sheet modal for editing return address
 */
const EditReturnAddressModal = React.memo<IEditReturnAddressModal>(
  ({ isVisible, onClose, initialAddress, onSave }) => {
    const { profile, token } = useAppSelector((state) => state.userProfileSlice);

    // Initialize form state
    const [form, setForm] = useState<ReturnAddressValues>({
      streetNumber: '',
      streetName: '',
      location: '',
      countryId: '',
    });

    // City/Location dropdown state
    const [countryLocations, setCountryLocations] = useState<any[]>([]);
    const [locationLoader, setLocationLoader] = useState(false);

    // Fetch country locations when modal opens
    useEffect(() => {
      if (isVisible && profile?.countryId && token) {
        setLocationLoader(true);
        configurationServices
          .countryLocation(token, profile.countryId)
          .then((res: any) => {
            const locations = res?.data?.map((list: any) => ({
              key: list?.id,
              value: capitalizeFirstLetter(list?.location || ''),
              label: capitalizeFirstLetter(list?.location || ''),
            })) || [];
            setCountryLocations(locations);
            setLocationLoader(false);
          })
          .catch(() => {
            setLocationLoader(false);
            setCountryLocations([]);
          });
      }
    }, [isVisible, profile?.countryId, token]);

    // Update form when initial address changes
    useEffect(() => {
      if (initialAddress) {
        setForm(initialAddress);
      } else if (profile) {
        // Pre-fill with profile data if available
        setForm({
          streetNumber: '',
          streetName: '',
          location: '',
          countryId: profile?.countryId || '',
        });
      }
    }, [initialAddress, profile, isVisible]);
    
    // Form validation
    const isValid = useMemo(() => {
      return (
        form.streetNumber.trim().length > 0 &&
        form.streetName.trim().length > 0 &&
        form.location.trim().length > 0 &&
        form.countryId.trim().length > 0
      );
    }, [form]);

    // Update field value
    const setField = useCallback(
      <K extends keyof ReturnAddressValues>(
        key: K,
        value: ReturnAddressValues[K]
      ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
      },
      []
    );

    // Handle save action
    const handleSave = useCallback(() => {
      if (isValid) {
        onSave(form);
        onClose();
      }
    }, [form, isValid, onSave, onClose]);

    // Handle close
    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    return (
      <NewBottomModal isShow={isVisible} onClose={handleClose} maxHeight={550}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Return Address</Text>
            <Pressable
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <CloseIcon width={24} height={24} />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.description}>
              Enter your return address details. This will be used as the sender
              address on the shipping label.
            </Text>

            {/* Street Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Street Number <Text style={styles.required}>*</Text>
              </Text>
              <NativeInput
                value={form.streetNumber}
                onChangeText={(value) => setField('streetNumber', value)}
                placeholder="e.g. 123"
                keyboardType="default"
                label="Street Number"
              />
            </View>

            {/* Street Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Street Name <Text style={styles.required}>*</Text>
              </Text>
              <NativeInput
                value={form.streetName}
                onChangeText={(value) => setField('streetName', value)}
                placeholder="e.g. Main Street"
                keyboardType="default"
                label="Street Name"
              />
            </View>

            {/* City/Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                City <Text style={styles.required}>*</Text>
              </Text>
              {locationLoader ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FF3B4A" />
                  <Text style={styles.loadingText}>Loading cities...</Text>
                </View>
              ) : countryLocations.length > 0 ? (
                <DropdownSelect
                  key={`location-dropdown-${form.location}-${countryLocations.length}`}
                  data={countryLocations}
                  setSelected={(val: any) => {
                    const selectedOption = countryLocations.find(
                      (opt) => opt.value === val || opt.key === val
                    );
                    const locationName = selectedOption?.value || val;
                    setField('location', locationName);
                  }}
                  selected={form.location}
                  placeholder="Select city"
                  customStyles={{
                    container: styles.dropdownContainer,
                    boxStyles: styles.dropdownBox,
                    inputStyles: styles.dropdownInput,
                  }}
                />
              ) : (
                <NativeInput
                  value={form.location}
                  onChangeText={(value) => setField('location', value)}
                  placeholder="e.g. London"
                  keyboardType="default"
                  label="City"
                />
              )}
            </View>

            {/* Country (Read-only, from profile) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Country</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>
                  {profile?.countryName || 'Not specified'}
                </Text>
              </View>
              <Text style={styles.helperText}>
                Country is automatically set from your profile
              </Text>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Save Address"
              buttonStyle={[
                styles.saveButton,
                !isValid && styles.saveButtonDisabled,
              ]}
              textStyle={styles.saveButtonText}
              onPress={handleSave}
              disabled={!isValid}
            />
          </View>
        </View>
      </NewBottomModal>
    );
  }
);

EditReturnAddressModal.displayName = 'EditReturnAddressModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'DMSans',
    color: '#637381',
    lineHeight: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B4A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'DMSans',
    color: '#1C1C1E',
    backgroundColor: '#FFFFFF',
  },
  readOnlyField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
  },
  readOnlyText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'DMSans',
    color: '#637381',
  },
  helperText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'DMSans',
    color: '#9CA3AF',
    marginTop: 6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'DMSans',
    color: '#637381',
  },
  dropdownContainer: {
    marginBottom: 0,
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 50,
  },
  dropdownInput: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'DMSans',
    color: '#1C1C1E',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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

export default EditReturnAddressModal;

