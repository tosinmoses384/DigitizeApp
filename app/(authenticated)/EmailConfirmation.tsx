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
import { useI18n } from "@hooks/use-i18n";

const EmailConfirmation = () => {
  const { t } = useI18n();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { token, profile } = useAppSelector((state) => state.userProfileSlice);
  const [loading, setLoading] = useState(false);

  const handleSendVerification = () => {
    setLoading(true);

    identityServices
      .confirmEmailVerification(token)
      .then((res: any) => {
        setLoading(false);
        if (res?.data?.succeeded) {
          dispatch(setResetCodeDuration(res?.data?.duration));
          router.push(`/EmailConfirmationOtp`);
          return toast.show(res?.message, {
            type: "success",
            duration: 4000,
          });
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

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('confirmation.confirmChange')}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.bodySubtitle}>
          {t('confirmation.confirmEmailMessage', { email: profile?.emailAddress })}
        </Text>

        <View style={{ marginTop: 36 }}>
          <CustomButton
            title={t('confirmation.sendConfirmationEmail')}
            buttonStyle={styles.btnView}
            textStyle={styles.btnText}
            loader={loading}
            onPress={handleSendVerification}
          />
        </View>
        <Text style={styles.bottomText}>{t('confirmation.noAccessToEmail')}</Text>
      </ScrollView>
    </View>
  );
};

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
