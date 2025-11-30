import React, { useCallback, useState, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useSharedValue } from "react-native-reanimated";
import moment from "moment";
import { useToast } from "react-native-toast-notifications";
import { Ionicons } from "@expo/vector-icons";
import { VerificationCode } from "@components/verification-code/components/verification-code";
import { useAnimatedShake } from "@hooks/use-animated-shake";
import type { StatusType } from "@components/verification-code/components/verification-code/animated-code-number";
import Keypad from "@components/KeyboardDigits";
import { useI18n } from "../../hooks/use-i18n";
import { COLORS, primaryBase, red } from "../../constants/Colors";

interface LoginOtpScreenProps {
  email: string;
  onBack: () => void;
  onSubmit: (otp: string) => Promise<{ success: boolean; message?: string }>;
  onResend: () => Promise<{ success: boolean; message?: string }>;
  onSuccess: () => void;
  onEditEmail?: () => void;
  resendCodeDuration?: number;
  context?: 'login' | 'signup';
  maxCodeLength?: number;
}

const LoginOtpScreen: React.FC<LoginOtpScreenProps> = React.memo(({
  email,
  onBack,
  onSubmit,
  onResend,
  onSuccess,
  onEditEmail,
  resendCodeDuration = 5,
  context = 'login',
  maxCodeLength: maxCodeLengthProp,
}) => {
  const { t } = useI18n();
  const maxCodeLength = maxCodeLengthProp || 6;
  const [code, setCode] = useState<number[]>([]);
  const [showResend, setShowResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(
    Math.floor(moment.duration(resendCodeDuration, "minutes").asSeconds())
  );
  const [clipboardCode, setClipboardCode] = useState<string | null>(null);
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
      return t('auth.otp.expired');
    }
    return t('auth.otp.expiresIn', { time: countdownDisplay });
  }, [countdown, countdownDisplay, t]);

  const countdownColor = useMemo(() => {
    if (countdown <= 0) return red;
    if (countdown < 30) return red;
    if (countdown < 60) return "#F59E0B";
    return COLORS.darkGray;
  }, [countdown]);

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

  const checkClipboardForCode = useCallback(async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      const digits = clipboardContent.replace(/\D/g, '');
      
      if (digits.length === maxCodeLength) {
        setClipboardCode(digits);
      } else {
        setClipboardCode(null);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Clipboard check error:", error);
      }
      setClipboardCode(null);
    }
  }, [maxCodeLength]);

  useEffect(() => {
    checkClipboardForCode();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkClipboardForCode]);

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

  const handleSubmitOtp = useCallback(async (codeToSubmit?: number[]) => {
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
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setCountdown(0);
        onSuccess();
      } else {
        verificationStatus.value = "wrong";
        shake();
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        toast.show(result.message || t('auth.otp.invalidOtp'), {
          type: "danger",
        });
        resetCode();
      }
    } catch (error) {
      if (__DEV__) {
        console.error("OTP verification error:", error);
      }
      verificationStatus.value = "wrong";
      shake();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      toast.show(t('auth.otp.verificationFailed'), {
        type: "danger",
      });
      resetCode();
    } finally {
      setIsLoading(false);
    }
  }, [code, maxCodeLength, onSubmit, onSuccess, verificationStatus, shake, toast, resetCode, t]);

  const handleResendCode = useCallback(async () => {
    setLoading(true);
    try {
      const result = await onResend();
      if (result.success) {
        resetTimer();
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        toast.show(t('auth.otp.otpSentSuccess'), {
          type: "success",
        });
      } else {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        toast.show(result.message || t('auth.otp.resendFailed'), {
          type: "danger",
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Resend OTP error:", error);
      }
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      toast.show(t('auth.otp.resendFailed'), {
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, [onResend, resetTimer, toast, t]);

  const handlePasteFromClipboard = useCallback(async (codeFromClipboard: string) => {
    try {
      if (codeFromClipboard && codeFromClipboard.length === maxCodeLength) {
        const codeArray = codeFromClipboard.split('').map(Number);
        setCode(codeArray);
        setClipboardCode(null);
        
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        
        await handleSubmitOtp(codeArray);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Clipboard paste error:", error);
      }
    }
  }, [maxCodeLength, handleSubmitOtp]);

  const handleKeyPress = useCallback(
    async (key: string) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        accessibilityLabel={t('common.back')}
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={24} color="#212B36" />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Text style={styles.headerText}>
          {context === 'signup' ? t('auth.otp.titleSignup') : t('auth.otp.title')}
        </Text>
        
        <View style={styles.emailContainer}>
          <Text style={styles.subtitleText}>
            {context === 'signup' 
              ? t('auth.otp.subtitleSignup', { email })
              : t('auth.otp.subtitle', { email })
            }
          </Text>
          {onEditEmail && (
            <TouchableOpacity 
              onPress={onEditEmail}
              style={styles.editEmailButton}
              accessibilityLabel={t('auth.otp.editEmail')}
              accessibilityRole="button"
            >
              <Text style={styles.editEmailText}>{t('auth.otp.editEmail')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputContainer}>
          <VerificationCode
            status={verificationStatus}
            code={code}
            maxLength={maxCodeLength}
          />
          
          {!isLoading && code.length === 0 && (
            <Text style={styles.hintText}>{t('auth.otp.autoVerifyHint')}</Text>
          )}

          {isLoading && (
            <View style={styles.verifyingContainer}>
              <ActivityIndicator size="small" color={primaryBase} />
              <Text style={styles.verifyingText}>{t('auth.otp.verifying')}</Text>
            </View>
          )}
        </View>

        {clipboardCode && code.length === 0 && (
          <View style={styles.pasteContainer}>
            <TouchableOpacity 
              onPress={() => handlePasteFromClipboard(clipboardCode)}
              style={[styles.pasteButton, styles.pasteButtonHighlighted]}
              accessibilityLabel={t('auth.otp.pasteCode', { code: `${clipboardCode.slice(0, 2)}••••` })}
              accessibilityRole="button"
            >
              <Ionicons 
                name="checkmark-circle" 
                size={18} 
                color={COLORS.deepGreen} 
              />
              <Text style={[styles.pasteText, styles.pasteTextHighlighted]}>
                {t('auth.otp.pasteCode', { code: `${clipboardCode.slice(0, 2)}••••` })}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.resendWrapper}>
          <View style={styles.countdownContainer}>
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={countdownColor} 
              style={styles.countdownIcon}
            />
            <Text style={[styles.countdownText, { color: countdownColor }]}>
              {countdownText}
            </Text>
          </View>

          {(showResend || countdown < 120) && (
            <TouchableOpacity 
              onPress={loading || !showResend ? undefined : handleResendCode}
              disabled={loading || !showResend}
              style={styles.resendButton}
              accessibilityLabel={t('auth.otp.resendCode')}
              accessibilityRole="button"
            >
              <Text style={styles.resendQuestion}>
                {t('auth.otp.resendQuestion')}{" "}
              </Text>
              <Text style={[
                styles.resendLink,
                (!showResend || loading) && styles.resendLinkDisabled
              ]}>
                {loading 
                  ? t('common.loading') 
                  : showResend 
                    ? t('auth.otp.resendCode')
                    : t('auth.otp.resendWait', { time: countdownDisplay })
                }
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Keypad onKeyPress={handleKeyPress} />
    </KeyboardAvoidingView>
  );
});

LoginOtpScreen.displayName = 'LoginOtpScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  backButton: {
    padding: 16,
    paddingTop: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  headerText: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: "700",
    fontFamily: "DMSansBold",
    color: "#212b36",
    textAlign: "left",
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 12,
  },
  subtitleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "DMSansRegular",
    color: "#637381",
    textAlign: "left",
  },
  editEmailButton: {
    paddingVertical: 2,
  },
  editEmailText: {
    fontSize: 14,
    fontFamily: "DMSansMedium",
    color: primaryBase,
  },
  inputContainer: {
    marginTop: 40,
    minHeight: 120,
  },
  verifyingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 8,
  },
  verifyingText: {
    fontSize: 14,
    fontFamily: "DMSansRegular",
    color: COLORS.darkGray,
  },
  hintText: {
    fontSize: 12,
    fontFamily: "DMSansRegular",
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 16,
  },
  pasteContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  pasteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  pasteButtonHighlighted: {
    backgroundColor: "#E8F5E9",
    borderColor: COLORS.deepGreen,
  },
  pasteText: {
    fontSize: 14,
    fontFamily: "DMSansMedium",
  },
  pasteTextHighlighted: {
    color: COLORS.deepGreen,
  },
  resendWrapper: {
    marginTop: 40,
    gap: 12,
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  countdownIcon: {
    marginTop: 1,
  },
  countdownText: {
    fontSize: 15,
    fontFamily: "DMSansMedium",
  },
  resendButton: {
    alignItems: "center",
  },
  resendQuestion: {
    fontSize: 14,
    fontFamily: "DMSansRegular",
    color: COLORS.darkGray,
  },
  resendLink: {
    color: primaryBase,
    fontFamily: "DMSansMedium",
    fontSize: 15,
  },
  resendLinkDisabled: {
    color: COLORS.gray2,
  },
});

export default LoginOtpScreen;

