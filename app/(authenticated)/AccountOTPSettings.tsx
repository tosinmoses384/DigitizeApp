import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useState, useRef, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { Colors, SIZES } from "@constants/Colors";
import { defaultStyles } from "@constants/Styles";
import CustomOtpInput from "@components/CustomOTPInput";
import FilledButton from "@components/buttons/Filled_button";
import Keypad from "@components/KeyboardDigits";
import identityServices from "@services/features/identity-service/loginService";
import {
  setRefetchUserState,
  setResetCodeDuration,
} from "@redux/slice/profile/profileSlice";
import { setTemporaryRoute } from "@redux/slice/temporary-route/temporaryRouteSlice";
import SuccessPage from "./SuccessPage";
import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";

const AccountOTPSettings = () => {
  const keyboardVerticalOffset = Platform.OS === "ios" ? 80 : 0;
  const router = useRouter();
  const toast = useToast();
  const { token, resendCodeDuration } = useAppSelector(
    (state) => state.userProfileSlice
  );
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();

  const [otpValue, setOtpValue] = useState(["", "", "", ""]);
  const inputRefs: any = useRef<(TextInput | null)[]>([]);
  const initialCountdown = moment.duration(resendCodeDuration || 5, "minutes").asSeconds();
  const [countdown, setCountdown] = useState(initialCountdown);
  const [showResend, setShowResend] = useState(initialCountdown <= 0);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (showResend) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShowResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showResend]);

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
    setCountdown(moment.duration(resendCodeDuration || 5, "minutes").asSeconds());
    setShowResend(false);
  };

  const handleResendCode = async () => {
    if (!phoneNumber) {
      toast.show("Phone number is required to resend code", {
        type: "danger",
        duration: 4000,
      });
      return;
    }

    setLoading(true);
    identityServices
      .requestNewPhoneVerificationToken(token, {
        newPhoneNumber: phoneNumber,
      })
      .then((res: any) => {
        setLoading(false);
        if (res?.data?.succeeded) {
          // If response includes duration, use it; otherwise keep current duration
          if (res?.data?.duration) {
            dispatch(setResetCodeDuration(res.data.duration));
          }
          resetTimer();
          toast.show("Verification code sent successfully", {
            type: "success",
            duration: 4000,
          });
          return;
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          return router.push("/Onboarding");
        }

        return toast.show(`${res?.message || res?.detail || "Failed to resend code"}`, {
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

    let data = {
      verificationCode: verificationCode,
    };
    identityServices
      .phoneNumberVerificationValidate(token, data)
      .then((res: any) => {
        setIsLoading(false);

        if (res?.status === 200) {
          // Trigger profile refetch to update phone number in UI
          dispatch(setRefetchUserState(true));
          dispatch(setTemporaryRoute("/AccountOTPSettings"));
          setIsSuccessful(true);
          return;
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          return router.push("/Onboarding");
        }

        return toast.show(`${res?.message || res?.detail || "Invalid verification code"}`, {
          type: "danger",
          duration: 4000,
        });
      })
      .catch((error: any) => {
        setIsLoading(false);
        return toast.show(`An error occurred. Please try again later.`, {
          type: "danger",
          duration: 4000,
        });
      });
  };

  const formatted = moment.utc(countdown * 1000).format("mm:ss");

  return isSuccessful ? (
    <SuccessPage
      title="Phone number confirmed"
      subTitle="Phone number verification successful."
      customBottomComponent={
        <View>
          <View style={styles.openMailBtnView}>
            <CustomButton
              title="Done"
              buttonStyle={styles.mailBtn}
              textStyle={styles.mailBtnText}
              onPress={() => router.push("/accountDetails")}
            />
          </View>
        </View>
      }
    />
  ) : (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <StackHeader
          title=""
          onPress={() => router.back()}
          containerStyle={{ backgroundColor: Colors.light.background }}
        />
        <View style={[defaultStyles.container, { marginTop: 0, margin: 0, padding: 16 }]}>
        <Text style={defaultStyles.header}>Enter OTP</Text>
        <Text style={defaultStyles.descriptionText}>
          Enter the code sent to your phone number
        </Text>

        <View style={styles.inputWrapper}>
          <CustomOtpInput
            otpValue={otpValue}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
          />
        </View>

        {/* Countdown Timer / Resend Link */}
        <View style={styles.resendWrapper}>
          {showResend ? (
            <TouchableOpacity onPress={loading ? () => {} : handleResendCode}>
              <Text style={styles.resendText}>
                Haven't received any code?{" "}
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
    </SafeAreaView>
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
  openMailBtnView: {
    marginBottom: 10,
  },
  mailBtn: {
    backgroundColor: "#FF3B4A",
    padding: 14,
    borderRadius: 12,
  },
  doneBtn: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
  },
  mailBtnText: {
    textAlign: "center",
    width: "100%",
    color: "white",
    fontSize: 16,
    fontFamily: "DMSansMedium",
  },
  doneBtnText: {
    textAlign: "center",
    width: "100%",
    color: "#FF3B4A",
    fontSize: 16,
    fontFamily: "DMSansMedium",
  },
});

export default AccountOTPSettings;

