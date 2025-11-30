import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useCallback } from "react";
import { useToast } from "react-native-toast-notifications";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

import { defaultStyles } from "@constants/Styles";
import { Colors } from "@constants/Colors";
import FilledButton from "@components/buttons/Filled_button";
import { fontSz } from "@constants/index";
import identityServices from "@services/features/identity-service/loginService";
import StackHeader from "@components/StackHeader";
import TermsModal from "@components/modals/TermsModal";
import PrivacyModal from "@components/modals/PrivacyModal";

interface SetPasswordScreenProps {
  email: string;
  verificationCode: string;
  onSuccess: () => void;
  onBack: () => void;
  flow?: 'signup' | 'reset'; // Determines which API to call
}

const SetPasswordScreen: React.FC<SetPasswordScreenProps> = ({
  email,
  verificationCode,
  onSuccess,
  onBack,
  flow = 'reset', // Default to reset for backward compatibility
}) => {
  const toast = useToast();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    specialChar: false,
    digit: false,
    lowercase: false,
    uppercase: false,
  });

  const validatePassword = (password: string) => {
    setPasswordRequirements({
      length: password.length >= 6,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      digit: /\d/.test(password),
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
    });
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
  };

  const handleTermsPress = useCallback(() => {
    setShowTermsModal(true);
  }, []);

  const handlePrivacyPress = useCallback(() => {
    setShowPrivacyModal(true);
  }, []);

  const handleCloseTerms = useCallback(() => {
    setShowTermsModal(false);
  }, []);

  const handleClosePrivacy = useCallback(() => {
    setShowPrivacyModal(false);
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!isPolicyAccepted) {
      Alert.alert("Error", "You must accept the terms to continue.");
      setIsLoading(false);
      return;
    }

    if (!Object.values(passwordRequirements).every(Boolean)) {
      Alert.alert("Error", "Password does not meet all the requirements.");
      setIsLoading(false);
      return;
    }

    try {
      let res;
      
      if (flow === 'signup') {
        // Use signup password creation endpoint
        const data = {
          emailAddress: email,
          verificationCode: verificationCode,
          password: password,
        };
        res = await identityServices.createUserPassword(data);
      } else {
        // Use password reset endpoint
        const data = {
          resetCode: verificationCode,
          emailAddress: email,
          newPassword: password,
        };
        res = await identityServices.createNewPasswordReset(data);
      }

      if (res?.responseCode !== "0") {
        toast.show(res.message, { type: "danger", duration: 4000 });
      } else {
        const successMessage = flow === 'signup' 
          ? "Password created successfully." 
          : "Password reset successfully.";
        toast.show(successMessage, { type: "success" });
        onSuccess();
      }
    } catch {
      toast.show("An error occurred. Please try again later.", {
        type: "danger",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={defaultStyles.container}>
          <StackHeader title="" onPress={onBack} />
          <Text style={defaultStyles.header}>
            {flow === 'signup' ? 'Create Password' : 'Reset Password'}
          </Text>
          <Text style={defaultStyles.descriptionText}>
            {flow === 'signup' 
              ? 'Create a secure password for your account'
              : 'Create a new secure password for your account'}
          </Text>

          <View style={{ marginTop: 20 }}>
            <View
              style={[
                styles.inputContainer,
                !Object.values(passwordRequirements).every(Boolean) &&
                password.length > 0
                  ? { borderColor: "red", borderWidth: 1 }
                  : null,
              ]}
            >
              <Text
                style={[
                  styles.placeholder,
                  focusedField === "password" || password
                    ? styles.placeholderFocused
                    : null,
                ]}
              >
                Enter Password
              </Text>

              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onBlur={() => setFocusedField(null)}
                onFocus={() => setFocusedField("password")}
                onChangeText={handlePasswordChange}
                selectionColor={"#6b6464"}
                secureTextEntry={!show}
              />

              <TouchableOpacity
                onPress={() => setShow(!show)}
                style={styles.iconContainer}
              >
                <Ionicons
                  name={show ? "eye" : "eye-off"}
                  size={24}
                  color={Colors.light.disabled}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.passwordRequirementsContainer}>
            <Text
              style={{
                ...styles.passwordRequirementText,
                color: passwordRequirements.length ? "#268727" : "red",
              }}
            >
              • Password must be at least 6 characters long
            </Text>
            <Text
              style={{
                ...styles.passwordRequirementText,
                color: passwordRequirements.specialChar ? "#268727" : "red",
              }}
            >
              • Password must contain at least one special character
            </Text>
            <Text
              style={{
                ...styles.passwordRequirementText,
                color: passwordRequirements.digit ? "#268727" : "red",
              }}
            >
              • Password must contain at least one digit
            </Text>
            <Text
              style={{
                ...styles.passwordRequirementText,
                color: passwordRequirements.lowercase ? "#268727" : "red",
              }}
            >
              • Password must contain at least one lowercase letter
            </Text>
            <Text
              style={{
                ...styles.passwordRequirementText,
                color: passwordRequirements.uppercase ? "#268727" : "red",
              }}
            >
              • Password must contain at least one uppercase letter
            </Text>
          </View>

          <View style={{ flexDirection: "row", marginTop: 15, alignItems: "flex-start" }}>
            <TouchableOpacity
              onPress={() => setIsPolicyAccepted(!isPolicyAccepted)}
              style={styles.radioButton}
              accessibilityLabel="Accept terms and privacy policy"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isPolicyAccepted }}
            >
              <View
                style={[
                  styles.radioButtonIcon,
                  isPolicyAccepted && styles.radioButtonIconSelected,
                ]}
              />
            </TouchableOpacity>
            <Text style={styles.policyText}>
              I confirm that I have read & agree to OneStop{" "}
              <Text
                onPress={handleTermsPress}
                style={{
                  color: "#AA2731",
                  fontFamily: "DMSansBold",
                  fontSize: fontSz(16),
                  textDecorationLine: "underline",
                }}
                accessibilityLabel="View Terms of Service"
                accessibilityRole="button"
              >
                Terms of Service
              </Text>
              {" "}and{" "}
              <Text
                onPress={handlePrivacyPress}
                style={{
                  color: "#AA2731",
                  fontFamily: "DMSansBold",
                  fontSize: fontSz(16),
                  textDecorationLine: "underline",
                }}
                accessibilityLabel="View Privacy Policy"
                accessibilityRole="button"
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </View>

          <View style={{ paddingVertical: 10, marginTop: 60 }}>
            <FilledButton
              title={flow === 'signup' ? 'Create Account' : 'Reset Password'}
              onPress={handleSubmit}
              disable={
                !Object.values(passwordRequirements).every(Boolean) ||
                !isPolicyAccepted
              }
              loading={isLoading}
            />
          </View>
        </View>
      </ScrollView>

      {/* Terms and Conditions Modal */}
      <TermsModal
        visible={showTermsModal}
        onClose={handleCloseTerms}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        visible={showPrivacyModal}
        onClose={handleClosePrivacy}
      />
    </KeyboardAvoidingView>
  );
};

