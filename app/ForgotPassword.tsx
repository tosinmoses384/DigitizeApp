import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";
import { defaultStyles } from "../constants/Styles";
import { Colors, SIZES } from "../constants/Colors";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import { useAuthStore } from "../store/store";
import FilledButton from "../components/buttons/Filled_button";
import StackHeader from "../components/StackHeader";
import { useToast } from "react-native-toast-notifications";
import { setResetCodeDuration } from "@redux/slice/profile/profileSlice";
import { useAppDispatch } from "@redux/store";
import { useI18n } from "@hooks/use-i18n";

const ForgotPassword = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('auth.validEmailRequired'))
      .required(t('auth.emailRequired')),
  });
  const [focusedField, setFocusedField] = useState(""); // Managing focused field
  const keyboardVerticalOffset = Platform.OS === "ios" ? 80 : 0;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const setUserName = useAuthStore((state) => state.setUsername);
  const toast = useToast();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <Formik
        initialValues={{ email: "" }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          setIsLoading(true);

          try {
            // Call the password reset API with Axios
            const response = await axios.post(
              `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account-recovery/request-password-reset`,
              {
                emailAddress: values.email,
              }
            );

            const data = response.data;

            // Handle successful response
            if (data?.data?.succeeded) {
              toast.show(
                `Success: ${data.message}. Code sent for password reset.`,
                {
                  type: "success",
                  duration: 4000,
                }
              );

              dispatch(setResetCodeDuration(response?.data?.data?.duration));
              router.push({
                pathname: "/ForgotPassword2",
                params: { email: values.email },
              });
            } else {
              toast.show(
                data.message || "Password reset failed. Please try again.",
                {
                  type: "danger",
                  duration: 4000,
                }
              );
            }
          } catch (error) {
            let errorMessage = t('errors.somethingWentWrong');

            if (error.response) {
              const { status, data } = error.response;

              if (status === 400) {
                if (data.detail === "User does not exist") {
                  errorMessage =
                    "This email address does not exist. Please check and try again.";
                } else if (data.errors?.model) {
                  errorMessage = data.errors.model[0]; // Log the first error from the model
                } else {
                  errorMessage = data.message || "Please check your input.";
                }
              } else if (status >= 500) {
                errorMessage =
                  "An error occurred on the server. Please try again later.";
              }
            } else if (error.request) {
              errorMessage =
                "Unable to connect to the server. Please check your internet connection.";
            } else {
            }

            toast.show(errorMessage, {
              type: "danger",
              duration: 4000,
            });
          } finally {
            setIsLoading(false);
          }
        }}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isValid,
          dirty,
        }) => (
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop:
                Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
            }}
          >
            <StackHeader title="" onPress={() => {
              router.replace("/Onboarding");
            }} />
            <Text style={defaultStyles.header}>{t('auth.enterEmailAddress')}</Text>
            <Text style={defaultStyles.descriptionText}>
              {t('auth.sendCodeToReset')}
            </Text>
            <View style={{ marginVertical: 30 }}>
              {/* Email */}
              <View
                style={[
                  styles.inputContainer,
                  touched.email && errors.email
                    ? styles.inputContainerError
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.placeholder,
                    focusedField === "email" || values.email
                      ? styles.placeholderFocused
                      : null,
                  ]}
                >
                  {t('auth.emailAddress')}
                </Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={
                    focusedField === "email" || values.email ? "" : " "
                  }
                  placeholderTextColor={Colors.light.disabled}
                  value={values.email}
                  onBlur={() => {
                    setFocusedField(null);
                    handleBlur("email");
                  }}
                  onFocus={() => setFocusedField("email")}
                  // onChangeText={handleChange("email")}
                  onChangeText={(text) => {
                    const lowerCaseEmail =
                      text.charAt(0).toLowerCase() + text.slice(1);
                    handleChange("email")(lowerCaseEmail);
                  }}
                  selectionColor={"#aaa7a7"}
                />
              </View>
              {touched.email && errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Continue Button */}
            <View style={{ paddingVertical: 10 }}>
              <FilledButton
                title={t('common.continue')}
                onPress={handleSubmit}
                disable={!dirty}
                loading={isLoading}
                style={{ width: "100%" }}
              />
            </View>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 20,
    flexDirection: "row",
    backgroundColor: "#919EAB14",
    borderRadius: 12,
    borderColor: "transparent",
  },
  inputContainerError: {
    borderColor: "red",
    borderWidth: 1,
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
  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 14,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  newToText: {
    fontSize: 16,
    color: Colors.light.black,
    fontFamily: "DMSansRegular",
  },
  signUpText: {
    fontSize: 16,
    color: Colors.light.colorText,
    fontFamily: "DMSansBold",
    textDecorationLine: "underline",
  },
});
