import React from "react";
import { View, Text, ScrollView, Platform, StyleSheet } from "react-native";
import { Colors, SIZES } from "../../constants/Colors";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import About from "../../assets/images/svg/about.svg";
import Pics from "../../assets/images/svg/pics1.svg";
import { useI18n } from "@hooks/use-i18n";

const HelpAndSupport = () => {
  const { t } = useI18n();
  const topDetails = [
    {
      id: 1,
      title:
        "These cookies are necessary for the website to function and cannot be switched on or off in our systems. They are usually set in response to actions made by you, which amount to a request for services",
    },
    {
      id: 2,
      title:
        "Generally, buyers cover the cost of shipping. The shipping cost is shown at checkout and its automatically added to the total payment for the order",
    },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        paddingHorizontal: 16,
      }}
    >
      <StackHeader title={t('helpCenter.helpAndSupport')} onPress={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* <Text style={styles.title}>WHAT IS DigitizeApp?</Text> */}
        <View style={styles.imageView}></View>
        <Text style={styles.title}>{t('helpCenter.generalInformation')}</Text>
        {topDetails?.map((list) => (
          <Text key={list?.id} style={styles.subtitle}>
            {list?.title}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

export default HelpAndSupport;

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    color: "#1E2226",
    marginBottom: 6,
    fontFamily: "DMSansSemiBold",
  },
  imageView: {
    height: 127,
    borderWidth: 1,
    borderColor: "#E2E9F0",
    borderRadius: 8,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#1E2226",
    marginBottom: 16,
  },
});
