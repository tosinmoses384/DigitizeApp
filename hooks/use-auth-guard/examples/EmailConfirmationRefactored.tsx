import { useFormik } from "formik";
import * as Yup from "yup";
import AppTextInput from "@components/AppTextInput";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import PasswordCheckList from "@components/PasswordCheckList";
import identityServices from "@services/features/identity-service/loginService";
import {
  setProfile,
  setResetCodeDuration,
} from "@redux/slice/profile/profileSlice";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { useToast } from "react-native-toast-notifications";
import CustomButton from "@components/CustomButton";
import { withAuthGuard } from "@hooks/use-auth-guard/withAuthGuard";
import { useApiService } from "@hooks/use-auth-guard/useApiService";

const EmailConfirmationComponent = () => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.userProfileSlice);
  const { callApiWithLoading } = useApiService();
  const [loading, setLoading] = useState(false);

  const handleSendVerification = async () => {
    await callApiWithLoading(
      (token) => identityServices.confirmEmailVerification(token),
      setLoading,
      {
        onSuccess: (res: any) => {
          if (res?.data?.succeeded) {
            dispatch(setResetCodeDuration(res?.data?.duration));
            router.push(`/EmailConfirmationOtp`);
            toast.show(res?.message, {
              type: "success",
              duration: 4000,
            });
          } else {
            toast.show(`${res?.message || res?.detail}`, {
              type: "danger",
              duration: 4000,
            });
          }
        },
        onError: (error: any) => {
          toast.show(`An error occurred. Please try again later.`, {
            type: "danger",
            duration: 4000,
          });
        }
        // Auth errors (401) are handled automatically by the guard
      }
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={"Confirm Change"}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.bodySubtitle}>
          You need to confirm {profile?.emailAddress} is your email address
          before you can update it
        </Text>

        <View style={{ marginTop: 36 }}>
          <CustomButton
            title="Send confirmation email"
            buttonStyle={styles.btnView}
            textStyle={styles.btnText}
            loader={loading}
            onPress={handleSendVerification}
          />
        </View>
        <Text style={styles.bottomText}>I don't have access to this mail</Text>
      </ScrollView>
    </View>
  );
};

// Wrap component with auth guard for automatic protection
const EmailConfirmation = withAuthGuard(EmailConfirmationComponent, {
  loadingMessage: "Loading email confirmation...",
  requireProfile: true,
});

export default EmailConfirmation;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 30,
  },

  bodyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  bodySubtitle: {
    color: "#637381",
    fontSize: 14,
    marginBottom: 24,
    marginTop: 24,
  },

  btnView: {
    backgroundColor: "#FF3B4A",
  },
  btnText: {
    color: "white",
    textAlign: "center",
    width: "100%",
    fontSize: 16,
  },
  bottomText: {
    fontSize: 16,
    color: "#FF3B4A",
    textAlign: "center",
    marginTop: 26,
    fontFamily: "DMSansMedium",
  },
});
