import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import Toast from "react-native-toast-message";
import { defaultStyles } from "../constants/Styles";
import { Colors } from "../constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import FilledButton from "../components/buttons/Filled_button";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { fontSz } from "../constants";
import { useToast } from "react-native-toast-notifications";
import { ScrollView } from "react-native-gesture-handler";
import { useAuthStore } from "../store/store";
import useSensitiveAnalytics from "@hooks/use-sensitive-analytics";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setResetCodeDuration,
  setToken,
} from "@redux/slice/profile/profileSlice";
import { useAppDispatch } from "@redux/store";
import { useAuthManager } from "../hooks/use-auth-manager";

const SetPassword = () => {
  useSensitiveAnalytics();
  const toast = useToast();
  const { saveToken, saveTokens } = useAuthManager();
  const dispatch = useAppDispatch();
  const { email, verificationCode } = useLocalSearchParams();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setUserName = useAuthStore((state) => state.setUsername);

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    specialChar: false,
    digit: false,
    lowercase: false,
    uppercase: false,
  });

  const validatePassword = (password: any) => {
    setPasswordRequirements({
      length: password.length >= 6,
      // specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      digit: /\d/.test(password),
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
    });
  };

  const handlePasswordChange = (text: any) => {
    setPassword(text);
    validatePassword(text);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    if (
      !passwordRequirements.length ||
      !passwordRequirements.specialChar ||
      !passwordRequirements.digit ||
      !passwordRequirements.lowercase ||
      !passwordRequirements.uppercase
    ) {
      Alert.alert("Error", "Password does not meet all the requirements.");
      setIsLoading(false);
      return;
    }

    const payload = {
      emailAddress: email,
      verificationCode: verificationCode,
      password: password,
    };

    try {
      console.log(process.env.EXPO_PUBLIC_API_BASE_URL);
      const controller = new AbortController();
      const REQUEST_TIMEOUT_MS = 15000;
      const timeoutId = setTimeout(() => { try { controller.abort(); } catch {} }, REQUEST_TIMEOUT_MS);
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/user-onboarding/create-password`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: REQUEST_TIMEOUT_MS,
          signal: controller.signal,
        }
      );

      if (response.data.responseCode === "0") {
        // await AsyncStorage.setItem("responseDate", response.data.responseDate);
        toast.show(response.data.message, { type: "success", duration: 4000 });
        // ("response", response?.data?.accessToken);

        // Extract tokens from the flat response structure
        const accessToken = response.data.accessToken;
        const refreshToken = response.data.refreshToken;
        
        if (accessToken && refreshToken) {
          // Use saveTokens to store both tokens securely in TokenStore
          await saveTokens({ accessToken, refreshToken });
        } else if (accessToken) {
          // Fallback to old method if refresh token is missing
          await saveToken(accessToken);
        } else {
          throw new Error('No access token received from server');
        }
        // Navigate to the authenticated timeline/home page
        dispatch(setResetCodeDuration(""));
        
        // Small delay to ensure token is saved and auth state is updated
        setTimeout(() => {
          router.replace("/(authenticated)/(tabs)/home");
        }, 500);
      } else {
        Alert.alert("Error", "Unexpected response code received.");
      }
    } catch (error: any) {
      if (error.response) {
        // ("Error response:", error.response);

        if (error.response.status === 400) {
          const errors = error.response.data.errors || {};
          const errorMessages = errors.model || [];
          toast.show(
            errorMessages.length > 0
              ? errorMessages.join(", ")
              : error.response.data.detail || "An error occurred.",
            {
              type: "danger",
              duration: 4000,
            }
          );
        } else {
          Alert.alert("Error", "Unexpected error occurred.");
        }
      } else {
        Alert.alert("Error", "Network error or server is down.");
      }
    } finally {
      try { clearTimeout(timeoutId); } catch {}
      setIsLoading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.light.background }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={defaultStyles.container}>
            <Text style={defaultStyles.header}>Create Password</Text>
            <Text style={defaultStyles.descriptionText}>
              Create a secure password for your account
            </Text>

            <View style={{ marginTop: 20 }}>
              <View
                style={[
                  styles.inputContainer,
                  !passwordRequirements.length ||
                  !passwordRequirements.specialChar ||
                  !passwordRequirements.digit ||
                  !passwordRequirements.lowercase ||
                  !passwordRequirements.uppercase
                    ? { borderColor: "red", borderWidth: 1 }
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.placeholder,
                    focusedField === "password" || password
                      ? styles.placeholderFocused
                      : null,
                  ]}
                >
                  Enter Password
                </Text>

                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={
                    focusedField === "password" || password ? "" : ""
                  }
                  placeholderTextColor={Colors.light.disabled}
                  value={password}
                  onBlur={() => setFocusedField(null)}
                  onFocus={() => setFocusedField("password")}
                  onChangeText={handlePasswordChange}
                  selectionColor={"#6b6464"}
                  secureTextEntry={!show}
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
            </View>

            <View style={styles.passwordRequirementsContainer}>
              <Text
                style={{
                  ...styles.passwordRequirementText,
                  color: passwordRequirements.length ? "#268727" : "red",
                }}
              >
                • Password must be at least 6 characters long
              </Text>
              <Text
                style={{
                  ...styles.passwordRequirementText,
                  color: passwordRequirements.specialChar ? "#268727" : "red",
                }}
              >
                • Password must contain at least one special character
              </Text>
              <Text
                style={{
                  ...styles.passwordRequirementText,
                  color: passwordRequirements.digit ? "#268727" : "red",
                }}
              >
                • Password must contain at least one digit
              </Text>
              <Text
                style={{
                  ...styles.passwordRequirementText,
                  color: passwordRequirements.lowercase ? "#268727" : "red",
                }}
              >
                • Password must contain at least one lowercase letter
              </Text>
              <Text
                style={{
                  ...styles.passwordRequirementText,
                  color: passwordRequirements.uppercase ? "#268727" : "red",
                }}
              >
                • Password must contain at least one uppercase letter
              </Text>
            </View>

            <View style={{ paddingVertical: 10, marginTop: 60 }}>
              <FilledButton
                title={"Create Account"}
                onPress={handleSubmit}
                disable={!Object.values(passwordRequirements).every(Boolean)}
                loading={isLoading}
              />
            </View>
          </View>
          <View style={styles.bottomContainer}>
            <Text style={styles.newToText}>A Trifter?</Text>
            <TouchableOpacity onPress={() => router.push("/Login")}>
              <Text style={styles.signUpText}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default SetPassword;

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 20,
    flexDirection: "row",
    backgroundColor: "#919EAB14",
    borderRadius: 12,
    borderColor: "transparent",
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
  input: {
    padding: 20,
    fontSize: 19,
    marginRight: 10,
    flexDirection: "row",
    fontFamily: "DMSansBold",
    top: 10,
    color: "#212B36",
  },
  iconContainer: {
    justifyContent: "center",
    paddingRight: 10,
  },

  bottomContainer: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    // paddingVertical: 20,
  },
  newToText: {
    fontSize: 16,
    color: Colors.light.black,
    fontFamily: "DMSansRegular",
  },
  signUpText: {
    fontSize: 16,
    color: Colors.light.colorText,
    fontFamily: "DMSansRegular",
    textDecorationLine: "underline",
  },
  passwordRequirementsContainer: {
    marginTop: 10,
  },
  passwordRequirementText: {
    fontSize: 14,
    color: "#1C2533",
    fontFamily: "DMSansRegular",
    marginBottom: 5,
  },
});
