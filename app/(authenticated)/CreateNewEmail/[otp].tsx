import { useFormik } from "formik";
import * as Yup from "yup";
import AppTextInput from "@components/AppTextInput";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import PasswordCheckList from "@components/PasswordCheckList";
import identityServices from "@services/features/identity-service/loginService";
import {
  setProfile,
  setRefetchUserState,
} from "@redux/slice/profile/profileSlice";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { capitalizeFirstLetter } from "@helper/capiterlize-first-letter";
import { useToast } from "react-native-toast-notifications";
import { useClearStorage } from "@hooks/clear-storage";
import CustomButton from "@components/CustomButton";
import { setTemporaryRoute } from "@redux/slice/temporary-route/temporaryRouteSlice";

const CreateNewEmail = () => {
  const { clearStorage } = useClearStorage();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.userProfileSlice);
  const [loading, setLoading] = useState(false);
  const { otp }: any = useLocalSearchParams();
  const createEmailValidationSchema = Yup?.object()?.shape({
    email: Yup.string().required("Required"),
  });

  "otp>>", otp;

  const changeEmailFormik = useFormik({
    validationSchema: createEmailValidationSchema,
    initialValues: {
      email: "",
    },

    onSubmit: async (values: any, { setErrors, setSubmitting }) => {
      //   router.push(`/accountDetails`);
      setLoading(true);
      let data = {
        verificationCode: otp,
        newEmailAddress: values?.email,
      };
      identityServices
        .submitUserCreateNewEmailVerificationCode(token, data)
        .then((res: any) => {
          setLoading(false);
          "res>>", res?.data;

          if (res?.status === 200) {
            dispatch(setRefetchUserState(true));
            dispatch(setTemporaryRoute("/accountDetails"));
            router.push(`/accountDetails`);
            return;
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
          title={"Change Email"}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.bodyTitle}>Create New Email </Text>
        <Text style={styles.bodySubtitle}>
          Enter new email for your account
        </Text>

        <View style={styles.inputViewWrapper}>
          <AppTextInput
            type="email"
            onChangeText={changeEmailFormik.handleChange("email")}
            value={changeEmailFormik?.values?.email}
            error={
              changeEmailFormik.submitCount > 0 &&
              changeEmailFormik.errors.email
            }
            placeholder="Email Address"
            // label="Current Password"
          />
        </View>

        <View style={{ marginTop: 36 }}>
          <CustomButton
            title="Save"
            buttonStyle={styles.btnView}
            textStyle={styles.btnText}
            loader={loading}
            onPress={changeEmailFormik.handleSubmit}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default CreateNewEmail;

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
