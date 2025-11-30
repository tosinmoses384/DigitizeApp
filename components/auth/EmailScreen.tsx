import React, { useState, useCallback, useMemo } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as yup from "yup";
import { Colors } from "../../constants/Colors";
import FilledButton from "../buttons/Filled_button";
import { emailValidationSchema } from "./validationSchemas";
import { authStyles } from "./authStyles";

interface EmailScreenProps {
  email: string;
  setEmail: (email: string) => void;
  onContinue: () => void;
  onClose: () => void;
  isLoading: boolean;
  errorMessage?: string;
}

const EmailScreen: React.FC<EmailScreenProps> = React.memo(({
  email,
  setEmail,
  onContinue,
  onClose,
  isLoading,
  errorMessage,
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string }>({});

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

  const handleContinue = useCallback(async () => {
    const isValid = await validateEmail();
    if (isValid) {
      onContinue();
    }
  }, [validateEmail, onContinue]);

  const isButtonDisabled = useMemo(() => {
    return !email || isLoading;
  }, [email, isLoading]);

  return (
    <KeyboardAvoidingView
      style={authStyles.modalContent}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Close Button */}
      <TouchableOpacity
        style={authStyles.closeButton}
        onPress={onClose}
        accessibilityLabel="Close modal"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={16} color="#637381" />
      </TouchableOpacity>

      {/* Header */}
      <View style={authStyles.header}>
        <Text style={authStyles.title}>Please Enter your Email Address</Text>
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
        {(errors.email || errorMessage) && (
          <Text style={authStyles.errorText}>{errors.email || errorMessage}</Text>
        )}
      </View>

      {/* Continue Button */}
      <View style={authStyles.buttonSection}>
        <FilledButton
          title="Continue"
          onPress={handleContinue}
          disable={isButtonDisabled}
          loading={isLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
});

EmailScreen.displayName = 'EmailScreen';

export default EmailScreen;
