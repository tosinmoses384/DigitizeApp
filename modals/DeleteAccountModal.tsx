import CustomButton from "@components/CustomButton";
import NewBottomModal from "@components/NewBottomModal";
import { useFormik } from "formik";
import * as Yup from "yup";

import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CloseIcon from "../assets/images/svg/x-close.svg";

import { useToast } from "react-native-toast-notifications";
import AppTextInput from "@components/AppTextInput";
import CheckboxInput from "@components/CheckboxInput";
import identityServices from "@services/features/identity-service/loginService";
import {
  setProfile,
  setRefetchUserState,
  setToken,
} from "@redux/slice/profile/profileSlice";
import { setTemporaryRoute } from "@redux/slice/temporary-route/temporaryRouteSlice";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { router } from "expo-router";
import { useI18n } from "@hooks/use-i18n";
import { useClearStorage } from "@hooks/clear-storage";
import { useAuth } from "@providers/AuthProvider";
import TokenStore from "@utils/tokenStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface IDeleteAccountModal {
  isShow: boolean;
  onClose: any;
}
const DeleteAccountModal = ({ isShow, onClose }: IDeleteAccountModal) => {
  const { t } = useI18n();
  const toast = useToast();
  const { token, profile } = useAppSelector((state) => state.userProfileSlice);
  const dispatch = useAppDispatch();
  const { clearStorage } = useClearStorage();
  const { logout } = useAuth();
  const [loader, setLoader] = useState(false);

  const [isChecked, setIsChecked] = useState(false);

  const addItemsValidationSchema = Yup?.object()?.shape({
    details: Yup.string().required(t('settings.required')),
  });

  const addItemFormik = useFormik({
    validationSchema: addItemsValidationSchema,
    initialValues: {
      details: "",
    },
    onSubmit: async (values: any) => {
      if (!isChecked) {
        return toast.show(
          t('settings.mustConfirmTransactions'),
          {
            type: "danger",
            duration: 4000,
          }
        );
      }
      setLoader(true);
      const isCancellingDeletion = profile?.isScheduledToBeDeleted;
      let deleteAccount = isCancellingDeletion
        ? identityServices?.cancelDeleteUserAccount(token)
        : identityServices?.deleteUserAccount(token);
      deleteAccount
        ?.then(async (res: any) => {
          const isSuccessfulDeletion =
            res?.status === 200 ||
            res?.status === 204 ||
            res?.responseCode === 200 ||
            res?.responseCode === "200";

          setLoader(false);

          if (isSuccessfulDeletion) {
            onClose?.();

            if (!isCancellingDeletion) {
              try {
                await Promise.all([
                  clearStorage(),
                  TokenStore.clearTokens(),
                  AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userProfile'])
                ]);
                
                dispatch(setToken(""));
                dispatch(setProfile(null));
                dispatch(setRefetchUserState(false));
                
                try {
                  await logout();
                } catch (error) {
                  console.warn('Server logout failed, continuing with local logout:', error);
                }
                
                setTimeout(() => {
                  router.replace("/Onboarding");
                }, 50);
                
                setTimeout(() => {
                  toast.show(t('settings.accountDeletedSuccess'), {
                    type: "success",
                    duration: 3000,
                  });
                }, 300);
              } catch (error) {
                console.error("Logout after delete error:", error);
                setTimeout(() => {
                  router.replace("/Onboarding");
                }, 100);
              }
            } else {
              dispatch(setRefetchUserState(true));
              dispatch(setTemporaryRoute("/accountDetails"));

              return toast.show(res?.detail || t('settings.operationSuccessful'), {
                type: "success",
                duration: 4000,
              });
            }
          } else {
            if (res?.responseCode === "401" || res?.responseCode === 401) {
              return router.push("/Onboarding");
            }
            return toast.show(res?.detail || t('settings.operationFailed'), {
              type: "danger",
              duration: 4000,
            });
          }
        })
        .catch((error) => {
          setLoader(false);
        });
    },
  });


  return (
    <View>
      <NewBottomModal
        isShow={isShow}
        onClose={onClose}
        maxHeight={468}
        contentStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 0,
          width: "100%", // Or a specific width (e.g., '80%')
          flex: 1,
        }}
      >
        <View style={styles.body}>
          <Pressable
            style={({ pressed }) => [
              styles.closeIcon,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
          >
            <CloseIcon />
          </Pressable>

          <Text style={styles.optionBodyTitle}>
            {profile?.isScheduledToBeDeleted
              ? t('settings.cancelDeleteAccountAction')
              : t('settings.deleteMyAccount')}
          </Text>
          <Text style={styles.optionBodysubTitle}>{t('settings.helpUsImprove')}</Text>
          <View style={{ marginBottom: 12 }}>
            <AppTextInput
              isMultiline
              onChangeText={addItemFormik.handleChange("details")}
              value={addItemFormik?.values?.details}
              error={
                addItemFormik.submitCount > 0 && addItemFormik.errors.details
              }
              placeholder={
                profile?.isScheduledToBeDeleted
                  ? t('settings.tellUsWhyCancelDelete')
                  : t('settings.tellUsWhyClosingAccount')
              }
            />
          </View>
          <View style={styles.checkAndTextView}>
            <Text style={styles.checkAndText}>
              {t('settings.confirmTransactionsCompleted')}
            </Text>
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.1 }]}
              onPress={() => setIsChecked(!isChecked)}
            >
              <CheckboxInput checked={isChecked} />
            </Pressable>
          </View>
          <Text style={styles.bottomText}>
            {t('settings.deleteAccountWarning')}
          </Text>
          <View style={{ marginTop: 16 }}>
            <CustomButton
              title={
                profile?.isScheduledToBeDeleted
                  ? t('settings.cancelDeleteAccount')
                  : t('settings.deleteAccount')
              }
              buttonStyle={styles.deleteBtn}
              textStyle={styles.deleteBtnText}
              onPress={addItemFormik.handleSubmit}
              loader={loader}
            />
          </View>
        </View>
      </NewBottomModal>
    </View>
  );
};

export default DeleteAccountModal;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#f9fefc",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    zIndex: 3,
    right: 16,
    top: 16,
  },
  pressed: {
    opacity: 0.5,
  },
  optionBody: {
    marginTop: 10,
  },
  optionBodyTitle: {
    fontSize: 16,
    color: "#1E2226",
    marginBottom: 8,
    fontFamily: "DMSansSemiBold",
  },
  optionBodysubTitle: {
    fontSize: 14,
    color: "#6B727E",
    fontFamily: "DMSansSemiBold",
    marginBottom: 16,
  },
  checkAndTextView: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkAndText: {
    flex: 1,
    fontSize: 14,
    color: "#637381",
    marginRight: 8,
  },
  bottomText: {
    fontSize: 10,
    color: "#464F5D",
  },
  deleteBtn: {
    backgroundColor: "#D4313E",
    padding: 14,
    borderRadius: 12,
  },
  deleteBtnText: {
    textAlign: "center",
    width: "100%",
    color: "white",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
  },
});
