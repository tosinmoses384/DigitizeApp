import React from "react";
import { useAppSelector } from "@redux/store";
import OtpVerificationScreen from "./OtpVerificationScreen";
import identityServices from "@services/features/identity-service/loginService";
import { useToast } from "react-native-toast-notifications";
import { useAppDispatch } from "@redux/store";
import { setResetCodeDuration } from "@redux/slice/profile/profileSlice";
import axios from "axios";

interface ForgotPasswordOtpProps {
  email: string;
  onBack: () => void;
  onSuccess: (email: string, verificationCode: string) => void;
}

const ForgotPasswordOtp: React.FC<ForgotPasswordOtpProps> = ({
  email,
  onBack,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { resendCodeDuration } = useAppSelector(
    (state) => state.userProfileSlice
  );

  const handleResendCode = async () => {
    try {
      let data = { emailAddress: email };
      const res = await identityServices.requestPasswordReset(data);

      if (res?.status !== 200) {
        toast.show(res.message || "Operation failed.", { type: "danger" });
        return { success: false, message: res.message };
      }

      const durationResponse: any = res?.data?.duration;
      dispatch(setResetCodeDuration(durationResponse));
      toast.show("Verification code sent.", { type: "success" });
      return { success: true };
    } catch (error) {
      toast.show("An error occurred. Please try again later.", {
        type: "danger",
      });
      return { success: false, message: "An error occurred." };
    }
  };

  const handleSubmitOtp = async (verificationCode: string) => {
    try {
      const payload = {
        emailAddress: email,
        resetCode: verificationCode,
      };

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account-recovery/verify-reset-code`,
        payload
      );

      if (response.status === 200) {
        return { success: true };
      } else {
        return {
          success: false,
          message:
            response.data.message || "Something went wrong. Please try again.",
        };
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.response?.data?.detail || "Invalid OTP. Please try again.";
      return { success: false, message: errorMessage };
    }
  };

  const handleSuccess = (verificationCode: string) => {
    onSuccess(email, verificationCode);
  };

  return (
    <OtpVerificationScreen
      title="Enter OTP"
      subtitle="Enter the code sent to your email"
      resendCodeDuration={Number(resendCodeDuration) || 5}
      onBack={onBack}
      onSubmit={handleSubmitOtp}
      onResend={handleResendCode}
      onSuccess={handleSuccess}
    />
  );
};

export default ForgotPasswordOtp;