export default SetPasswordScreen;

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 20,
    flexDirection: "row",
    backgroundColor: "#919EAB14",
    borderRadius: 12,
    borderColor: "transparent",
  },
  placeholder: {
    position: "absolute",
    top: "45%",
    left: 20,
    fontFamily: "DMSansMedium",
    fontSize: 18,
    color: Colors.light.disabled,
    transform: [{ translateY: -7 }],
  },
  placeholderFocused: {
    top: 15,
    fontSize: 16,
    color: Colors.light.tint,
    fontFamily: "DMSansMedium",
  },
  input: {
    padding: 20,
    fontSize: 19,
    marginRight: 10,
    flexDirection: "row",
    fontFamily: "DMSansBold",
    top: 10,
    color: "#212B36",
  },
  iconContainer: {
    justifyContent: "center",
    paddingRight: 10,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.disabled,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioButtonIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  radioButtonIconSelected: {
    backgroundColor: Colors.light.primaryBase,
  },
  policyText: {
    color: Colors.light.tint,
    fontSize: fontSz(16),
    fontFamily: "DMSansRegular",
    paddingRight: 20,
  },
  passwordRequirementsContainer: {
    marginTop: 10,
  },
  passwordRequirementText: {
    fontSize: 14,
    color: "#1C2533",
    fontFamily: "DMSansRegular",
    marginBottom: 5,
  },
});
