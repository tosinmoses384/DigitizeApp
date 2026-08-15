import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {defaultStyles} from '../constants/Styles';
import {Colors} from '../constants/Colors';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import axios from 'axios';
import * as yup from 'yup';
import {useToast} from 'react-native-toast-notifications';
import FilledButton from '../components/buttons/Filled_button';
import TextButton from '../components/buttons/Text_button';
import {useAppDispatch, useAppSelector} from '../redux/store';
import SelectCountryModal from 'modals/SelectCountryModal';
import {setUserCountryId} from '@redux/slice/user-country-id/userCountryIdSlice';
import {useSetItemToStorage} from '@hooks/set-item';
import {useAuthManager} from '../hooks/use-auth-manager';
import {useAuth} from '../providers/AuthProvider';
import SocialLoginButtons from '@components/SocialLoginButtons';
import Signup from './Signup';
import {
  setCountires,
  setIsCountryLoading,
} from '@redux/slice/countries/countriesSlice';
import configurationServices from '@services/features/configuration-service/configurationService';
import {capitalizeFirstLetter} from '@helper/capitalize-first-letter';
import {useLocalSearchParams} from 'expo-router';
import Success from '@components/Success';
import DigitizeAppLogoComponentSvg from '@assets/images/svg_components/digitizeapp_logo';
import {useFocusEffect} from '@react-navigation/native';

enum SignInType {
  Phone,
  Email,
  Google,
  Facebook,
}

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email or Phone number is required')
    .test('emailOrPhone', 'Invalid email or phone number', value => {
      const isPhoneNumber = /^\d{11,15}$/.test(value || '');
      const isEmail = /\S+@\S+\.\S+/.test(value || '');
      return isPhoneNumber || isEmail;
    }),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

