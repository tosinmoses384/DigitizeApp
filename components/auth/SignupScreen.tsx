import React, { useState, useCallback, useMemo } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CountryFlag from 'react-native-country-flag';
import { Colors } from "../../constants/Colors";
import { useAuthStore } from "../../store/store";
import { useAppDispatch } from "../../redux/store";
import { setCountires, setIsCountryLoading } from "../../redux/slice/countries/countriesSlice";
import { useRouter } from "expo-router";
import { worldCountries } from "../../constants";
import FilledButton from "../buttons/Filled_button";
import SelectCountryModal from "../../modals/SelectCountryModal";
import { signupValidationSchema } from "./validationSchemas";
import { authStyles } from "./authStyles";
import PrivacyModal from "@components/modals/PrivacyModal";
import TermsModal from "@components/modals/TermsModal";
import { sanitizePhoneNumber } from "@utils/phoneValidation";
import { useConfigurationData } from "@hooks/use-configuration-data";
import identityServices from "../../services/features/identity-service/loginService";

interface SignupScreenProps {
  email: string;
  onClose: () => void;
  onBack: () => void;
  onSignupSuccess: (email: string) => void;
}

const SignupScreen: React.FC<SignupScreenProps> = React.memo(({
  email,
  onClose,
  onBack,
  onSignupSuccess,
}) => {
  const toast = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const setUserName = useAuthStore((state) => state.setUsername);
  const { queries } = useConfigurationData();
  const countries = queries.countries.data;
  const isCountryLoading = queries.countries.isLoading;
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    country?: string;
    phone?: string;
  }>({});

  console.log(countries, "countries")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "United States",
    countryCode: "US",
    phone: "",
    flag: "US",
    dialingCode: "+1",
  });

  // Load countries from constants
  const loadCountries = useCallback(() => {
    if (!countries) {
      dispatch(setIsCountryLoading(true));
      // Transform worldCountries to match the expected structure for SelectCountryModal
      const transformedCountries = worldCountries.map(country => ({
        id: country.id,
        label: country.label,
        code: country.id, // Use id as code for country flag
        dialingCode: country.value
      }));
      // Store the array directly in the countries slice
      dispatch(setCountires(transformedCountries as any));
      dispatch(setIsCountryLoading(false));
    }
  }, [countries, dispatch]);

  // Load countries when component mounts
  React.useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const validateForm = useCallback(() => {
    const validationErrors: any = {};

    try {
      signupValidationSchema.validateSync(formData, { abortEarly: false });
    } catch (err: any) {
      err.inner.forEach((error: any) => {
        validationErrors[error.path] = error.message;
      });
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData]);

  const handleSelectCountry = useCallback((country: any) => {
    setFormData(f => ({
      ...f,
      country: country.label,
      countryCode: country.code || country.id,
      dialingCode: country.dialingCode,
      flag: country.code
    }));
    setShowCountryModal(false);
  }, []);

  const handleErrorResponse = useCallback((error: any) => {
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (error.response.status === 500) {
        toast.show(data.detail, { type: "danger", duration: 4000 });
      }

      if (error.response.status === 400 && data.errors) {
        setErrors({
          phone: data.errors.phone?.[0] || "",
          firstName: data.errors.firstName?.[0] || "",
        });

        if (
          data.errors.model &&
          data.errors.model[0] ===
          "The email address provided is already in use"
        ) {
          toast.show("The email address is already in use.", {
            type: "danger",
            duration: 4000,
          });
        }

        if (
          data.errors.model &&
          data.errors.model[0] === "The phone number provided is already in use"
        ) {
          toast.show("The phone number is already in use.", {
            type: "danger",
            duration: 4000,
          });
        }
      }
    } else {
      toast.show("Network error. Please try again.", { type: "danger", duration: 4000 });
    }
  }, [toast]);


  const handleSignup = useCallback(async () => {
    setSubmitted(true);

    if (!validateForm()) {
      return;
    }

    if (!isPolicyAccepted) {
      return toast.show(
        "You must agree to the Terms of Service and Privacy Policy.",
        { type: "danger", duration: 4000 }
      );
    }

    setIsLoading(true);
    const payload = {
      countryCode: formData.countryCode,
      firstName: formData.firstName,
      lastName: formData.lastName,
      emailAddress: email,
      phone: formData.phone,
    };

    try {
      const response = await identityServices.passwordlessSignup(payload);

      if (response.responseCode === "0" && response.data) {
        await AsyncStorage.multiSet([
          ["firstName", formData.firstName],
          ["lastName", formData.lastName],
        ]);

        toast.show(response.message || "Account created successfully!", { 
          type: "success", 
          duration: 4000 
        });
        setUserName(formData.firstName);

        onSignupSuccess(email);
      } else {
        toast.show(response.message || "Failed to create account.", { 
          type: "danger", 
          duration: 4000 
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Passwordless signup error:", error);
        if (axios.isAxiosError(error)) {
          console.error("Error response body:", error.response?.data);
        }
      }

      handleErrorResponse(error);
    } finally {
      setIsLoading(false);
      setSubmitted(false);
    }
  }, [formData, email, isPolicyAccepted, validateForm, toast, setUserName, onSignupSuccess, handleErrorResponse]);

  const isButtonDisabled = useMemo(() => {
    return !formData.firstName ||
      !formData.lastName ||
      !formData.country ||
      !formData.phone ||
      !isPolicyAccepted ||
      isLoading;
  }, [formData, isPolicyAccepted, isLoading]);

  return (
    <KeyboardAvoidingView
      style={authStyles.signupContainer}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <Modal
        visible={showCountryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <SelectCountryModal
          onClose={() => setShowCountryModal(false)}
          onSelect={handleSelectCountry}
        />
      </Modal>

      {/* Terms and Conditions Modal */}
      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      <ScrollView
        contentContainerStyle={authStyles.signupScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={authStyles.signupContent}>
          {/* Back Button */}
          <TouchableOpacity
            style={authStyles.closeButton}
            onPress={onBack}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={16} color="#637381" />
          </TouchableOpacity>

          {/* Header */}
          <View style={authStyles.signupHeader}>
            <Text style={authStyles.signupTitle}>Looks like you are new here</Text>
            <Text style={authStyles.signupSubtitle}>Complete the rest of the form to sign up</Text>
          </View>

          {/* Email Display */}
          <View style={authStyles.emailDisplaySection}>
            <View style={authStyles.emailDisplayContainer}>
              <Text style={authStyles.emailLabel}>Email Address</Text>
              <Text style={authStyles.emailValue}>{email}</Text>
            </View>
          </View>

          {/* First Name & Last Name */}
          <View style={authStyles.nameRow}>
            <View style={[authStyles.nameInput, errors.firstName ? authStyles.errorBorder : {}]}>
              <TextInput
                style={authStyles.nameInputText}
                placeholder="Firstname"
                placeholderTextColor={Colors.light.disabled}
                value={formData.firstName}
                onChangeText={text => setFormData(f => ({ ...f, firstName: text.trim() }))}
              />
            </View>
            <View style={[authStyles.nameInput, errors.lastName ? authStyles.errorBorder : {}]}>
              <TextInput
                style={authStyles.nameInputText}
                placeholder="Lastname"
                placeholderTextColor={Colors.light.disabled}
                value={formData.lastName}
                onChangeText={text => setFormData(f => ({ ...f, lastName: text.trim() }))}
              />
            </View>
          </View>
          {errors.firstName && <Text style={authStyles.errorText}>{errors.firstName}</Text>}
          {errors.lastName && <Text style={authStyles.errorText}>{errors.lastName}</Text>}

          {/* Country Dropdown */}
          <TouchableOpacity
            style={[authStyles.countryInput, errors.country ? authStyles.errorBorder : {}]}
            onPress={() => setShowCountryModal(true)}
            activeOpacity={0.8}
          >
            <Text style={authStyles.countryText}>{formData.country || 'Country'}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.light.iconText} />
          </TouchableOpacity>
          {errors.country && <Text style={authStyles.errorText}>{errors.country}</Text>}

          {/* Phone Number */}
          <View style={[authStyles.phoneInput, errors.phone ? authStyles.errorBorder : {}]}>
            <View style={authStyles.phonePrefix}>
              {formData.flag ? (
                <CountryFlag isoCode={formData.flag} size={18} />
              ) : (
                <View style={{ width: 18, height: 18, marginRight: 4 }} />
              )}
              <Text style={authStyles.dialingCode}>{formData.dialingCode || ''}</Text>
            </View>
            <TextInput
              style={authStyles.phoneInputText}
              placeholder="Phone Number"
              placeholderTextColor={Colors.light.disabled}
              value={formData.phone}
              onChangeText={text => setFormData(f => ({ ...f, phone: sanitizePhoneNumber(text) }))}
              keyboardType="phone-pad"
            />
          </View>
          {errors.phone && <Text style={authStyles.errorText}>{errors.phone}</Text>}

          {/* Terms and Conditions */}
          <View style={authStyles.termsContainer}>
            <TouchableOpacity
              onPress={() => setIsPolicyAccepted(v => !v)}
              activeOpacity={0.8}
            >
              <View style={[authStyles.checkbox, isPolicyAccepted && authStyles.checkboxChecked]}>
                {isPolicyAccepted && (
                  <Text style={authStyles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
            <View style={authStyles.termsTextContainer}>
              <Text style={authStyles.termsText}>
                I agree to the{" "}
              </Text>
              <TouchableOpacity
                style={authStyles.termsLinkContainer}
                onPress={() => setShowTermsModal(true)}
                activeOpacity={0.7}
              >
                <Text style={authStyles.termsLink}>
                  Terms & Conditions
                </Text>
              </TouchableOpacity>
              <Text style={authStyles.termsText}>
                {" "}&{" "}
              </Text>
              <TouchableOpacity
                style={authStyles.termsLinkContainer}
                onPress={() => setShowPrivacyModal(true)}
                activeOpacity={0.7}
              >
                <Text style={authStyles.termsLink}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {(!isPolicyAccepted && submitted) && (
            <Text style={authStyles.termsErrorText}>
              You must agree to the Terms of Service, Conditions & Privacy Policy
            </Text>
          )}

          {/* Signup Button */}
          <View style={authStyles.signupButtonSection}>
            <FilledButton
              title="Signup"
              onPress={handleSignup}
              disable={isButtonDisabled}
              loading={isLoading}
              style={authStyles.signupButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

SignupScreen.displayName = 'SignupScreen';

export default SignupScreen;
