import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useI18n } from "@hooks/use-i18n";

const LoginActivities = () => {
  const { t } = useI18n();
  const details = [
    {
      id: 1,
      location: t('loginActivities.unitedKingdom'),
      time: t('loginActivities.now'),
      device: t('loginActivities.currentDevice'),
    },
    {
      id: 2,
      location: t('loginActivities.unitedKingdom'),
      time: "12 min ago",
      device: "safari, iPhone",
    },
    {
      id: 3,
      location: t('loginActivities.unitedKingdom'),
      time: "12 min ago",
      device: "safari, iPhone",
    },
    {
      id: 4,
      location: t('loginActivities.unitedKingdom'),
      time: "12 min ago",
      device: "safari, iPhone",
    },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('loginActivities.security')}
          onPress={() => router.push("/security")}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.securityTitlle}>{t('loginActivities.reviewLoginActivity')}</Text>
        <Text style={styles.securitySubtitlle}>
          {t('loginActivities.sessionDescription')}
        </Text>
        {details?.map((list) => (
          <View style={styles.cardBody} key={list?.id}>
            <View style={styles.cardLeft}>
              <Text style={styles.location}>{list?.location}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.timeAndDevice}>{list?.time}</Text>
                <View style={styles.dot} />
                <Text style={styles.timeAndDevice}>{list?.device}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <CustomButton title={t('loginActivities.logOut')} textStyle={styles.btnTitle} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default LoginActivities;

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
    fontSize: 18,
    color: "#212B36",
    fontFamily: "DMSansSemiBold",
    marginBottom: 2,
    marginTop: 24,
  },
  securitySubtitlle: {
    fontSize: 14,
    color: "#637381",
    marginBottom: 36,
  },
  cardBody: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
    marginBottom: 8,
  },
  cardLeft: {
    flex: 1,
  },
  location: {
    fontSize: 12,
    color: "#1E2226",
    fontFamily: "DMSansMedium",
    marginBottom: 1,
  },
  timeAndDevice: {
    fontSize: 10,
    color: "#5C6F7F",
  },
  btnTitle: {
    fontSize: 14,
    fontFamily: "DMSansMedium",
    color: "#FF3B4A",
  },
  cardRight: {},
  dot: {
    width: 4,
    height: 4,
    backgroundColor: "#5C6F7F",
    borderRadius: 4,
    marginLeft: 4,
    marginRight: 4,
  },
});
