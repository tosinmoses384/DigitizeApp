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
  setRefetchUserName,
} from "@redux/slice/profile/profileSlice";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { capitalizeFirstLetter } from "@helper/capitalize-first-letter";
import { useToast } from "react-native-toast-notifications";
import { useClearStorage } from "@hooks/clear-storage";
import CustomButton from "@components/CustomButton";
import CountryCodePicker from "@components/PhoneCode";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { useI18n } from "@hooks/use-i18n";

const ChangeUserName = () => {
  const { t } = useI18n();
  const { clearStorage } = useClearStorage();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const [loader, setLoader] = useState(false);
  const { token, userName } = useAppSelector((state) => state.userProfileSlice);

  const changeUserNameValidationSchema = Yup?.object()?.shape({
    userName: Yup.string().required(t('validation.required')),
  });

  const changeUserNameFormik = useFormik({
    validationSchema: changeUserNameValidationSchema,
    initialValues: {
      userName: capitalizeFirstLetter(userName || "") || "",
    },
    onSubmit: async (values: any, { setErrors, setSubmitting }) => {
      // router.push("/profileDetails");
      setLoader(true);
      let data = {
        username: values?.userName,
      };
  
      let changeUsernameService = wardrobeServices?.changeUsername(data, token);

      changeUsernameService
        ?.then((res: any) => {
          setLoader(false);
          if (res?.status === 200) {
            dispatch(setRefetchUserName(true));
            return toast.show(t('changeUserName.operationSuccessful'), {
              type: "success",
              duration: 4000,
            });
          }

          return toast.show(`${res?.message || res?.detail}`, {
            type: "danger",
            duration: 4000,
          });
        })
        .catch((error: any) => {
          setLoader(false);
        });
    },
  });

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('changeUserName.changeUsername')}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.bodyTitle}>{t('changeUserName.changeUsername')}</Text>
        <Text style={styles.bodySubtitle}>
          {t('changeUserName.enterUniqueUsername')}
        </Text>
        <View style={styles.inputViewWrapper}>
          <View style={styles.inputView}>
            <AppTextInput
              onChangeText={changeUserNameFormik.handleChange("userName")}
              value={changeUserNameFormik?.values?.userName}
              error={
                changeUserNameFormik.submitCount > 0 &&
                changeUserNameFormik.errors.userName
              }
              placeholder={t('changeUserName.username')}
              label={t('changeUserName.username')}
              isShowInnerLabel
            />
          </View>
        </View>

        <View style={{ marginTop: 36 }}>
          <CustomButton
            title={t('common.continue')}
            buttonStyle={styles.btnView}
            textStyle={styles.btnText}
            loader={loader}
            onPress={changeUserNameFormik.handleSubmit}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ChangeUserName;

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
    marginTop: 24,
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
    width: "100%",
  },
  inputViewWrapper: {
    marginTop: 16,
    flexDirection: "row",
  },
  inputView: {
    flex: 1,
    marginLeft: 4,
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
