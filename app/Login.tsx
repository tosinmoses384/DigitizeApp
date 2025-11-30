import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { defaultStyles } from "../constants/Styles";
import { Colors } from "../constants/Colors";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as yup from "yup";
import { useToast } from "react-native-toast-notifications";
import FilledButton from "../components/buttons/Filled_button";
import TextButton from "../components/buttons/Text_button";
import { useAppDispatch, useAppSelector } from "../redux/store";
import SelectCountryModal from "modals/SelectCountryModal";
import { useAuthManager } from "../hooks/use-auth-manager";
import SocialLoginButtons from "@components/SocialLoginButtons";
import { useI18n } from "@hooks/use-i18n";

enum SignInType {
  Phone,
  Email,
  Google,
  Facebook,
}

const Page = () => {
  const { t } = useI18n();
  
  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .required(t('auth.emailOrPhoneRequired'))
      .test("emailOrPhone", t('auth.invalidEmailOrPhone'), (value) => {
        const isPhoneNumber = /^\d{11,15}$/.test(value || "");
        const isEmail = /\S+@\S+\.\S+/.test(value || "");
        return isPhoneNumber || isEmail;
      }),
    password: yup
      .string()
      .required(t('auth.passwordRequired'))
      .min(6, t('auth.passwordMinLength')),
  });

  const toast = useToast();
  const { saveToken, saveTokens } = useAuthManager();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors]: any = useState({ email: "", password: "" });
  const [showCountryList, setShowCountryList] = useState(false);
  const dispatch = useAppDispatch();
  const { countryId } = useAppSelector((state) => state?.userCountryId);

  const validateFields = async () => {
    try {
      await validationSchema.validate(
        { email, password },
        { abortEarly: false }
      );
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors = err.inner.reduce(
          (acc: any, currError: any) => {
            return { ...acc, [currError.path]: currError.message };
          },
          {}
        );
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const handleLogin = async () => {
    const isValid = await validateFields();
    if (!isValid) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      setIsLoading(true);
      // Add explicit timeout and abort to avoid hanging requests
      const controller = new AbortController();
      const REQUEST_TIMEOUT_MS = 15000;
      timeoutId = setTimeout(() => {
        try { controller.abort(); } catch {}
      }, REQUEST_TIMEOUT_MS);

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/signin/user`,
        {
          emailAddress: email,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          timeout: REQUEST_TIMEOUT_MS,
          signal: controller.signal,
        }
      );

      if (response.data.responseCode === "0") {
        // Extract tokens from the flat response structure
        const accessToken = response.data.data.accessToken;
        const refreshToken = response.data.data.refreshToken;
        
        if (accessToken && refreshToken) {
          // Use saveTokens to store both tokens securely in TokenStore
          await saveTokens({ accessToken, refreshToken });
        } else if (accessToken) {
          // Fallback to old method if refresh token is missing
          await saveToken(accessToken);
        } else {
          throw new Error('No access token received from server');
        }
        
        // Don't manually navigate - let auth manager handle navigation
        // toast.show("Login successful!", {
        //   type: "success",
        //   duration: 2000,
        // });
      } else {
        toast.show(t('auth.invalidCredentials'), {
          type: "danger",
          duration: 4000,
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Login error:", error);
        if (axios.isAxiosError(error)) {
          console.error("Error response body:", error.response?.data);
          console.error("Error status:", error.response?.status);
          console.error("Error headers:", error.response?.headers);
        }
      }
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.detail ||
          "Unable to sign in. Please try again later.";
        toast.show(errorMessage, { type: "danger", duration: 4000 });
      } else {
        setApiError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      // Clear request timeout
      try { clearTimeout(timeoutId); } catch {}
      setIsLoading(false);
    }
  };

  function onSignIn(Google: SignInType): void {
    throw new Error("Function not implemented.");
  }

  // console.log("working")

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={defaultStyles.container}>
          <Text style={defaultStyles.header}>{t('auth.welcomeBack')}</Text>
          <Text style={defaultStyles.descriptionText}>
            {t('auth.enterDetailsToSignIn')}
          </Text>
          <View style={{ marginTop: 20 }}>
            {/* Email */}
            <View
              style={[
                styles.inputContainer,
                errors.email ? styles.errorBorder : {},
              ]}
            >
              <Text
                style={[
                  styles.placeholder,
                  focusedField === "email" || email
                    ? styles.placeholderFocused
                    : {},
                ]}
              >
                {t('auth.emailAddressOrPhone')}
              </Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={focusedField === "email" || email ? "" : " "}
                placeholderTextColor={Colors.light.disabled}
                value={email}
                onBlur={() => setFocusedField(null)}
                onFocus={() => setFocusedField("email")}
                onChangeText={(text) => setEmail(text.toLowerCase())}
                selectionColor={"#6b6464"}
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
              ]}
            >
              <Text
                style={[
                  styles.placeholder,
                  focusedField === "password" || password
                    ? styles.placeholderFocused
                    : {},
                ]}
              >
                {t('auth.password')}
              </Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={focusedField === "password" || password ? "" : " "}
                placeholderTextColor={Colors.light.disabled}
                value={password}
                onBlur={() => setFocusedField(null)}
                onFocus={() => setFocusedField("password")}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={!show}
                selectionColor={"#6b6464"}
              />
              <TouchableOpacity
                onPress={() => setShow(!show)}
                style={styles.iconContainer}
              >
                <Ionicons
                  name={show ? "eye" : "eye-off"}
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
            onPress={() => router.push("/ForgotPassword")}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>

          {/* Sign-in Button */}
          <View style={{ paddingVertical: 10 }}>
            <FilledButton
              title={t('auth.signIn')}
              onPress={handleLogin}
              disable={isLoading}
              loading={isLoading}
            />
          </View>

          {/* Guest Sign-in Button */}
          <View style={{ paddingVertical: 5 }}>
            <TextButton
              title={t('common.continueAsGuest')}
              onPress={() =>
                countryId ? router.push("/home") : setShowCountryList(true)
              }
            />
          </View>
        </View>
        {showCountryList && (
          <SelectCountryModal
            onClose={() => {
              setShowCountryList(false);
            }}
          />
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Text style={styles.newToText}>{t('auth.newToDigitizeApp')} </Text>
        <TouchableOpacity onPress={() => router.push("/Country")}>
          <Text style={styles.signUpText}>{t('auth.signUp')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Page;

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 20,
    flexDirection: "row",
    backgroundColor: "#919EAB14",
    borderRadius: 12,
  },
  input: {
    padding: 20,
    fontSize: 19,
    marginRight: 10,
    flexDirection: "row",
    fontFamily: "DMSansBold",
    top: 10,
    color: "#212B36",
  },
  placeholder: {
    position: "absolute",
    top: "45%",
    left: 20,
    fontFamily: "DMSansMedium",
    fontSize: 18,
    color: Colors.light.disabled,
    transform: [{ translateY: -7 }],
  },
  placeholderFocused: {
    top: 15,
    fontSize: 16,
    color: Colors.light.tint,
    fontFamily: "DMSansMedium",
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    fontFamily: "DMSansRegular",
    marginTop: 5,
    marginLeft: 20,
  },
  bottomContainer: {
    paddingVertical: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  newToText: {
    fontSize: 16,
    color: Colors.light.black,
    fontFamily: "DMSansRegular",
  },
  signUpText: {
    fontSize: 16,
    color: Colors.light.colorText,
    fontFamily: "DMSansBold",
    textDecorationLine: "underline",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 20,
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: Colors.light.colorText,
    fontFamily: "DMSansRegular",
    fontSize: 16,
  },
  iconContainer: {
    justifyContent: "center",
    paddingRight: 10,
  },
});
