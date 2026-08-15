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
import { setProfile } from "@redux/slice/profile/profileSlice";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { capitalizeFirstLetter } from "@helper/capitalize-first-letter";
import { useToast } from "react-native-toast-notifications";
import { useClearStorage } from "@hooks/clear-storage";
import CustomButton from "@components/CustomButton";
import { useI18n } from "@hooks/use-i18n";

const ChangePassword = () => {
  const { t } = useI18n();
  const { clearStorage } = useClearStorage();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.userProfileSlice);
  const [loading, setLoading] = useState(false);
  const [passwordIsValid, setPasswordIsValid] = useState(false);
  const createPasswordValidationSchema = Yup?.object()?.shape({
    currentPassword: Yup.string().required(t('validation.required')),
    newPassword: Yup.string().required(t('validation.required')),
    rPassword: Yup.string()
      .required(t('validation.required'))
      .oneOf([Yup.ref("newPassword")], t('password.passwordsMustMatch')),
  });

  const createPasswordFormik = useFormik({
    validationSchema: createPasswordValidationSchema,
    initialValues: {
      currentPassword: "",
      newPassword: "",
      rPassword: "",
    },

    onSubmit: async (values: any, { setErrors, setSubmitting }) => {
      if (passwordIsValid) {
        setLoading(true);
        let data = {
          oldPassword: values?.currentPassword,
          newPassword: values?.newPassword,
          confirmPassword: values?.rPassword,
        };

        identityServices
          .changePassword(token, data)
          .then((res: any) => {
            setLoading(false);
            if (res?.data?.isSuccessful) {
              router.push("/Login");
              clearStorage();

              dispatch(setProfile(null));
              return;
            }
            return toast.show(`${res?.message || res?.detail}`, {
              type: "danger",
              duration: 4000,
            });
          })
          .catch((error: any) => {
            setLoading(false);
            return toast.show(t('password.errorOccurred'), {
              type: "danger",
              duration: 4000,
            });
          });
      }
    },
  });

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('password.changePassword')}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.bodyTitle}>{t('password.createNewPassword')}</Text>
        <Text style={styles.bodySubtitle}>
          {t('password.createSecurePassword')}
        </Text>

        <View style={styles.inputViewWrapper}>
          <AppTextInput
            type="password"
            onChangeText={createPasswordFormik.handleChange("currentPassword")}
            value={createPasswordFormik?.values?.currentPassword}
            error={
              createPasswordFormik.submitCount > 0 &&
              createPasswordFormik.errors.currentPassword
            }
            placeholder={t('password.currentPassword')}
            // label={t('password.currentPassword')}
          />
        </View>
        <View style={styles.inputViewWrapper}>
          <AppTextInput
            type="password"
            onChangeText={createPasswordFormik.handleChange("newPassword")}
            value={createPasswordFormik?.values?.newPassword}
            error={
              createPasswordFormik.submitCount > 0 &&
              createPasswordFormik.errors.newPassword
            }
            placeholder={t('password.newPassword')}
            // label={t('password.newPassword')}
          />
        </View>
        <View style={styles.inputViewWrapper}>
          <AppTextInput
            type="password"
            onChangeText={createPasswordFormik.handleChange("rPassword")}
            value={createPasswordFormik?.values?.rPassword}
            error={
              createPasswordFormik.submitCount > 0 &&
              createPasswordFormik.errors.rPassword
            }
            placeholder={t('password.reenterNewPassword')}
            // label={t('password.reenterNewPassword')}
          />
        </View>
        <View style={{ marginTop: 4 }}>
          <PasswordCheckList
            validatePassword={(data: boolean) => setPasswordIsValid(data)}
            password={createPasswordFormik?.values?.newPassword}
          />
        </View>
        <View style={{ marginTop: 36 }}>
          <CustomButton
            title={t('password.changePassword')}
            buttonStyle={styles.btnView}
            textStyle={styles.btnText}
            loader={loading}
            onPress={createPasswordFormik.handleSubmit}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 30,
  },
  saveButtonView: {
    position: "absolute",
    top: 12,
    right: 16,
  },
  bodyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  securityTitlle: {
    fontSize: 20,
    color: "#071827",
    fontFamily: "DMSansMedium",
    marginBottom: 8,
  },
  securitySubtitlle: {
    fontSize: 14,
    color: "#393939",
    marginBottom: 24,
  },
  securityDetailsView: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  bodyTitle: {
    fontSize: 18,
    color: "#212B36",
    fontFamily: "DMSansSemiBold",
    marginBottom: 2,
  },
  bodySubtitle: {
    color: "#637381",
    fontSize: 14,
    marginBottom: 36,
  },
  inputViewWrapper: {
    marginTop: 16,
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
});
