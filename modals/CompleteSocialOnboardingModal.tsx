import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '@constants/Colors';
import { useAppDispatch, useAppSelector } from '@redux/store';
import identityServices from '@services/features/identity-service/loginService';
import { setProfile } from '@redux/slice/profile/profileSlice';
import CustomDropdown from '@components/CustomDropdown';
import { useI18n } from '@hooks/use-i18n';
import { useConfigurationData } from '@hooks/use-configuration-data';

interface CompleteSocialOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: {
    firstName?: string;
    lastName?: string;
    countryId?: string;
    countryName?: string;
  };
}

const CompleteSocialOnboardingModal: React.FC<CompleteSocialOnboardingModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  const { data } = useConfigurationData();
  const countries = data.countries;

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    countryId: initialData?.countryId || '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    countryId: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        countryId: initialData.countryId || '',
      });
    }
  }, [initialData]);

  const countryOptions = useMemo(() => {
    if (!countries || !Array.isArray(countries)) return [];
    return countries.map((country: any) => ({
      key: String(country.value || country.id),
      value: String(country.value || country.id),
      label: country.label || country.name,
    }));
  }, [countries]);

  const handleFieldChange = useCallback((field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: String(value) }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validate = useCallback(() => {
    let valid = true;
    const newErrors = { firstName: '', lastName: '', countryId: '' };

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('auth.firstNameRequired');
      valid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('auth.lastNameRequired');
      valid = false;
    }

    if (!formData.countryId) {
      newErrors.countryId = t('auth.countryRequired');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }, [formData, t]);

  const handleCompleteOnboarding = useCallback(async () => {
    if (!validate() || !token) return;

    setIsLoading(true);

    try {
      const response = await identityServices.updateProfileDetails(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          countryId: formData.countryId,
          locationId: profile?.locationId || '',
          biography: profile?.biography || '',
          shouldShowLocation: profile?.shouldShowLocation ?? false,
        },
        token
      );

      if (response?.status === 200 || response?.data) {
        const updatedProfile = {
          ...profile,
          firstName: formData.firstName,
          lastName: formData.lastName,
          countryId: formData.countryId,
          actionRequired: null,
        };
        dispatch(setProfile(updatedProfile));

        onClose();
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  }, [validate, token, formData, profile, dispatch, onSuccess, onClose]);

  const isFormValid = useMemo(() => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.countryId !== ''
    );
  }, [formData]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.header}>{t('auth.socialOnboardingTitle')}</Text>
            <Text style={styles.subheader}>
              {t('auth.socialOnboardingSubtitle')}
            </Text>

            <View style={styles.inputRow}>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <View
                  style={[
                    styles.inputContainer,
                    errors.firstName ? styles.errorBorder : {},
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.firstName')}
                    placeholderTextColor={Colors.light.disabled}
                    value={formData.firstName}
                    onChangeText={(text) => handleFieldChange('firstName', text)}
                    accessibilityLabel={t('auth.firstName')}
                    accessibilityRole="text"
                  />
                </View>
                {errors.firstName ? (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                ) : null}
              </View>

              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <View
                  style={[
                    styles.inputContainer,
                    errors.lastName ? styles.errorBorder : {},
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.lastName')}
                    placeholderTextColor={Colors.light.disabled}
                    value={formData.lastName}
                    onChangeText={(text) => handleFieldChange('lastName', text)}
                    accessibilityLabel={t('auth.lastName')}
                    accessibilityRole="text"
                  />
                </View>
                {errors.lastName ? (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.dropdownWrapper}>
              <CustomDropdown
                placeholder={t('auth.country')}
                value={formData.countryId}
                options={countryOptions}
                onChange={(value) => handleFieldChange('countryId', value)}
                error={errors.countryId}
                searchable
                searchPlaceholder={t('common.search')}
                emptyText={t('common.noResults')}
                containerStyle={styles.dropdown}
                maxHeight={250}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.completeBtn,
                (!isFormValid || isLoading) && styles.completeBtnDisabled,
              ]}
              onPress={handleCompleteOnboarding}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.8}
              accessibilityLabel={t('auth.completeOnboarding')}
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.completeBtnText}>{t('auth.completeOnboarding')}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'DMSansBold',
    marginBottom: 8,
    color: '#1E2226',
    textAlign: 'center',
  },
  subheader: {
    fontSize: 14,
    color: '#637381',
    fontFamily: 'DMSansRegular',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: '#F5F6F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'DMSansRegular',
    padding: 0,
  },
  errorBorder: {
    borderColor: '#FF3B4A',
  },
  errorText: {
    color: '#FF3B4A',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
    fontFamily: 'DMSansMedium',
  },
  dropdownWrapper: {
    marginBottom: 20,
  },
  dropdown: {
    marginBottom: 0,
  },
  completeBtn: {
    backgroundColor: '#FF3B4A',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  completeBtnDisabled: {
    backgroundColor: '#FFD8DB',
  },
  completeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSansSemiBold',
  },
});

export default React.memo(CompleteSocialOnboardingModal);

