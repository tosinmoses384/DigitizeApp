import CustomButton from "@components/CustomButton";
import NewBottomModal from "@components/NewBottomModal";
import StoryView from "@components/StoryComp/Stories/StoryView";
import { SIZES } from "@constants/Colors";
import { useFormik } from "formik";
import * as Yup from "yup";

import React, { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { View } from "react-native";
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
import { CommonActions } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import UserAddIcon from "../assets/images/svg/add-user-plus.svg";
import { useClearStorage } from "@hooks/clear-storage";
import { useAuth } from "@providers/AuthProvider";
import TokenStore from "@utils/tokenStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useI18n } from "@hooks/use-i18n";
interface ILogoutModal {
  isShow: boolean;
  onClose: any;
}
const LogoutModal = ({ isShow, onClose }: ILogoutModal) => {
  const { t } = useI18n();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { clearStorage } = useClearStorage();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigation = useNavigation();

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple taps
    
    try {
      setIsLoggingOut(true);
      await logout();
      
      // Close modal first
      onClose?.();
      
      // Clear all storage immediately and directly
      await Promise.all([
        clearStorage(),
        TokenStore.clearTokens(),
        AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userProfile'])
      ]);
      
      // Clear Redux state immediately
      dispatch(setToken(""));
      dispatch(setProfile(null));
      dispatch(setRefetchUserState(false));
      
      // Call server logout (non-blocking)
      try {
      } catch (error) {
        console.warn('Server logout failed, continuing with local logout:', error);
      }
      
      // Reset navigation stack to Onboarding to prevent going back
      if (navigation.getParent()) {
        navigation.getParent()?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          })
        );
      } else {
        // Fallback if parent navigator is not available
        router.replace("/Onboarding");
      }
      
      // Show success message
      setTimeout(() => {
        toast.show(t('settings.logoutSuccess'), {
          type: "success",
          duration: 2000,
        });
      }, 300);
      
    } catch (error) {
      console.error("Logout error:", error);
      
      // Force navigation even on error
      router.replace("/Onboarding");
      
      toast.show(t('settings.logoutCompleted'), {
        type: "success",
        duration: 2000,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View>
      <NewBottomModal
        isShow={isShow}
        onClose={onClose}
        maxHeight={330}
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
          <View style={styles.iconView}>
            <UserAddIcon />
          </View>
          <Text style={styles.text}>{t('settings.logoutConfirmation')}</Text>
          <View style={styles.btns}>
            <View style={styles.signUp}>
              <CustomButton
                title={t('settings.close')}
                buttonStyle={styles.signUpBtn}
                textStyle={styles.signUpBtnText}
                onPress={onClose}
              />
            </View>
            <View style={styles.login}>
              <CustomButton
                title={isLoggingOut ? t('settings.loggingOut') : t('settings.logout')}
                buttonStyle={[styles.loginBtn, isLoggingOut && styles.loginBtnDisabled]}
                textStyle={styles.loginBtnText}
                onPress={handleLogout}
                disabled={isLoggingOut}
              />
            </View>
          </View>
        </View>
      </NewBottomModal>
    </View>
  );
};

export default LogoutModal;

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
  iconView: {
    paddingVertical: 16,
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    paddingHorizontal: 44,
    textAlign: "center",
    marginBottom: 11,
    color: "rgba(57, 57, 57, 1)",
    fontSize: 16,
    lineHeight: 20,
  },
  btns: {
    flexDirection: "row",
    paddingVertical: 25,
  },
  signUp: {
    width: "50%",
    marginRight: 5,
  },
  login: {
    width: "50%",
    marginLeft: 5,
  },
  signUpBtn: {
    borderWidth: 1.5,
    borderColor: "rgba(33, 44, 61, 1)",
    padding: 14,
    borderRadius: 12,
  },
  signUpBtnText: {
    textAlign: "center",
    width: "100%",
    fontSize: 16,
    color: "rgba(28, 37, 51, 1)",
    fontFamily: "DMSansMedium",
  },
  loginBtn: {
    borderWidth: 1.5,
    borderColor: "rgba(255, 59, 74, 1)",
    backgroundColor: "rgba(255, 59, 74, 1)",
    padding: 14,
    borderRadius: 12,
  },
  loginBtnText: {
    textAlign: "center",
    width: "100%",
    fontSize: 16,
    color: "white",
    fontFamily: "DMSansMedium",
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
});
