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
import { passwordValidationSchema } from "./validationSchemas";
import { authStyles } from "./authStyles";

interface PasswordScreenProps {
  email: string;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onLogin: () => void;
  onClose: () => void;
  onBack: () => void;
  onForgotPassword: () => void;
  isLoading: boolean;
  errorMessage?: string;
}

const PasswordScreen: React.FC<PasswordScreenProps> = React.memo(({
  email,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onLogin,
  onClose,
  onBack,
  onForgotPassword,
  isLoading,
  errorMessage,
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ password?: string }>({});

  const validatePassword = useCallback(async () => {
    try {
      await passwordValidationSchema.validate({ password }, { abortEarly: false });
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
  }, [password]);

  const handleLogin = useCallback(async () => {
    const isValid = await validatePassword();
    if (isValid) {
      onLogin();
    }
  }, [validatePassword, onLogin]);

  const isButtonDisabled = useMemo(() => {
    return !password || isLoading;
  }, [password, isLoading]);

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
        <Text style={authStyles.welcomeTitle}>Welcome Back, {email.split('@')[0]}</Text>
        <Text style={authStyles.subtitle}>Please enter your password to login</Text>
      </View>

      {/* Email Display */}
      <View style={authStyles.emailDisplaySection}>
        <View style={authStyles.emailDisplayContainer}>
          <Text style={authStyles.emailLabel}>Email Address</Text>
          <Text style={authStyles.emailValue}>{email}</Text>
        </View>
      </View>

      {/* Password Input */}
      <View style={authStyles.inputSection}>
        <View
          style={[
            authStyles.inputContainer,
            errors.password ? authStyles.errorBorder : {},
          ]}
        >
          <Text
            style={[
              authStyles.placeholder,
              focusedField === "password" || password
                ? authStyles.placeholderFocused
                : {},
            ]}
          >
            Password
          </Text>
          <TextInput
            style={authStyles.input}
            placeholder={focusedField === "password" || password ? "" : " "}
            placeholderTextColor={Colors.light.disabled}
            value={password}
            onBlur={() => setFocusedField(null)}
            onFocus={() => setFocusedField("password")}
            onChangeText={(text) => setPassword(text.trim())}
            secureTextEntry={!showPassword}
            selectionColor="#6b6464"
            accessibilityLabel="Password input"
            accessibilityRole="text"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={authStyles.iconContainer}
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            accessibilityRole="button"
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={24}
              color={Colors.light.disabled}
            />
          </TouchableOpacity>
        </View>
        {(errors.password || errorMessage) && (
          <Text style={authStyles.errorText}>{errorMessage || errors.password}</Text>
        )}
      </View>

      {/* Forgot Password Link */}
      <TouchableOpacity
        style={authStyles.forgotPasswordContainer}
        onPress={onForgotPassword}
        accessibilityLabel="Forgot password"
        accessibilityRole="button"
      >
        <Text style={authStyles.forgotPasswordText}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* Login Button */}
      <View style={authStyles.buttonSection}>
        <FilledButton
          title="Login"
          onPress={handleLogin}
          disable={isButtonDisabled}
          loading={isLoading}
        />
      </View>
    </KeyboardAvoidingView>
  );
});

PasswordScreen.displayName = 'PasswordScreen';

export default PasswordScreen;
