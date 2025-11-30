import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { Colors, SIZES } from "../../constants/Colors";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import ToggleSwitch from "toggle-switch-react-native";
import FilledButton from "../../components/buttons/Filled_button";
import BottomSheetModal, {
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import TextButton from "../../components/buttons/Text_button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "@components/CustomButton";
import AppTabWrapper from "@components/AppTabWrapper";
import { useAppSelector } from "@redux/store";
import identityServices from "@services/features/identity-service/loginService";
import CustomToastNotification from "@helper/toast-message";
import { useI18n } from "@hooks/use-i18n";

const CookieSettings = () => {
  const { t } = useI18n();
  const { profile, token } = useAppSelector((state) => state?.userProfileSlice);
  const [isFunctionalEnabled, setIsFunctionalEnabled] = useState(false);
  const [isTargetingEnabled, setIsTargetingEnabled] = useState(false);
  const [isSocialMediaEnabled, setIsSocialMediaEnabled] = useState(false);
  const [toastDetails, setToastDetails]: any = useState(null);

  const bottomSheetRef: any = useRef<BottomSheetModal>(null);
  const [loader, setLoader] = useState(false);

  const getCookeies = () => {
    if (token) {
      identityServices
        ?.getCookiesSettings(token)
        .then((res: any) => {
          if (res?.status === 200) {
            setIsFunctionalEnabled(res?.data?.allowFunctionalCookies);
            setIsTargetingEnabled(res?.data?.allowTargetingCookies);
            setIsSocialMediaEnabled(res?.data?.allowSocialMediaCookies);

            return;
          }
          if (res?.responseCode === 401) {
            router.replace({ pathname: "/Onboarding" } as any);
            return;
          }
        })
        .catch((error: any) => {});
    }
  };

  useEffect(() => {
    getCookeies();
  }, [token, profile]);

  useEffect(() => {
    const openBottomSheet = async () => {
      await bottomSheetRef.current?.present();
    };
    openBottomSheet();
  }, []);

  // const saveSettings = async () => {
  //   const settings = {
  //     isFunctionalEnabled,
  //     isTargetingEnabled,
  //     isSocialMediaEnabled,
  //   };
  //   try {
  //     await AsyncStorage.setItem("cookieSettings", JSON.stringify(settings));
  //   } catch (error) {
  //     console.error("Failed to save settings to AsyncStorage:", error);
  //   }
  // };

  const handleSubmit = () => {
    setToastDetails(null);
    const data = {
      allowFunctionalCookies: isFunctionalEnabled,
      allowTargetingCookies: isTargetingEnabled,
      allowSocialMediaCookies: isSocialMediaEnabled,
    };
    setLoader(true);
    identityServices
      ?.updateCookiesSettings(token, data)
      .then((res: any) => {
        setLoader(false);
        if (res?.status === 200) {
          return setToastDetails({
            message: `Operation Successful.`,
            type: "success",
            duration: 4000,
          });
        }

        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
        return setToastDetails({
          message: `${res?.detail || res?.Message}`,
          type: "error",
          duration: 4000,
        });
      })
      .catch((error: any) => {
        setLoader(false);
      });
  };

  return (
    <AppTabWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          paddingHorizontal: 20,
        }}
      >
        <StackHeader title={t('cookies.cookieSettings')} onPress={() => router.back()} />
        {toastDetails && (
          <View style={{ position: "absolute", right: 0, top: "3%", left: 0 }}>
            <CustomToastNotification
              message={toastDetails?.message}
              type={toastDetails?.type}
              autoHideDuration={toastDetails?.duration}
            />
          </View>
        )}
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ flex: 1, paddingBottom: 40 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {t('cookies.cookiePolicy')}
            </Text>
            <Text style={{ marginVertical: 10 }}>
              {t('cookies.learnMore')}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 10,
              }}
            >
              <Text style={{ color: "#1E2226", fontFamily: "DMSansBold" }}>
                {t('cookies.strictlyNecessaryCookies')}
              </Text>
              <Text style={{ color: "#B5B9BE" }}>{t('common.alwaysActive')}</Text>
            </View>

            <Text style={{ marginVertical: 10 }}>
              {t('cookies.strictlyNecessaryDescription')}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 10,
              }}
            >
              <Text style={{ color: "#1E2226", fontFamily: "DMSansBold" }}>
                {t('cookies.functionalCookies')}
              </Text>
              <ToggleSwitch
                isOn={isFunctionalEnabled}
                onColor="#FF3B4A"
                offColor="#CBD6E0"
                size="medium"
                onToggle={(isOn) => {
                  setIsFunctionalEnabled(isOn);
                  // saveSettings(); // Save settings
                }}
              />
            </View>
            <Text>
              {t('cookies.functionalDescription')}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 10,
              }}
            >
              <Text style={{ color: "#1E2226", fontFamily: "DMSansBold" }}>
                {t('cookies.targetingCookies')}
              </Text>
              <ToggleSwitch
                isOn={isTargetingEnabled}
                onColor="#FF3B4A"
                offColor="#CBD6E0"
                size="medium"
                onToggle={(isOn) => {
                  setIsTargetingEnabled(isOn);
                  // saveSettings(); // Save settings
                }}
              />
            </View>
            <Text>
              {t('cookies.targetingDescription')}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 10,
              }}
            >
              <Text style={{ color: "#1E2226", fontFamily: "DMSansBold" }}>
                {t('cookies.socialMediaCookies')}
              </Text>
              <ToggleSwitch
                isOn={isSocialMediaEnabled}
                onColor="#FF3B4A"
                offColor="#CBD6E0"
                size="medium"
                onToggle={(isOn) => {
                  setIsSocialMediaEnabled(isOn);
                  // saveSettings(); // Save settings
                }}
              />
            </View>
            <Text>
              {t('cookies.socialMediaDescription')}
            </Text>
          </View>
        </ScrollView>

        <View
          style={{
            // paddingHorizontal: 16,
            paddingBottom: 40,
            paddingTop: 16,
            // height: 136,
          }}
        >
          <View
            style={{ flexDirection: "row", flex: 1, gap: 8, marginBottom: 16 }}
          >
            <View style={{ flex: 1 }}>
              <CustomButton
                title={t('cookies.reject')}
                buttonStyle={styles.rejectBtnStyle}
                textStyle={styles.rejectTextStyle}
                onPress={() => {
                  setIsFunctionalEnabled(false);
                  setIsTargetingEnabled(false);
                  setIsSocialMediaEnabled(false);
                  // saveSettings(); // Save settings
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomButton
                title={t('cookies.accept')}
                buttonStyle={styles.allowBtnStyle}
                textStyle={styles.allowBtnTextStyle}
                onPress={() => {
                  setIsFunctionalEnabled(true);
                  setIsTargetingEnabled(true);
                  setIsSocialMediaEnabled(true);
                  // saveSettings(); // Save settings
                }}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 50,
            }}
          >
            <CustomButton
              title={t('cookies.save')}
              textStyle={styles.bottomText}
              onPress={handleSubmit}
              loader={loader}
            />
            {/* <Text style={styles.bottomText}>Confirm my choice</Text> */}
          </View>
        </View>
      </View>
    </AppTabWrapper>
  );
};

export default CookieSettings;

const styles = StyleSheet.create({
  rejectBtnStyle: {
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#FF3B4A",
    borderRadius: 12,
    width: "100%",
    height: 48,
  },
  rejectTextStyle: {
    fontSize: 16,
    color: "#FF3B4A",
    width: "100%",
    textAlign: "center",
  },
  allowBtnStyle: {
    backgroundColor: "#FF3B4A",
    padding: 14,
    borderRadius: 12,
    width: "100%",
    height: 48,
  },
  allowBtnTextStyle: {
    fontSize: 16,
    color: "white",
    width: "100%",
    textAlign: "center",
  },
  bottomText: {
    textAlign: "center",
    color: "#FF3B4A",
    fontSize: 16,
    fontFamily: "DMSansMedium",
  },
});
