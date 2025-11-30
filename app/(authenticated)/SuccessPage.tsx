import React from "react";
import { StyleSheet, Text, View } from "react-native";
import SuccessIcon from "../../assets/images/svg/success-checkmark-animation.svg";
import CustomButton from "@components/CustomButton";
import { router } from "expo-router";
import { useI18n } from "@hooks/use-i18n";

interface ISuccessPage {
  title?: string;
  subTitle?: string;
  customBottomComponent?: any;
}
const SuccessPage = ({
  title,
  subTitle,
  customBottomComponent,
}: ISuccessPage) => {
  const { t } = useI18n();
  return (
    <View style={styles.wrapper}>
      <View style={styles.top}>
        <View style={styles.topIcon}>
          <SuccessIcon />
        </View>
        <Text style={styles.title}>{title || t('successPage.phoneNumberUpdated')}</Text>
        <Text style={styles.subtitle}>
          {subTitle || t('successPage.successMessage')}
        </Text>
      </View>
      <View style={styles.bottom}>
        {customBottomComponent || (
          <CustomButton
            title={t('successPage.done')}
            buttonStyle={styles.btnStyle}
            textStyle={styles.btnText}
            onPress={() => router.push("/accountDetails")}
          />
        )}
      </View>
    </View>
  );
};

export default SuccessPage;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: "white",
  },
  top: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: "white",
  },
  topIcon: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 26,
  },
  title: {
    fontSize: 20,
    color: "#212B36",
    textAlign: "center",
    fontFamily: "DMSansSemiBold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#637381",
    fontSize: 16,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  bottom: {
    paddingBottom: 100,
  },
  btnStyle: {
    backgroundColor: "#FF3B4A",
    padding: 14,
    borderRadius: 12,
  },
  btnText: {
    color: "white",
    textAlign: "center",
    width: "100%",
    fontSize: 16,
    fontFamily: "DMSansMedium",
  },
});
