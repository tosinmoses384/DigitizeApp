import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../constants/Colors';
import SelectCountryModal from '../modals/SelectCountryModal';
import {Ionicons} from '@expo/vector-icons';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {
  CompleteSocialSignupPayload,
} from '@services/features/social-auth/socialAuthService';
import {useAppDispatch} from '@redux/store';
import {setUserCountryId} from '@redux/slice/user-country-id/userCountryIdSlice';
import {useSetItemToStorage} from '@hooks/set-item';
import { sanitizePhoneNumber } from '@utils/phoneValidation';

const CompleteSocialSignup = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [formData, setFormData] = useState({
    firstName:
      typeof params.firstName === 'string'
        ? params.firstName
        : Array.isArray(params.firstName)
        ? params.firstName[0]
        : '',
    lastName:
      typeof params.lastName === 'string'
        ? params.lastName
        : Array.isArray(params.lastName)
        ? params.lastName[0]
        : '',
    email:
      typeof params.email === 'string'
        ? params.email
        : Array.isArray(params.email)
        ? params.email[0]
        : '',
    user:
      typeof params.user === 'string'
        ? params.user
        : Array.isArray(params.user)
        ? params.user[0]
        : '',
    provider:
      typeof params.provider === 'string'
        ? params.provider
        : Array.isArray(params.provider)
        ? params.provider[0]
        : '',
    idToken:
      typeof params.idToken === 'string'
        ? params.idToken
        : Array.isArray(params.idToken)
        ? params.idToken[0]
        : '',
    accessToken:
      typeof params.accessToken === 'string'
        ? params.accessToken
        : Array.isArray(params.accessToken)
        ? params.accessToken[0]
        : '',
    identityToken:
      typeof params.identityToken === 'string'
        ? params.identityToken
        : Array.isArray(params.identityToken)
        ? params.identityToken[0]
        : '',
    authorizationCode:
      typeof params.authorizationCode === 'string'
        ? params.authorizationCode
        : Array.isArray(params.authorizationCode)
        ? params.authorizationCode[0]
        : '',
    country: '',
    countryCode: '',
    phoneNumber: '',
  });
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    country: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Hooks for Redux and AsyncStorage
  const dispatch = useAppDispatch();
  const {setItem} = useSetItemToStorage();

  const handleSelectCountry = (country: any) => {
    // Update form data
    setFormData(f => ({
      ...f,
      country: country.label,
      countryCode: country.code,
    }));

    // Save to AsyncStorage and Redux for app-wide usage
    dispatch(setUserCountryId(country.id));
    setItem('countryId', country.id);

    setShowCountryModal(false);
  };

  const validate = () => {
    let valid = true;
    let newErrors = {firstName: '', lastName: '', country: '', phoneNumber: ''};
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
      valid = false;
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
      valid = false;
    }
    if (!formData.country) {
      newErrors.country = 'Country is required';
      valid = false;
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const getPlatformCode = () => {
    if (Platform.OS === 'ios') return 'Ios';
    //1; // 1 = Ios
    //2; // 2 =
    if (Platform.OS === 'android') return 'Android';
    //2; // 2 = Android
    return 0; // 0 = Web
  };

  const getProviderCode = (provider: string) => {
    const smallProvider = provider.toLowerCase();
    if (smallProvider === 'apple') return 'Apple';
    // 0; // 2 = Apple

    if (smallProvider === 'google') return 'Google';
    //1;
    if (smallProvider === 'microsoft') return 2; // 2 = Apple
    if (smallProvider === 'facebook') return 3;
    if (smallProvider === 'amazon') return 4; // 2 = Apple
    return provider;
  };

  const handleCompleteSignup = async () => {
    if (!validate() || !isPolicyAccepted) return;
    setIsLoading(true);
    const payload: CompleteSocialSignupPayload = {
      countryCode: formData.countryCode,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      authorizationCode: formData.authorizationCode || formData.accessToken,
      token: formData.idToken || formData.identityToken,
      provider: getProviderCode(formData.provider),
      platform: getPlatformCode(),
    };
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        marginBottom: 10,
      }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
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
        <View style={styles.container}>
          <Text style={styles.header}>Just a Few More Things</Text>
          <Text style={styles.subheader}>
            Enter your details to Complete Signup
          </Text>
          <View style={{flexDirection: 'row', gap: 12, marginBottom: 0}}>
            <View
              style={[
                styles.inputContainer,
                {flex: 1},
                errors.firstName ? styles.errorBorder : {},
              ]}>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor={Colors.light.disabled}
                value={formData.firstName}
                onChangeText={text =>
                  setFormData(f => ({...f, firstName: text}))
                }
              />
            </View>
            <View
              style={[
                styles.inputContainer,
                {flex: 1},
                errors.lastName ? styles.errorBorder : {},
              ]}>
              <TextInput
                style={styles.input}
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
            <Text style={styles.errorText}>{errors.firstName}</Text>
          ) : null}
          {errors.lastName ? (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          ) : null}
          <View
            style={[
              styles.inputContainer,
              errors.phoneNumber ? styles.errorBorder : {},
            ]}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={Colors.light.disabled}
              value={formData.phoneNumber}
              keyboardType="phone-pad"
              onChangeText={text =>
                setFormData(f => ({...f, phoneNumber: sanitizePhoneNumber(text)}))
              }
            />
          </View>
          {errors.phoneNumber ? (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.inputContainer,
              {flexDirection: 'row', alignItems: 'center', marginBottom: 0},
              errors.country ? styles.errorBorder : {},
            ]}
            onPress={() => setShowCountryModal(true)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.input,
                {flex: 1, color: formData.country ? '#222' : '#8A8F98'},
              ]}>
              {formData.country || 'Country'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={Colors.light.iconText}
            />
          </TouchableOpacity>

          {errors.country ? (
            <Text style={styles.errorText}>{errors.country}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsPolicyAccepted(v => !v)}
            activeOpacity={0.8}>
            <View
              style={[
                styles.checkbox,
                isPolicyAccepted && styles.checkboxChecked,
              ]}>
              {isPolicyAccepted && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to the{' '}
              <Text style={styles.policyLink}>
                Terms of Service, Conditions & Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>
        
          <TouchableOpacity
            style={[
              styles.completeBtn,
              (!formData.firstName ||
                !formData.lastName ||
                !formData.country ||
                !isPolicyAccepted ||
                isLoading) &&
                styles.completeBtnDisabled,
            ]}
            onPress={handleCompleteSignup}
            disabled={
              !formData.firstName ||
              !formData.lastName ||
              !formData.country ||
              !isPolicyAccepted ||
              isLoading
            }
            activeOpacity={0.8}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.completeBtnText}>Complete Signup</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 0,
    justifyContent: 'flex-start',
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DMSansBold',
    marginBottom: 6,
    marginTop: 50,
    color: '#1E2226',
    textAlign: 'left',
  },
  subheader: {
    fontSize: 14,
    color: '#637381',
    fontFamily: 'DMSansRegular',
    marginBottom: 24,
    textAlign: 'left',
  },
  inputContainer: {
    backgroundColor: '#F5F6F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'DMSansRegular',
    padding: 0,
    backgroundColor: 'transparent',
  },
  errorBorder: {
    borderColor: '#FF3B4A',
  },
  errorText: {
    color: '#FF3B4A',
    fontSize: 12,
    marginBottom: 2,
    marginLeft: 2,
    fontFamily: 'DMSansMedium',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FF3B4A',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#FF3B4A',
    borderColor: '#FF3B4A',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#222',
    fontFamily: 'DMSansRegular',
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  policyLink: {
    color: '#D4313E',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  completeBtn: {
    backgroundColor: '#FF3B4A',
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  completeBtnDisabled: {
    backgroundColor: '#FFD8DB',
  },
  completeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CompleteSocialSignup;
