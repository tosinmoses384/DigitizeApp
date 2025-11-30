import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import { useAppSelector } from "@redux/store";
import { requestVerificationCode } from "@services/features/request-verification-code";
import OtpVerificationScreen from "@components/auth/OtpVerificationScreen";
import { useAuthStore } from "store/store";
import useSensitiveAnalytics from "@hooks/use-sensitive-analytics";

const Otp: React.FC = () => {
  useSensitiveAnalytics();
  const router = useRouter();
  const toast = useToast();
  const { email }: any = useLocalSearchParams();
  const { resendCodeDuration } = useAppSelector(
    (state) => state.userProfileSlice
  );
  const setUserName = useAuthStore((state) => state.setUsername);

  const handleSubmitOtp = async (verificationCode: string) => {
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
  };

  const handleResendCode = async () => {
    const result = await requestVerificationCode({
      emailAddress: email,
    });

    if (!result?.data?.succeeded) {
      toast.show(result.message, { type: "danger" });
      return { success: false, message: result.message };
    }

    toast.show("Verification code sent.", { type: "success" });
    return { success: true };
  };

  const handleSuccess = (verificationCode: string) => {
    setUserName("");
    router.replace({
      pathname: "/SetPassword",
      params: { email: email, verificationCode: verificationCode },
    });
  };

  return (
    <OtpVerificationScreen
      title="Enter OTP"
      subtitle="Enter code sent to your email"
      resendCodeDuration={resendCodeDuration}
      onBack={() => router.replace("/Onboarding")}
      onSubmit={handleSubmitOtp}
      onResend={handleResendCode}
      onSuccess={handleSuccess}
    />
  );
};

export default Otp;