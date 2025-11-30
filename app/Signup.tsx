import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  ScrollView,
  Modal,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {defaultStyles} from '../constants/Styles';
import {Colors} from '../constants/Colors';
import {useLocalSearchParams, useRouter} from 'expo-router';

import * as Yup from 'yup';
import FilledButton from '../components/buttons/Filled_button';
import axios from 'axios';
import {useToast} from 'react-native-toast-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Countries, fontSz} from '../constants';

import {useAuthStore} from '../store/store';
import {useAppDispatch, useAppSelector} from '@redux/store';
import {setResetCodeDuration} from '@redux/slice/profile/profileSlice';
import {setUserCountryId} from '@redux/slice/user-country-id/userCountryIdSlice';
import {useSetItemToStorage} from '@hooks/set-item';
import {useGetItemFromStorage} from '@hooks/get-item';
import SelectCountryModal from '../modals/SelectCountryModal';
import {Ionicons} from '@expo/vector-icons';
import CountryFlag from 'react-native-country-flag';
import { useI18n } from '@hooks/use-i18n';
import { sanitizePhoneNumber } from '@utils/phoneValidation';

const Signup = () => {
  const { t } = useI18n();
  
  const SignupSchema = Yup.object().shape({
    firstName: Yup.string()
      .matches(
        /^[a-zA-Z0-9]+$/,
        t('auth.firstNameOnlyLetters'),
      )
      .required(t('auth.firstNameRequired')),
    lastName: Yup.string().required(t('auth.lastNameRequired')),
    email: Yup.string()
      .email(t('auth.validEmailRequired'))
      .required(t('auth.emailRequired')),
    country: Yup.string().required(t('auth.countryRequired')),
    phone: Yup.string()
      .matches(/^[0-9]+$/, t('auth.phoneOnlyDigits'))
      .min(8, t('auth.phoneMinLength'))
      .required(t('auth.phoneRequired')),
  });
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {setItem} = useSetItemToStorage();
  const {item: storedCountryId} = useGetItemFromStorage('countryId');
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const {countryId: reduxCountryId} = useAppSelector(
    state => state.userCountryId,
  );
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: 'United States',
    countryCode: 'US',
    phone: '',
    flag: 'US',
    dialingCode: '+1',
  });
  const [errors, setErrors]: any = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    phone: '',
  });

  const setUserName = useAuthStore(state => state.setUsername);

  // Debug: Monitor stored countryId changes
  useEffect(() => {
    console.log('📱 Signup - Stored countryId changed:', storedCountryId);
  }, [storedCountryId]);

  // Debug: Monitor Redux countryId changes
  useEffect(() => {
    console.log('🔄 Signup - Redux countryId changed:', reduxCountryId);
  }, [reduxCountryId]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const validateForm = () => {
    const validationErrors: any = {};

    try {
      // Validate with Yup schema
      SignupSchema.validateSync(formData, {abortEarly: false});
    } catch (err: any) {
      err.inner.forEach((error: any) => {
        validationErrors[error.path] = error.message;
      });
    }

    // Additional manual email validation
    if (formData.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

      if (!emailPattern.test(formData.email)) {
        validationErrors.email = t('auth.validEmailRequired');
      }
    }

    setErrors(validationErrors);

    // Return true if no errors
    return Object.keys(validationErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    if (!isPolicyAccepted) {
      return toast.show(
        t('auth.mustAgreeToTerms'),
        {type: 'danger', duration: 4000},
      );
    }

    setIsLoading(true);

    const payload = {
      countryCode: formData.countryCode,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      emailAddress: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/user-onboarding/create-profile`,
        payload,
      );

      if (response.status === 200 && response.data.responseCode === '0') {
        const {message} = response.data;

        await AsyncStorage.multiSet([
          ['firstName', formData.firstName],
          ['lastName', formData.lastName],
        ]);

        toast.show(message, {type: 'success', duration: 4000});
        setUserName(formData.firstName);
        await requestVerificationCode(formData.email);
      } else {
        Alert.alert('Error', 'Failed to create profile.');
      }
    } catch (error) {
      handleErrorResponse(error);
    } finally {
      setIsLoading(false);
      setSubmitted(false);
    }
  };

  const requestVerificationCode = async (emailAddress: string) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/user-onboarding/request-verification-code`,
        {emailAddress},
      );

      if (response.status === 200 && response.data.responseCode === '0') {
        const message =
          response.data.message || 'Verification code sent successfully';

        toast.show(message, {type: 'success', duration: 4000});

        dispatch(setResetCodeDuration(response?.data?.data?.duration));
        router.replace({
          pathname: '/Otp',
          params: {email: emailAddress.toLowerCase()},
        });
      } else {
        Alert.alert('Error', 'Failed to request verification code.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request verification code.');
    }
  };

  const handleErrorResponse = (error: any) => {
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (error.response.status === 500) {
        toast.show(data.detail, {type: 'danger', duration: 4000});
      }

      if (error.response.status === 400 && data.errors) {
        setErrors({
          phone: data.errors.phone?.[0] || '',
          email: data.errors.emailAddress?.[0] || '',
          firstName: data.errors.firstName?.[0] || '',
        });

        if (
          data.errors.model &&
          data.errors.model[0] ===
            'The email address provided is already in use'
        ) {
          toast.show('The email address is already in use.', {
            type: 'danger',
            duration: 4000,
          });
        }

        if (
          data.errors.model &&
          data.errors.model[0] === 'The phone number provided is already in use'
        ) {
          toast.show('The phone number is already in use.', {
            type: 'danger',
            duration: 4000,
          });
        }
      }
    } else {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  // Handler for selecting a country from the modal
  const handleSelectCountry = (country: any) => {
    // Update form data
    setFormData(f => ({
      ...f,
      country: country.label,
      countryCode: country.code || country.id,
      dialingCode: country.dialingCode,
      flag: country.code,
    }));

    // Save to AsyncStorage and Redux for app-wide usage

    dispatch(setUserCountryId(country.id));

    setItem('countryId', country.id);

    setShowCountryModal(false);
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: Colors.light.background}}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      {/* Modal should be here, not inside ScrollView */}
      <Modal
        visible={showCountryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}>
        <SelectCountryModal
          onClose={() => setShowCountryModal(false)}
          onSelect={handleSelectCountry}
        />
      </Modal>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 30,
            paddingBottom: 0,
            flex: 1,
            justifyContent: 'flex-start',
          }}>
          <Text style={defaultStyles.header}>Signup with Email</Text>
          <Text style={defaultStyles.descriptionText}>
            Enter your details to Signup
          </Text>

          {/* Email */}
          <View
            style={{
              backgroundColor: '#F5F6F7',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 20,
              marginTop: 30,
              borderWidth: 1,
              borderColor: errors.email ? '#FF3B4A' : 'transparent',
              height: 50,
            }}>
            <TextInput
              style={{
                fontSize: 15,
                color: '#222',
                fontFamily: 'DMSansRegular',
                padding: 0,
                backgroundColor: 'transparent',
              }}
              placeholder="Email Address"
              placeholderTextColor={Colors.light.disabled}
              value={formData.email}
              onChangeText={text => setFormData(f => ({...f, email: text}))}
              autoCapitalize="none"
            />
          </View>
          {errors.email ? (
            <Text
              style={{
                color: '#FF3B4A',
                fontSize: 12,
                marginBottom: 25,
                marginLeft: 2,
                fontFamily: 'DMSansMedium',
              }}>
              {errors.email}
            </Text>
          ) : null}

          {/* First Name & Last Name */}
          <View style={{flexDirection: 'row', gap: 12, marginBottom: 20}}>
            <View
              style={{
                backgroundColor: '#F5F6F7',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                flex: 1,
                marginBottom: 0,
                borderWidth: 1,
                borderColor: errors.firstName ? '#FF3B4A' : 'transparent',
                height: 50,
              }}>
              <TextInput
                style={{
                  fontSize: 15,
                  color: '#222',
                  fontFamily: 'DMSansRegular',
                  padding: 0,
                  backgroundColor: 'transparent',
                }}
                placeholder="First Name"
                placeholderTextColor={Colors.light.disabled}
                value={formData.firstName}
                onChangeText={text =>
                  setFormData(f => ({...f, firstName: text}))
                }
              />
            </View>
            <View
              style={{
                backgroundColor: '#F5F6F7',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                flex: 1,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: errors.lastName ? '#FF3B4A' : 'transparent',
                height: 50,
              }}>
              <TextInput
                style={{
                  fontSize: 15,
                  color: '#222',
                  fontFamily: 'DMSansRegular',
                  padding: 0,
                  backgroundColor: 'transparent',
                }}
                placeholder="Last Name"
                placeholderTextColor={Colors.light.disabled}
                value={formData.lastName}
                onChangeText={text =>
                  setFormData(f => ({...f, lastName: text}))
                }
              />
            </View>
          </View>
          {errors.firstName ? (
            <Text
              style={{
                color: '#FF3B4A',
                fontSize: 12,
                marginBottom: 2,
                marginLeft: 2,
                fontFamily: 'DMSansMedium',
              }}>
              {errors.firstName}
            </Text>
          ) : null}
          {errors.lastName ? (
            <Text
              style={{
                color: '#FF3B4A',
                fontSize: 12,
                marginBottom: 2,
                marginLeft: 2,
                fontFamily: 'DMSansMedium',
              }}>
              {errors.lastName}
            </Text>
          ) : null}

          {/* Country Dropdown */}
          <TouchableOpacity
            style={{
              backgroundColor: '#F5F6F7',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: errors.country ? '#FF3B4A' : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => setShowCountryModal(true)}
            activeOpacity={0.8}>
            <Text
              style={{
                fontSize: 15,
                color: formData.country ? '#222' : '#8A8F98',
                fontFamily: 'DMSansRegular',
                flex: 1,
              }}>
              {formData.country || 'Country'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={Colors.light.iconText}
            />
          </TouchableOpacity>
          {errors.country ? (
            <Text
              style={{
                color: '#FF3B4A',
                fontSize: 12,
                marginBottom: 2,
                marginLeft: 2,
                fontFamily: 'DMSansMedium',
              }}>
              {errors.country}
            </Text>
          ) : null}

          {/* Phone Number */}
          <View
            style={{
              backgroundColor: '#F5F6F7',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: errors.phone ? '#FF3B4A' : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              height: 50,
            }}>
            {/* Prefix: flag and dialing code */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 8,
              }}>
              {formData.flag ? (
                <CountryFlag isoCode={formData.flag} size={18} />
              ) : (
                <View style={{width: 18, height: 18, marginRight: 4}} />
              )}
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 15,
                  color: '#222',
                  fontFamily: 'DMSansRegular',
                  minWidth: 36,
                }}>
                {formData.dialingCode || ''}
              </Text>
            </View>
            <TextInput
              style={{
                fontSize: 15,
                color: '#222',
                fontFamily: 'DMSansRegular',
                padding: 0,
                backgroundColor: 'transparent',
                flex: 1,
              }}
              placeholder="Phone Number"
              placeholderTextColor={Colors.light.disabled}
              value={formData.phone}
              onChangeText={text => setFormData(f => ({...f, phone: sanitizePhoneNumber(text)}))}
              keyboardType="phone-pad"
            />
          </View>

          {errors.phone ? (
            <Text
              style={{
                color: '#FF3B4A',
                fontSize: 12,
                marginBottom: 2,
                marginLeft: 2,
                fontFamily: 'DMSansMedium',
              }}>
              {errors.phone}
            </Text>
          ) : null}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginTop: 20,
            }}>
            {/* Checkbox */}
            <TouchableOpacity
              onPress={() => setIsPolicyAccepted(v => !v)}
              activeOpacity={0.8}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  borderWidth: 1.5,
                  borderColor: isPolicyAccepted ? '#D4313E' : '#98A2B3',
                  marginRight: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isPolicyAccepted ? '#D4313E' : '#fff',
                }}>
                {isPolicyAccepted && (
                  <Text
                    style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>
                    ✓
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Agreement text */}
            <Text
              style={{
                fontSize: 13,
                color: '#222',
                fontFamily: 'DMSansRegular',
                lineHeight: 18,
              }}>
              I agree to the
            </Text>

            <TouchableOpacity
              onPress={() => router.replace('/TermsAndConditions')}>
              <Text
                style={{
                  color: '#D4313E',
                  fontWeight: '500',
                  fontFamily: 'DMSansRegular',
                }}>
                {' '}
                Terms & Conditions
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                color: '#5C6F7F',
                fontWeight: '400',
                fontFamily: 'DMSansRegular',
              }}>
              {' '}
              &
            </Text>

            <TouchableOpacity onPress={() => router.replace('/PrivacyPolicy')}>
              <Text
                style={{
                  color: '#D4313E',
                  fontWeight: '500',
                  fontFamily: 'DMSansRegular',
                  lineHeight: 25,
                  marginBottom: 2,
                }}>
                {' '}
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>

          {!isPolicyAccepted && submitted ? (
            <Text
              style={{
                color: '#FF3B4A',
                fontSize: 12,
                marginBottom: 2,
                marginLeft: 2,
                fontFamily: 'DMSansMedium',
              }}>
              You must agree to the Terms of Service, Conditions & Privacy
              Policy
            </Text>
          ) : null}


          {/* Continue Button */}
          <View style={{marginTop: 18, marginBottom: 8}}>
            <FilledButton
              title="Continue"
              onPress={onSubmit}
              disable={
                !formData.email ||
                !formData.firstName ||
                !formData.lastName ||
                !formData.country ||
                !formData.phone ||
                !isPolicyAccepted ||
                isLoading
              }
              loading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default Signup;

