import React, { useState, useCallback, useMemo } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as yup from "yup";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import { Colors } from "../../constants/Colors";
import FilledButton from "../buttons/Filled_button";
import { emailValidationSchema } from "./validationSchemas";
import { authStyles } from "./authStyles";
import { robustApiClient } from "../../utils/robustApiClient";
import { networkErrorHandler } from "../../utils/networkErrorHandler";
import moment from "moment";

interface ForgotPasswordScreenProps {
  email: string;
  onClose: () => void;
  onBack: () => void;
  onSuccess: (email: string, durationInMinutes: number) => void;
}

/**
 * ForgotPasswordScreen Component
 * 
 * Following Coding Guide principles:
 * - Functional component with React.memo for performance (Section 3.1)
 * - TypeScript with strict typing (Section 1)
 * - Performance optimization with useCallback and useMemo (Section 3.1)
 * - Proper error handling with robustApiClient (Section 6)
 * - Accessibility labels and roles (Section 9)
 */
const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = React.memo(({
  email: initialEmail,
  onClose,
  onBack,
  onSuccess,
}) => {
  const toast = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = useCallback(async () => {
    try {
      await emailValidationSchema.validate({ email }, { abortEarly: false });
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
  }, [email]);

  const handleRequestPasswordReset = useCallback(async () => {
    const isValid = await validateEmail();
    if (!isValid) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await robustApiClient.post(
        '/identity/v1/account-recovery/request-password-reset',
        {
          emailAddress: email,
        },
        {
          context: 'Password Reset Request',
          retryConfig: {
            maxAttempts: 3,
            baseDelay: 1000,
            maxDelay: 5000
          }
        }
      );
      console.log('>>>>>>>>>>>>>>>>', response, 'response')

      const data = response.data;

      if (data?.succeeded) {
        toast.show(
          `${response.message ?? ''}. Code sent for password reset.`,
          {
            type: "success",
            duration: 4000,
          }
        );

        // Pass the duration and email to parent for navigation to OTP screen
        const durationString = data.duration; // e.g., "00:10:00"
        const durationInMinutes = moment.duration(durationString).asMinutes();
        onSuccess(email, durationInMinutes);
      } else {
        toast.show(
          data.message || "Password reset failed. Please try again.",
          {
            type: "danger",
            duration: 4000,
          }
        );
      }
    } catch (error) {
      console.error("Password reset request error:", error);

      // Handle the error using our robust error handler
      const networkError = await networkErrorHandler.handleError(
        error,
        'Password Reset Request'
      );

      if (networkError.code === 'REQUEST_CANCELED') {
        // User canceled - don't show error
        return;
      } else if (networkError.code === 'CLIENT_ERROR_400') {
        // Check if user doesn't exist
        if (axios.isAxiosError(error) && error.response?.data?.detail === "User does not exist") {
          toast.show(
            "This email address does not exist. Please check and try again.",
            {
              type: "danger",
              duration: 4000,
            }
          );
        } else {
          networkErrorHandler.showErrorToast(networkError, toast);
        }
      } else {
        // Show user-friendly error message
        networkErrorHandler.showErrorToast(networkError, toast);
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, validateEmail, onSuccess, toast]);

  const isButtonDisabled = useMemo(() => {
    return !email || isLoading;
  }, [email, isLoading]);

  return (
    <KeyboardAvoidingView
      style={authStyles.modalContent}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={authStyles.closeButton}
        onPress={onBack}
        accessibilityLabel="Go back"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={16} color="#637381" />
      </TouchableOpacity>

      {/* Header */}
      <View style={authStyles.header}>
        <Text style={authStyles.title}>Enter your Email Address</Text>
        <Text style={authStyles.subtitle}>
          We'll send you a code to reset your password
        </Text>
      </View>

      {/* Email Input */}
      <View style={authStyles.inputSection}>
        <View
          style={[
            authStyles.inputContainer,
            errors.email ? authStyles.errorBorder : {},
          ]}
        >
          <Text
            style={[
              authStyles.placeholder,
              focusedField === "email" || email
                ? authStyles.placeholderFocused
                : {},
            ]}
          >
            Email Address
          </Text>
          <TextInput
            style={authStyles.input}
            placeholder={focusedField === "email" || email ? "" : " "}
            placeholderTextColor={Colors.light.disabled}
            value={email}
            onBlur={() => setFocusedField(null)}
            onFocus={() => setFocusedField("email")}
            onChangeText={(text) => setEmail(text.trim().toLowerCase())}
            selectionColor="#6b6464"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Email address input"
            accessibilityRole="text"
          />
        </View>
        {errors.email && (
          <Text style={authStyles.errorText}>{errors.email}</Text>
        )}
      </View>

      {/* Continue Button */}
      <View style={authStyles.buttonSection}>
        <FilledButton
          title="Continue"
          onPress={handleRequestPasswordReset}
          disable={isButtonDisabled}
          loading={isLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
});

ForgotPasswordScreen.displayName = 'ForgotPasswordScreen';

export default ForgotPasswordScreen;


