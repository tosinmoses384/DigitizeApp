import React, { useCallback } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import { useAppSelector } from "@redux/store";
import { requestVerificationCode } from "@services/features/request-verification-code";
import OtpVerificationScreen from "@components/auth/OtpVerificationScreen";
import { authStyles } from "./authStyles";

interface SignupOtpScreenProps {
  email: string;
  onBack: () => void;
  onSuccess: (verificationCode: string) => void;
}

/**
 * SignupOtpScreen - OTP verification screen for signup flow
 * 
 * This component handles OTP verification after user signup.
 * It uses the reusable OtpVerificationScreen component with signup-specific logic.
 * 
 * @param email - User's email address for OTP verification
 * @param onBack - Callback to navigate back to signup screen
 * @param onSuccess - Callback when OTP is successfully verified, receives verification code
 */
const SignupOtpScreen: React.FC<SignupOtpScreenProps> = React.memo(({
  email,
  onBack,
  onSuccess,
}) => {
  const toast = useToast();
  const { resendCodeDuration } = useAppSelector(
    (state) => state.userProfileSlice
  );

  /**
   * Submit OTP for verification
   * Makes API call to verify the code entered by user
   */
  const handleSubmitOtp = useCallback(async (verificationCode: string) => {
    try {
      const payload = {
        emailAddress: email.toLowerCase(),
        verificationCode,
      };

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/user-onboarding/submit-verification-code`,
        payload
      );

      if (response.status === 200) {
        return { success: true };
      } else {
        const message =
          response.data.detail ||
          "The code you entered is incorrect. Please try again.";
        return { success: false, message };
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        "An unexpected error occurred. Please try again.";
      return { success: false, message };
    }
  }, [email]);

  /**
   * Request a new OTP code
   * Sends a new verification code to user's email
   */
  const handleResendCode = useCallback(async () => {
    const result = await requestVerificationCode({
      emailAddress: email,
    });

    if (!result?.data?.succeeded) {
      toast.show(result.message, { type: "danger" });
      return { success: false, message: result.message };
    }

    toast.show("Verification code sent.", { type: "success" });
    return { success: true };
  }, [email, toast]);

  /**
   * Handle successful OTP verification
   * Proceeds to password setup screen
   */
  const handleSuccess = useCallback((verificationCode: string) => {
    onSuccess(verificationCode);
  }, [onSuccess]);

  return (
    <KeyboardAvoidingView
      style={authStyles.signupContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <OtpVerificationScreen
        title="Enter OTP"
        subtitle="Enter code sent to your email"
        resendCodeDuration={resendCodeDuration}
        onBack={onBack}
        onSubmit={handleSubmitOtp}
        onResend={handleResendCode}
        onSuccess={handleSuccess}
      />
    </KeyboardAvoidingView>
  );
});

SignupOtpScreen.displayName = 'SignupOtpScreen';

export default SignupOtpScreen;

