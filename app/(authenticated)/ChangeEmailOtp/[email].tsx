import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useState, useRef, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import axios from "axios";
import { useToast } from "react-native-toast-notifications";
import { requestVerificationCode } from "@services/features/request-verification-code";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { Colors } from "@constants/Colors";
import { defaultStyles } from "@constants/Styles";
import CustomOtpInput from "@components/CustomOTPInput";
import FilledButton from "@components/buttons/Filled_button";
import Keypad from "@components/KeyboardDigits";
import identityServices from "@services/features/identity-service/loginService";
import { setResetCodeDuration } from "@redux/slice/profile/profileSlice";

const ChangeEmailOtp = () => {
  const keyboardVerticalOffset = Platform.OS === "ios" ? 80 : 0;
  const router = useRouter();
  const toast = useToast();
  const { token } = useAppSelector((state) => state.userProfileSlice);

  const { resendCodeDuration } = useAppSelector(
    (state) => state.userProfileSlice
  );
  const { email }: any = useLocalSearchParams();

  const [otpValue, setOtpValue] = useState(["", "", "", ""]);
  const inputRefs: any = useRef<(TextInput | null)[]>([]);
  const [countdown, setCountdown] = useState(
    moment.duration(resendCodeDuration, "minutes").asSeconds()
  );
  const [showResend, setShowResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   if (countdown > 0) {
  //     const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
  //     return () => clearTimeout(timer);
  //   } else {
  //     setShowResend(true);
  //   }
  // }, [countdown]);

  useEffect(() => {
    let interval: any = null;

    if (!showResend && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((seconds) => seconds - 1);
      }, 1000);
    } else if (countdown <= 0) {
      clearInterval(interval);
      setShowResend(true);
    }

    return () => clearInterval(interval);
  }, [showResend, countdown]);

  const handleKeyPress = (key: any) => {
    const newOtp = [...otpValue];
    if (key === "delete") {
      const clearedOtp = newOtp.map(() => "");
      setOtpValue(clearedOtp);
      handleFocus(0);
    } else if (key.length === 1 && !isNaN(key)) {
      const firstEmptyIndex = newOtp.indexOf("");
      if (firstEmptyIndex !== -1) {
        newOtp[firstEmptyIndex] = key;
        setOtpValue(newOtp);
        if (firstEmptyIndex < 3) {
          handleFocus(firstEmptyIndex + 1);
        }
      }
    }
  };

  const handleTextChange = (text: any, index: any) => {
    const newOtp = [...otpValue];
    newOtp[index] = text;
    setOtpValue(newOtp);
    if (text && index < 3) {
      handleFocus(index + 1);
    }
  };

  const handleFocus = (index: any) => {
    if (index >= 0 && index < otpValue.length) {
      inputRefs.current[index]?.focus();
    }
  };

  const isOtpValid = otpValue.join("").length === 4;

  const resetTimer = () => {
    setCountdown(moment.duration(resendCodeDuration, "minutes").asSeconds());
    setShowResend(false);
  };

  const handleResendCode = async () => {
    setLoading(true);
    let data = {
      currentEmailAddress: email,
    };
    identityServices
      .submitUserChangeEmailVerificationCode(token, data)
      .then((res: any) => {
        setLoading(false);
        if (res?.data?.succeeded) {
          dispatch(setResetCodeDuration(res?.data?.duration));
          resetTimer();
          return;
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          return router.push("/Onboarding");
        }

        return toast.show(`${res?.message || res?.detail}`, {
          type: "danger",
          duration: 4000,
        });
      })
      .catch((error: any) => {
        setLoading(false);
        return toast.show(`An error occurred. Please try again later.`, {
          type: "danger",
          duration: 4000,
        });
      });
  };

  const handleSubmitOtp = async () => {
    setIsLoading(true);
    const verificationCode = otpValue.join("");

    if (!isOtpValid) {
      toast.show("Please enter a valid OTP", { type: "danger" });
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    router.push(`/CreateNewEmail/${verificationCode}`);

    // try {
    //   const payload = {
    //     emailAddress: email.toLowerCase(),
    //     verificationCode,
    //   };

    //   const response = await axios.post(
    //     "https://staging-api.digitizeapp.com/identity/v1/user-onboarding/submit-verification-code",
    //     payload
    //   );

    //   if (response.status === 200) {
    //     router.replace({
    //       pathname: "/SetPassword",
    //       params: { email: email, verificationCode: verificationCode },
    //     });
    //   } else if (response.status === 400) {
    //     toast.show(
    //       response.data.detail ||
    //         "User onboarding verification code is invalid",
    //       {
    //         type: "danger",
    //       }
    //     );
    //   } else {
    //     toast.show("Invalid response from server", { type: "danger" });
    //   }
    // } catch (error: any) {
    //   console.error(
    //     "Error submitting OTP:",
    //     error.response?.data || error.message
    //   );

    //   if (error.response && error.response.data) {
    //     toast.show(
    //       error.response.data.detail || "An unexpected error occurred.",
    //       {
    //         type: "danger",
    //       }
    //     );
    //   } else {
    //     toast.show("An unexpected error occurred. Please try again.", {
    //       type: "danger",
    //     });
    //   }
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const formatted = moment.utc(countdown * 1000).format("mm:ss");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={defaultStyles.container}>
        <Text style={defaultStyles.header}>Enter OTP</Text>
        <Text style={defaultStyles.descriptionText}>
          Enter the code sent to your email address
        </Text>

        <View style={styles.inputWrapper}>
          <CustomOtpInput
            otpValue={otpValue}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            // inputRefs={inputRefs}
          />
        </View>

        {/* Countdown Timer / Resend Link */}
        <View style={styles.resendWrapper}>
          {showResend ? (
            <TouchableOpacity onPress={loading ? () => {} : handleResendCode}>
              <Text style={styles.resendText}>
                Haven’t received any code?{" "}
                <Text style={styles.resendLink}>
                  {loading ? "Loading.." : "Resend code"}
                </Text>
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.countdownText}>
              OTP expires in {formatted} minutes
            </Text>
          )}
        </View>

        <View style={{ paddingVertical: 10, marginTop: 60 }}>
          <FilledButton
            title={"Continue"}
            onPress={handleSubmitOtp}
            loading={isLoading}
          />
        </View>

        <Keypad onKeyPress={handleKeyPress} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    marginTop: 50,
    alignItems: "center",
  },
  resendWrapper: {
    marginTop: 20,
    alignItems: "center",
  },
  resendText: {
    fontSize: 16,
    color: "#6B6B6B",
    fontFamily: "DMSansRegular",
  },
  countdownText: {
    fontSize: 16,
    color: "#6B6B6B",
    fontFamily: "DMSansRegular",
  },
  resendLink: {
    color: "#FF3B4A",
    fontFamily: "DMSansRegular",
    fontSize: 16,
  },
});

export default ChangeEmailOtp;
