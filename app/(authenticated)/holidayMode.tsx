import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors, SIZES } from "../../constants/Colors";
import StackHeader from "../../components/StackHeader";
import ToggleSwitch from "toggle-switch-react-native";
import { router } from "expo-router";
import { fontSz } from "../../constants";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { useAppSelector } from "@redux/store";
import CustomButton from "@components/CustomButton";
import { useToast } from "react-native-toast-notifications";
import AppTabWrapper from "@components/AppTabWrapper";
import CustomToastNotification from "@helper/toast-message";
import { useI18n } from "@hooks/use-i18n";

const holidayMode: React.FC = () => {
  const { t } = useI18n();
  const toast = useToast();
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  const [isDiscountEnabled, setIsDiscountEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails]: any = useState(null);
  const [toastDetails, setToastDetails]: any = useState(null);

  const getHolidayMode = () => {
    setLoading(true);
    marketplaceServices
      .getSellerSettings(token)
      .then((res: any) => {
        setLoading(false);
        if (res?.status === 200) {
          setDetails(res?.data);
          return;
        }
        if (res?.responseCode === "400" || res?.responseCode === 400) {
          return router.push("/Onboarding");
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (details?.holidayModeStatus === "Enabled") {
      return setIsDiscountEnabled(true);
    }
    setIsDiscountEnabled(false);
  }, [details?.holidayModeStatus]);

  useEffect(() => {
    if (token) {
      getHolidayMode();
    }
  }, [profile]);

  const handleDiscountSelect = () => {
    // setIsDiscountEnabled(false);

    setToastDetails(null);
    setLoading(true);
    let data = {
      reason: "",
    };
    marketplaceServices
      .toggleHolidayMode(data, token)
      .then((res: any) => {
        setLoading(false);
        if (res?.status === 200) {
          if (res?.data?.status === "Enabled") {
            return setIsDiscountEnabled(true);
          }
          setIsDiscountEnabled(false);
          setToastDetails({
            message: t('holidayMode.operationSuccessful'),
            type: "success",
            duration: 4000,
          });
          return;
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
        return setToastDetails({
          message: `${res?.detail || res?.Message || t('holidayMode.operationFailed')}`,
          type: "error",
          duration: 4000,
        });

        // toast.show(res?.detail || "Operation failed.", {
        //   type: "danger",
        //   duration: 4000,
        // });
      })
      .catch((error) => {
        setLoading(false);
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
        <StackHeader title={t('holidayMode.holidayMode')} onPress={() => router.back()} />
        {toastDetails && (
          <View
            style={{
              position: "absolute",
              right: 0,
              top: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
              left: 0,
            }}
          >
            <CustomToastNotification
              message={toastDetails?.message}
              type={toastDetails?.type}
              autoHideDuration={toastDetails?.duration}
            />
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.headerText}>{t('holidayMode.hideMyItems')}</Text>
          <ToggleSwitch
            isOn={isDiscountEnabled}
            onColor="#FF3B4A"
            offColor="#CBD6E0"
            labelStyle={{ color: "black", fontWeight: "900" }}
            size="medium"
            onToggle={(isOn: boolean) => {
              // if (isOn) {
              return handleDiscountSelect();
              // }
              // setIsDiscountEnabled(isOn);
            }}
            disabled={loading}
          />
        </View>

        {isDiscountEnabled && (
          <View style={styles.bottomContainer}>
            <View>
              <Text
                style={{
                  color: "#07090C",
                  fontFamily: "DMSansMedium",
                  fontSize: fontSz(14),
                }}
              >
                {t('holidayMode.holidayModeIsOn')}
              </Text>
              <Text
                style={{
                  color: "#6B727E",
                  fontFamily: "DMSansRegular",
                  fontSize: fontSz(14),
                }}
              >
                {t('holidayMode.yourItemsAreHidden')}
              </Text>
            </View>
            <View>
              <CustomButton
                title={t('holidayMode.switchOff')}
                buttonStyle={styles.discountButton}
                textStyle={styles.discountText}
                onPress={handleDiscountSelect}
                loader={loading}
              />
              {/* <TouchableOpacity
              style={styles.discountButton}
              onPress={handleDiscountSelect}
            >
              <Text style={styles.discountText}>Switch Off</Text>
            </TouchableOpacity> */}
            </View>
          </View>
        )}
      </View>
    </AppTabWrapper>
  );
};

export default holidayMode;

const styles = StyleSheet.create({
  headerText: {
    fontSize: fontSz(14),
    marginVertical: 10,
    fontFamily: "DMSansMedium",
    color: "#393939",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  discountButton: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#FF3B4A",
    borderRadius: 10,
    marginTop: 10,
  },
  discountText: {
    color: "#FFF",
    fontSize: fontSz(16),
    fontFamily: "DMSansMedium",
    textAlign: "center",
  },
});
