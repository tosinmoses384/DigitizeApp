import { useFormik } from "formik";
import * as Yup from "yup";
import AppTextInput from "@components/AppTextInput";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import PasswordCheckList from "@components/PasswordCheckList";
import identityServices from "@services/features/identity-service/loginService";
import {
  setOldPhoneNumber,
  setProfile,
  setResetCodeDuration,
} from "@redux/slice/profile/profileSlice";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { capitalizeFirstLetter } from "@helper/capitalize-first-letter";
import { useToast } from "react-native-toast-notifications";
import { useClearStorage } from "@hooks/clear-storage";
import CustomButton from "@components/CustomButton";
import CountryCodePicker from "@components/PhoneCode";
import { worldCountries } from "@constants/Constants";
import { sanitizePhoneNumber } from "@utils/phoneValidation";

const ChangePhoneNumber = () => {
  const { clearStorage } = useClearStorage();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { token, profile } = useAppSelector((state) => state.userProfileSlice);
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode]: any = useState("");
  const [countryId, setCountryId]: any = useState("");
  const [newCountryCode, setNewCountryCode] = useState("");
  const [newCountryId, setNewCountryId]: any = useState("");
  const createPasswordValidationSchema = Yup?.object()?.shape({
    oldPhoneNumber: Yup.string().required("Required"),
    newPhoneNumber: Yup.string().required("Required"),
  });

  useEffect(() => {
    if (profile?.countryName) {
      const getCountryCode = worldCountries?.find(
        (list) =>
          list?.label?.toLocaleLowerCase() ===
          profile?.countryName?.toLocaleLowerCase()
      );

      setCountryId(getCountryCode?.id);
      setNewCountryId(getCountryCode?.id);
    }
  }, [profile]);

  const createPasswordFormik = useFormik({
    validationSchema: createPasswordValidationSchema,
    initialValues: {
      oldPhoneNumber: "",
      newPhoneNumber: "",
    },

    onSubmit: async (values: any, { setErrors, setSubmitting }) => {
      setLoading(true);

      let data = {
        currentPhoneNumber: `${values?.oldPhoneNumber}`,
      };
      identityServices
        .changeCurrentPhoneNumberVerificationCode(token, data)
        .then((res: any) => {
          setLoading(false);

          if (res?.data?.succeeded) {
            dispatch(setResetCodeDuration(res?.data?.duration));
            dispatch(setOldPhoneNumber(`${values?.oldPhoneNumber}`));
            router.push(`/ChangePhoneNumberOtp/${values?.newPhoneNumber}`);
            return toast.show(`${res?.message || res?.detail}`, {
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
    },
  });

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={"Change phone number"}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <View style={styles.inputViewWrapper}>
          <CountryCodePicker
            countryCode={countryId}
            getCountryCode={(data: any) => setCountryCode(data)}
            isSelectCountry
            getCountryId={(data: any) => setCountryId(data)}
            selectorHeight={54}
          />

          <View style={styles.inputView}>
            <AppTextInput
              onChangeText={(text) => createPasswordFormik.setFieldValue("oldPhoneNumber", sanitizePhoneNumber(text))}
              value={createPasswordFormik?.values?.oldPhoneNumber}
              error={
                createPasswordFormik.submitCount > 0 &&
                createPasswordFormik.errors.oldPhoneNumber
              }
              placeholder="Old Phone Number"
              keyboardType="phone-pad"
            />
          </View>
        </View>
        <View style={styles.inputViewWrapper}>
          <CountryCodePicker
            countryCode={newCountryId}
            getCountryCode={(data: any) => setNewCountryCode(data)}
            isSelectCountry
            getCountryId={(data: any) => setNewCountryId(data)}
            selectorHeight={54}
          />

          <View style={styles.inputView}>
            <AppTextInput
              onChangeText={(text) => createPasswordFormik.setFieldValue("newPhoneNumber", sanitizePhoneNumber(text))}
              value={createPasswordFormik?.values?.newPhoneNumber}
              error={
                createPasswordFormik.submitCount > 0 &&
                createPasswordFormik.errors.newPhoneNumber
              }
              placeholder="New Phone Number"
              keyboardType="phone-pad"
            />
          </View>
        </View>
        <View style={{ marginTop: 36 }}>
          <CustomButton
            title="Save"
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

export default ChangePhoneNumber;

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
    marginTop: 24,
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
