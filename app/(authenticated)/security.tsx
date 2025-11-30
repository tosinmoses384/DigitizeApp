import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import TitleAndChevronRight from "@components/TitleAndChevronRight";
import EmailAndPhoneNumber from "@components/EmailAndPhonenumber";
import { useI18n } from "@hooks/use-i18n";

const SecurityScreen = () => {
  const { t } = useI18n();
  const details = [
    {
      id: 1,
      title: t('security.email'),
      subtitle: t('security.checkEmailCorrect'),
      link: "/EmailConfirmation",
    },
    {
      id: 2,
      title: t('security.password'),
      subtitle: t('security.protectAccountPassword'),
      link: "/ChangePassword",
    }
  ];

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('security.security')}
          onPress={() => router.push("/settings")}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.securityTitlle}>
          {t('security.keepAccountSecure')}
        </Text>
        <Text style={styles.securitySubtitlle}>
          {t('security.secureAccountDescription')}
        </Text>

        {details?.map((list: any) => (
          <View style={styles.securityDetailsView} key={list?.id}>
            <TitleAndChevronRight
              title={list?.title}
              middleText={list?.subtitle}
              onPress={list?.link ? () => router.push(list?.link) : () => {}}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default SecurityScreen;

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
});
