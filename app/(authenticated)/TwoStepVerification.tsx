import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { useAppSelector } from "@redux/store";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useI18n } from "@hooks/use-i18n";

const TwoStepVerification = () => {
  const { t } = useI18n();
  const { profile } = useAppSelector((state) => state.userProfileSlice);
  const [switchValue, setSwitchValue] = useState(false);
  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('twoStepVerification.twoStepVerification')}
          onPress={() => router.push("/security")}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.bodyTitle}>{t('twoStepVerification.twoStep')}</Text>
        <Text style={styles.bodySubtitle}>
          {t('twoStepVerification.sendVerificationCode')}
        </Text>
        <View style={styles.phoneCardBody}>
          <View style={styles.phoneAndStatus}>
            <Text style={styles.phone}>{profile?.phoneNumber || "N/A"}</Text>
            <Text style={styles.phoneStatus}>{t('twoStepVerification.verified')}</Text>
          </View>
          <View>
            <CustomButton
              title={t('twoStepVerification.change')}
              buttonStyle={styles.btnPhoneContainer}
              textStyle={styles.btnPhoneText}
              onPress={() => router.push("/ChangePhoneNumber")}
            />
          </View>
        </View>
        <View style={styles.twoStepVerificationContainer}>
          <Text style={styles.twoStepTitle}>{t('twoStepVerification.twoStep')}</Text>
          <View style={styles.twoStepSubtitleAndSwitch}>
            <Text style={styles.twoStepSubtitle}>
              {t('twoStepVerification.twoStepActivated')}
            </Text>
            <View>
              <Switch
                trackColor={{
                  false: "rgba(203, 214, 224, 1)",
                  true: "rgba(255, 59, 74, 1)",
                }}
                thumbColor={switchValue ? "white" : "rgba(255, 255, 255, 1)"}
                ios_backgroundColor="rgba(245, 245, 245, 1)"
                onValueChange={() => setSwitchValue(!switchValue)}
                value={switchValue}
                style={{ padding: 0 }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TwoStepVerification;

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
  phoneCardBody: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
  },
  phoneAndStatus: {
    flex: 1,
  },
  phone: {
    fontSize: 12,
    color: "#393939",
    marginBottom: 4,
  },
  phoneStatus: {
    fontSize: 10,
    color: "#6B727E",
  },
  btnPhoneContainer: {
    borderWidth: 1,
    borderColor: "#1C2533",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  btnPhoneText: {
    fontSize: 12,
    color: "#464F5D",
  },
  twoStepVerificationContainer: {
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 16,
  },
  twoStepTitle: {
    color: "#393939",
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "DMSansMedium",
  },
  twoStepSubtitleAndSwitch: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  twoStepSubtitle: {
    flex: 1,
    fontSize: 10,
    color: "#5C6F7F",
    marginRight: 24,
  },
});
