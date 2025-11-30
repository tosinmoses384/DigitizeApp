import React, { useCallback, useState, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import moment from "moment";
import { useToast } from "react-native-toast-notifications";

import { VerificationCode } from "@components/verification-code/components/verification-code";
import { useAnimatedShake } from "@hooks/use-animated-shake";
import type { StatusType } from "@components/verification-code/components/verification-code/animated-code-number";
import Keypad from "@components/KeyboardDigits";
import FilledButton from "@components/buttons/Filled_button";
import StackHeader from "@components/StackHeader";

interface OtpVerificationScreenProps {
  title: string;
  subtitle: string;
  resendCodeDuration: number;
  onBack: () => void;
  onSubmit: (otp: string) => Promise<{ success: boolean; message?: string }>;
  onResend: () => Promise<{ success: boolean; message?: string }>;
  onSuccess: (otp: string) => void;
}

const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  title,
  subtitle,
  resendCodeDuration,
  onBack,
  onSubmit,
  onResend,
  onSuccess,
}) => {
  const [code, setCode] = useState<number[]>([]);
  const [showResend, setShowResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(
    Math.floor(moment.duration(resendCodeDuration, "minutes").asSeconds())
  );
  const verificationStatus = useSharedValue<StatusType>("inProgress");
  const toast = useToast();

  const { shake } = useAnimatedShake();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const countdownDisplay = useMemo(() => {
    if (countdown <= 0) return "00:00";
    const minutes = Math.floor(countdown / 60);
    const seconds = Math.floor(countdown % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [countdown]);

  const countdownText = useMemo(() => {
    if (countdown <= 0) {
      return "OTP expired";
    }
    return `OTP expires in ${countdownDisplay}`;
  }, [countdown, countdownDisplay]);

  const resetCode = useCallback(() => {
    setTimeout(() => {
      verificationStatus.value = "inProgress";
      setCode([]);
    }, 1000);
  }, [verificationStatus]);

  const resetTimer = useCallback(() => {
    setCountdown(
      Math.floor(moment.duration(resendCodeDuration, "minutes").asSeconds())
    );
    setShowResend(false);
  }, [resendCodeDuration]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            setShowResend(true);
            return 0;
          }
          return Math.floor(prevCountdown - 1);
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [countdown]);

  const handleSubmitOtp = async (codeToSubmit?: number[]) => {
    setIsLoading(true);
    const currentCode = codeToSubmit || code;
    const verificationCode = currentCode.join("");

    if (currentCode.length !== maxCodeLength) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await onSubmit(verificationCode);
      if (result.success) {
        verificationStatus.value = "correct";
        setCountdown(0);
        onSuccess(verificationCode);
      } else {
        verificationStatus.value = "wrong";
        shake();
        toast.show(result.message || "Invalid OTP. Please try again.", {
          type: "danger",
        });
        resetCode();
      }
    } catch (error) {
      verificationStatus.value = "wrong";
      shake();
      toast.show("An unexpected error occurred. Please try again.", {
        type: "danger",
      });
      resetCode();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    const result = await onResend();
    if (result.success) {
      resetTimer();
    }
    setLoading(false);
  };

  const maxCodeLength = 4;

  const handleKeyPress = useCallback(
    async (key: string) => {
      if (key === "delete") {
        setCode((prev) => prev.slice(0, -1));
        verificationStatus.value = "inProgress";
        return;
      }

      const numKey = parseInt(key);
      if (isNaN(numKey)) return;

      if (code.length >= maxCodeLength) return;

      const newCode = [...code, numKey];
      setCode(newCode);

      if (newCode.length === maxCodeLength) {
        await handleSubmitOtp(newCode);
      }
    },
    [code, maxCodeLength, handleSubmitOtp, verificationStatus]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader
        containerStyle={{ backgroundColor: "white" }}
        title=""
        onPress={onBack}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.headerText}>{title}</Text>
        <Text style={styles.subtitleText}>{subtitle}</Text>

        <View style={styles.inputContainer}>
          <VerificationCode
            status={verificationStatus}
            code={code}
            maxLength={maxCodeLength}
          />
        </View>

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
            <Text style={styles.countdownText}>{countdownText}</Text>
          )}
        </View>

        <View style={{ paddingVertical: 10, marginTop: 50 }}>
          <FilledButton
            title="Continue"
            onPress={() => {
              if (code.length === maxCodeLength) {
                handleSubmitOtp();
              }
            }}
            disable={code.length !== maxCodeLength || isLoading}
            loading={isLoading}
          />
        </View>
      </View>
      <Keypad onKeyPress={handleKeyPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  headerText: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: "700",
    fontFamily: "DMSansBold",
    color: "#212b36",
    textAlign: "left",
  },
  subtitleText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "DMSansRegular",
    color: "#637381",
    textAlign: "left",
  },
  inputContainer: {
    marginTop: 40,
  },
  resendWrapper: {
    marginTop: 110,
  },
  resendText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "left",
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

export default OtpVerificationScreen;