const OnboardingMain = () => {
  const toast = useToast();
  const {saveToken} = useAuthManager();
  const {login: authLogin} = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors]: any = useState({email: '', password: ''});
  const [showCountryList, setShowCountryList] = useState(false);
  const dispatch = useAppDispatch();
  const {setItem} = useSetItemToStorage();
  const {countryId} = useAppSelector(state => state?.userCountryId);
  ////----
  const {tab} = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(
    tab === 'signup' ? 'signup' : 'login',
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [country, setCountry] = useState('');
  const [loginFields, setLoginFields] = useState({email: '', password: ''});
  const [signupFields, setSignupFields] = useState({
    email: '',
    firstName: '',
    lastName: '',
    country: '',
    password: '',
    policy: false,
  });
  const [loginErrors, setLoginErrors] = useState<any>({});
  const [signupErrors, setSignupErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  ////-------

  // Disable back button to prevent navigation to previous screens after logout
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Prevent back navigation on OnboardingMain
        return true; // Return true to prevent default back action
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );

  // Set the tab on mount and when the param changes
  useEffect(() => {
    if (tab === 'signup' || tab === 'login') {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabSwitch = (selected: 'login' | 'signup') => {
    ///-------
    setActiveTab(selected);
    setLoginErrors({});
    setSignupErrors({});
  };

  const getCountries = () => {
    dispatch(setIsCountryLoading(true));
    configurationServices
      ?.countries('')
      .then((res: any) => {
        dispatch(setIsCountryLoading(false));
        const distructureColors = res?.data?.map((list: any) => {
          return {
            value: list?.id,
            label: capitalizeFirstLetter(list?.name),
            ...list,
          };
        });

        dispatch(setCountires(distructureColors));
      })
      .catch(error => {
        dispatch(setIsCountryLoading(false));
      });
  };

  useEffect(() => {
    if (!countryId) {
      getCountries();
    }
  }, [countryId]);

  const validateFields = async () => {
    try {
      await validationSchema.validate({email, password}, {abortEarly: false});
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors = err.inner.reduce(
          (acc: any, currError: any) => {
            return {...acc, [currError.path]: currError.message};
          },
          {},
        );
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const handleLogin = async () => {
    const isValid = await validateFields();
    if (!isValid) return;

    try {
      setIsLoading(true);

      // Use the new JWT refresh token system
      const response = await authLogin({
        emailAddress: email,
        password: password,
      });

      // Success - tokens are automatically stored securely
      toast.show('Login successful!', {
        type: 'success',
        duration: 2000,
      });

      // Set default countryId if not already set (similar to signup flow)
      if (!countryId || countryId.trim() === '') {
        const defaultCountryId = 'NG'; // Default to Nigeria, you can change this
        dispatch(setUserCountryId(defaultCountryId));
        setItem('countryId', defaultCountryId);
      } else {
      }

      // Navigation is handled automatically by auth manager
    } catch (error: any) {
      if (__DEV__) {
      }

      // Handle different error types
      const errorMessage =
        error?.message ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Unable to sign in. Please try again later.';

      toast.show(errorMessage, {
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  function onSignIn(Google: SignInType): void {
    throw new Error('Function not implemented.');
  }

  const onSuccess = (providerData: any) => {
    // Only navigate to home if login is truly successful
    if (providerData && providerData.accessToken) {
      router.replace('/');
    }
  };

  const onError = (errorMsg: string) => {
    if (errorMsg === 'Signin profile does not exist') {
      // On login tab, show error
      toast.show('No account found. Please sign up first.', {type: 'danger'});
    } else {
      toast.show(errorMsg, {type: 'danger', duration: 4000});
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: Colors.light.background}}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      {/* Tab Switcher OUTSIDE ScrollView */}

      <View style={{alignItems: 'center', marginTop: 70}}>
        <DigitizeAppLogoComponentSvg />
      </View>
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'login' ? styles.tabActive : styles.tabInactive,
          ]}
          onPress={() => handleTabSwitch('login')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'login'
                ? styles.tabTextActive
                : styles.tabTextInactive,
            ]}>
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'signup' ? styles.tabActive : styles.tabInactive,
          ]}
          onPress={() => handleTabSwitch('signup')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'signup'
                ? styles.tabTextActive
                : styles.tabTextInactive,
            ]}>
            Signup
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        {activeTab == 'login' && (
          <>
            <View style={defaultStyles.container}>
              <Text style={defaultStyles.header}>Login with Email</Text>
              <Text style={defaultStyles.descriptionText}>
                Enter your details to Login
              </Text>
              <View style={{marginTop: 10}}>
                {/* Email */}
                <View
                  style={[
                    styles.inputContainer,
                    errors.email ? styles.errorBorder : {},
                  ]}>
                  <TextInput
                    style={[styles.input, {flex: 1}]}
                    placeholder="Email Address or Username"
                    placeholderTextColor={Colors.light.disabled}
                    value={email}
                    onBlur={() => setFocusedField(null)}
                    onFocus={() => setFocusedField('email')}
                    onChangeText={text => setEmail(text.toLowerCase())}
                    selectionColor={'#6b6464'}
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                {/* Password */}
                <View
                  style={[
                    styles.inputContainer,
                    errors.password ? styles.errorBorder : {},
                  ]}>
                  <TextInput
                    style={[styles.input, {flex: 1}]}
                    placeholder="Password"
                    placeholderTextColor={Colors.light.disabled}
                    value={password}
                    onBlur={() => setFocusedField(null)}
                    onFocus={() => setFocusedField('password')}
                    onChangeText={text => setPassword(text)}
                    secureTextEntry={!show}
                    selectionColor={'#6b6464'}
                  />
                  <TouchableOpacity
                    onPress={() => setShow(!show)}
                    style={styles.iconContainer}>
                    <Ionicons
                      name={show ? 'eye' : 'eye-off'}
                      size={24}
                      color={Colors.light.disabled}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => router.push('/ForgotPassword')}
                style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Sign-in Button */}
              <View style={{paddingVertical: 10}}>
                <FilledButton
                  title={'Login'}
                  onPress={handleLogin}
                  disable={isLoading || !email || !password}
                  loading={isLoading}
                />
              </View>

              {/* Guest Sign-in Button */}
              <View style={{paddingVertical: 5}}>
                <TextButton
                  title={'Continue as guest'}
                  titleStyle={{fontSize: 16}}
                  onPress={() =>
                    countryId ? router.push('/home') : setShowCountryList(true)
                  }
                />
              </View>
            </View>
          </>
        )}
        {activeTab == 'signup' && <Signup />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OnboardingMain;

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 20,
    flexDirection: 'row',
    backgroundColor: '#919EAB14',
    borderRadius: 12,
  },
  input: {
    padding: 15,
    fontSize: 14,
    marginRight: 10,
    flexDirection: 'row',
    fontFamily: 'DMSansBold',
    // top: 10,
    color: '#212B36',
  },
  placeholder: {
    position: 'absolute',
    top: '50%',
    left: 20,
    fontFamily: 'DMSansMedium',
    fontSize: 14,
    color: Colors.light.disabled,
    transform: [{translateY: -7}],
  },
  placeholderFocused: {
    top: 15,
    fontSize: 16,
    color: Colors.light.tint,
    fontFamily: 'DMSansMedium',
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    fontFamily: 'DMSansRegular',
    marginTop: 5,
    marginLeft: 20,
  },
  bottomContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  newToText: {
    fontSize: 16,
    color: Colors.light.black,
    fontFamily: 'DMSansRegular',
  },
  signUpText: {
    fontSize: 12,
    color: Colors.light.colorText,
    fontFamily: 'DMSansBold',
    textDecorationLine: 'underline',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 20,
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: Colors.light.colorText,
    fontFamily: 'DMSansRegular',
    fontSize: 12,
  },
  iconContainer: {
    justifyContent: 'center',
    paddingRight: 10,
  },
  ////-----newstyles
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 0,
    justifyContent: 'flex-start',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F5F6F7',
    borderRadius: 16,
    marginBottom: 15,
    marginTop: 30,
    alignSelf: 'center',
    width: '98%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E9EAEB',
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingTop: 0,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    height: 40,
    margin: 4,
  },
  tabActive: {
    backgroundColor: '#fff',
    elevation: 1,
  },
  tabInactive: {
    backgroundColor: '#F5F6F7',
    borderWidth: 0,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'DMSansBold',
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  tabTextActive: {
    fontWeight: '700',
  },
  tabTextInactive: {
    color: '#8A8F98',
    fontWeight: '400',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'DMSansBold',
    marginBottom: 6,
    marginTop: 8,
    color: '#1E2226',
    textAlign: 'left',
  },
  descriptionText: {
    fontSize: 15,
    color: '#637381',
    fontFamily: 'DMSansRegular',
    marginBottom: 24,
    textAlign: 'left',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 2,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9EAEB',
  },
  orText: {
    marginHorizontal: 12,
    color: '#8A8F98',
    fontSize: 14,
    fontFamily: 'DMSansMedium',
  },
  socialTitle: {
    fontSize: 15,
    fontFamily: 'DMSansMedium',
    color: '#8A8F98',
    marginBottom: 14,
    textAlign: 'center',
  },
});