const styles = StyleSheet.create({
  inputWrapper: {
    marginTop: 20,
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: '#919EAB14',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#919EAB14',
  },
  inputError: {
    borderColor: 'red',
  },
  phoneContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  inputWrapperPhone: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#919EAB14',
    borderRadius: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#919EAB14',
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.light.black,
    fontFamily: 'DMSansRegular',
  },
  input: {
    padding: 20,
    fontSize: 18,
    marginRight: 10,
    flexDirection: 'row',
    fontFamily: 'DMSansBold',
    top: 10,
    color: '#212B36',
  },
  placeholder: {
    position: 'absolute',
    top: '45%',
    left: 20,
    fontFamily: 'DMSansMedium',
    fontSize: 16,
    color: Colors.light.disabled,
    transform: [{translateY: -7}],
  },
  placeholderFocused: {
    top: 15,
    fontSize: 16,
    color: Colors.light.tint,
    fontFamily: 'DMSansMedium',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    marginLeft: 20,
    fontSize: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.disabled,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioButtonIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  radioButtonIconSelected: {
    backgroundColor: Colors.light.primaryBase,
  },
  policyText: {
    color: Colors.light.tint,
    fontSize: fontSz(10),
    fontFamily: 'DMSansRegular',
    paddingRight: 20,
  },
  bottomContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 44,
  },
  newToText: {
    fontSize: 16,
    color: Colors.light.black,
    fontFamily: 'DMSansRegular',
  },
  signUpText: {
    fontSize: 16,
    color: Colors.light.colorText,
    fontFamily: 'DMSansBold',
    textDecorationLine: 'underline',
  },
});
