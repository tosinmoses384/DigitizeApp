import * as React from "react";
import { memo, useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView, Platform, Modal, ActivityIndicator } from "react-native";
import { Colors, SIZES } from "@constants/Colors";
import StackHeader from "@components/StackHeader";
import { useI18n } from "@hooks/use-i18n";
import { sanitizePhoneNumber } from "@utils/phoneValidation";
import SelectCountryModal from "@modals/SelectCountryModal";
import { worldCountries } from "@constants/Constants";
import EnterPhoneNumber1 from "@components/EnterPhoneNumber1";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppSelector } from "@redux/store";
import { useToast } from "react-native-toast-notifications";
import identityServices from "@services/features/identity-service/loginService";
import { router } from "expo-router";

interface IEnterPhoneNumber {
  onSave?: () => void;
  onClose?: () => void;
}

const phoneValidationSchema = Yup.object().shape({
  phone: Yup.string().required("Phone number is required"),
});

const EnterPhoneNumber = memo(({ onSave, onClose }: IEnterPhoneNumber) => {
  const { t } = useI18n();
  const { profile, token } = useAppSelector((state) => state.userProfileSlice);
  const toast = useToast();
  
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryData, setCountryData] = useState({
    flag: "US",
    dialingCode: "+1",
  });

  useEffect(() => {
    if (profile?.countryName) {
      const getCountryCode = worldCountries?.find(
        (list) =>
          list?.label?.toLocaleLowerCase() ===
          profile?.countryName?.toLocaleLowerCase()
      );

      if (getCountryCode) {
        setCountryData({
          flag: getCountryCode.id,
          dialingCode: getCountryCode.value,
        });
      }
    }
  }, [profile]);

  const handleSelectCountry = useCallback((country: any) => {
    // Get ISO country code (2-letter code like "US", "NG")
    // SelectCountryModal provides country.code as the ISO code
    let countryCode = country.code;
    
    // If country.code doesn't exist, try country.id, but if it's a UUID, look up by label
    if (!countryCode || countryCode.length > 2) {
      if (country.id && country.id.length <= 2) {
        countryCode = country.id.toUpperCase();
      } else {
        // If country.id is a UUID or country.code is missing, find by label
        const worldCountry = worldCountries.find(
          (wc) => wc.label?.toLowerCase() === country.label?.toLowerCase()
        );
        if (worldCountry) {
          countryCode = worldCountry.id;
        } else {
          countryCode = "US"; // Fallback
        }
      }
    }
    
    // Always look up dialing code from worldCountries using ISO code or label
    // Never trust country.value as it might be a UUID
    let dialingCode = null;
    const worldCountry = worldCountries.find(
      (wc) => wc.id === countryCode?.toUpperCase() ||
              wc.label?.toLowerCase() === country.label?.toLowerCase()
    );
    
    if (worldCountry) {
      dialingCode = worldCountry.value; // This is the dial code like "+1"
    } else if (country.dialingCode && country.dialingCode.startsWith('+')) {
      // Only use country.dialingCode if it starts with + (valid dial code format)
      dialingCode = country.dialingCode;
    } else {
      dialingCode = "+1"; // Default fallback
    }
    
    // Ensure we have a valid 2-letter country code for the flag
    const flag = (countryCode && countryCode.length === 2) ? countryCode.toUpperCase() : "US";
    
    setCountryData({
      flag: flag,
      dialingCode: dialingCode,
    });
    setShowCountryModal(false);
  }, []);

  const formik = useFormik({
    validationSchema: phoneValidationSchema,
    initialValues: {
      phone: "",
    },
    onSubmit: async (values: any, { setErrors, setSubmitting }) => {
      setIsButtonDisabled(true);
      setIsLoading(true);
      
      try {
        if (!token) {
          toast.show("Authentication required. Please log in again.", {
            type: "danger",
            duration: 4000,
          });
          return;
        }

        // Validate and format phone number to E.164 format
        const dialCode = countryData.dialingCode || '';
        
        // Ensure dial code starts with +
        if (!dialCode || !dialCode.startsWith('+')) {
          toast.show("Invalid country code. Please select a valid country.", {
            type: "danger",
          });
          setIsLoading(false);
          setIsButtonDisabled(false);
          setSubmitting(false);
          return;
        }
        
        // Remove any hyphens from dial code (e.g., "+1-242" -> "+1242")
        let cleanDialCode = dialCode;
        while (cleanDialCode.includes('-')) {
          cleanDialCode = cleanDialCode.replace('-', '');
        }
        
        // Extract country code (digits after +)
        const countryCode = cleanDialCode.substring(1);
        
        // Basic validation: country code should only contain digits and be reasonable length (1-4 digits)
        if (!countryCode || countryCode.length === 0 || countryCode.length > 4) {
          toast.show("Invalid country code. Please select a valid country.", {
            type: "danger",
          });
          setIsLoading(false);
          setIsButtonDisabled(false);
          setSubmitting(false);
          return;
        }
        
        // Check if country code contains only digits
        let isValidCountryCode = true;
        for (let i = 0; i < countryCode.length; i++) {
          const char = countryCode[i];
          if (char < '0' || char > '9') {
            isValidCountryCode = false;
            break;
          }
        }
        
        if (!isValidCountryCode) {
          toast.show("Invalid country code format. Please select a valid country.", {
            type: "danger",
          });
          setIsLoading(false);
          setIsButtonDisabled(false);
          setSubmitting(false);
          return;
        }
        
        // Sanitize phone number - remove all non-digits
        let sanitizedPhone = '';
        for (let i = 0; i < values.phone.length; i++) {
          const char = values.phone[i];
          if (char >= '0' && char <= '9') {
            sanitizedPhone += char;
          }
        }
        
        if (!sanitizedPhone || sanitizedPhone.length < 4) {
          toast.show("Please enter a valid phone number.", {
            type: "danger",
          });
          setIsLoading(false);
          setIsButtonDisabled(false);
          setSubmitting(false);
          return;
        }
        
        // Remove leading zero from local number if present (common in many countries)
        // This handles cases like "08012345678" -> "8012345678" for Nigeria (+234)
        let nationalNumber = sanitizedPhone;
        if (sanitizedPhone.startsWith('0') && sanitizedPhone.length > 4) {
          nationalNumber = sanitizedPhone.substring(1);
        }
        
        // Format to E.164: +{countryCode}{nationalNumber}
        const fullPhoneNumber = `+${countryCode}${nationalNumber}`;
        
        // Basic validation: E.164 format should be + followed by 7-15 digits total
        const totalDigits = countryCode.length + nationalNumber.length;
        if (totalDigits < 7 || totalDigits > 15) {
          toast.show("Phone number format is invalid. Please check and try again.", {
            type: "danger",
          });
          setIsLoading(false);
          setIsButtonDisabled(false);
          setSubmitting(false);
          return;
        }
        
        // Call the API endpoint using the identity service
        const response = await identityServices.requestNewPhoneVerificationToken(
          token,
          {
            newPhoneNumber: fullPhoneNumber,
          }
        );
        
        // Show success toast
        const successMessage = response?.message || "Phone number verification request sent successfully";
        toast.show(successMessage, {
          type: "success",
          duration: 4000,
        });

        // Close the modal first
        if (onClose) {
          onClose();
        }
        
        // Navigate to AccountOTPSettings screen with phone number
        router.push({
          pathname: "/AccountOTPSettings",
          params: { phoneNumber: fullPhoneNumber },
        });
        
        // Call the onSave callback if provided
        if (onSave) {
          onSave();
        }
      } catch (error: any) {
        console.error('Phone verification request error:', error);
        
        // Show error toast
        const errorMessage = error?.response?.data?.detail || 
                           error?.response?.data?.message || 
                           error?.message || 
                           "Failed to send verification request. Please try again.";
        
        toast.show(errorMessage, {
          type: "danger",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
        setIsButtonDisabled(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('changePhoneNumber.addPhoneNumber') || "Add phone number"}
          onPress={onClose || (() => {})}
          isShowHeaderShadow
        />
      </View>

      {/* Country Selection Modal */}
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

      <ScrollView style={styles.bodyContainer}>
        {/* Phone Number */}
        <View style={{ marginTop: 16 }}>
          <EnterPhoneNumber1
            flag={countryData.flag}
            dialingCode={countryData.dialingCode}
            phone={formik.values.phone}
            onSelectCountry={() => setShowCountryModal(true)}
            onPhoneChange={(text) => formik.setFieldValue("phone", sanitizePhoneNumber(text))}
            hasError={!!(formik.submitCount > 0 && formik.errors.phone)}
          />
          {formik.submitCount > 0 && formik.errors.phone && (
            <Text style={styles.errorText}>
              {typeof formik.errors.phone === 'string' ? formik.errors.phone : 'Invalid phone number'}
            </Text>
          )}
        </View>

        <View style={{ marginTop: 36 }}>
          <Pressable 
            style={[
              styles.btnView, 
              isButtonPressed && styles.btnPressed,
              (isButtonDisabled || isLoading) && styles.btnDisabled
            ]} 
            onPress={() => formik.handleSubmit()}
            onPressIn={() => setIsButtonPressed(true)}
            onPressOut={() => setIsButtonPressed(false)}
            disabled={isButtonDisabled || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.btnText, (isButtonDisabled || isLoading) && styles.btnTextDisabled]}>
                {t('common.save') || "Save"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 30,
    width: "100%",
    minHeight: "100%",
    height: "100%",
  },
  bodyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    marginTop: 24,
  },
  bodyTitle: {
    fontSize: 18,
    color: "#212B36",
    fontFamily: "DMSansSemiBold",
    marginBottom: 2,
  },
  bodySubtitle: {
    color: "#637381",
    fontSize: 14,
    marginBottom: 36,
    width: "100%",
  },
  phoneNumberFields: {
    alignSelf: "stretch",
    alignItems: "flex-start",
    gap: 16,
  },
  phoneNumberWrapper: {
    width: "100%",
    alignItems: "flex-start",
    display: "none",
  },
  phoneNumberFieldContainer: {
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  btnView: {
    backgroundColor: "#FF3B4A",
    borderRadius: 12,
    height: 48,
    width: "100%",
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingRight: 24,
    paddingBottom: 16,
    paddingLeft: 24,
    gap: 10,
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnDisabled: {
    backgroundColor: "#919EAB",
    opacity: 0.6,
  },
  btnText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "DMSansMedium",
  },
  btnTextDisabled: {
    color: "#FFFFFF",
    opacity: 0.6,
  },
  phoneInput: {
    backgroundColor: "#F5F6F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
  },
  phonePrefix: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    gap: 0,
  },
  dialingCode: {
    marginLeft: 1,
    marginRight: -1,
    fontSize: 15,
    color: "#222",
    fontFamily: "DMSansRegular",
    minWidth: 36,
  },
  phoneInputText: {
    fontSize: 15,
    color: "#222",
    fontFamily: "DMSansRegular",
    padding: 0,
    backgroundColor: "transparent",
    flex: 1,
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: "#FF3B4A",
  },
  errorText: {
    color: "#FF3B4A",
    fontSize: 12,
    marginBottom: 2,
    marginLeft: 2,
    fontFamily: "DMSansMedium",
  },
});

export default EnterPhoneNumber;

