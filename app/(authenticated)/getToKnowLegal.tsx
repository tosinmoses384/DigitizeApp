import React, { useMemo } from "react";
import { View, Text, ScrollView, Platform, StyleSheet } from "react-native";
import { Colors, SIZES } from "../../constants/Colors";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import { useI18n } from "@hooks/use-i18n";

const getToKnow = () => {
  const { t, isRTL } = useI18n();

  const textStyles = useMemo(
    () => ({
      title: [
        styles.titleText,
        { textAlign: isRTL ? "right" : "left" } as const,
      ],
      body: [
        styles.bodyText,
        { textAlign: isRTL ? "right" : "left" } as const,
      ],
    }),
    [isRTL]
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        },
      ]}
    >
      <StackHeader title={t('legal.acknowledgements')} onPress={() => router.back()} />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={textStyles.title}>
          {t('legal.generalInformationTitle')}
        </Text>
        <Text style={textStyles.body}>
          {t('legal.shippingInfo')}
        </Text>
        <Text style={textStyles.body}>
          {t('legal.shippingInfoSecond')}
        </Text>

        <Text style={textStyles.title}>
          {t('legal.whoAreWeTitle')}
        </Text>
        <Text style={textStyles.body}>
          {t('legal.whoAreWeContent')}
        </Text>

        <Text style={textStyles.title}>
          {t('legal.whatIsDigitizeAppTitle')}
        </Text>
        <Text style={textStyles.body}>
          {t('legal.whatIsDigitizeAppContent1')}
        </Text>

        <Text style={textStyles.body}>
          {t('legal.whatIsDigitizeAppContent2')}
        </Text>
        <Text style={textStyles.body}>
          {t('legal.whatIsDigitizeAppContent3')}
        </Text>
        <Text style={textStyles.body}>
          {t('legal.whatIsDigitizeAppContent4')}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: Colors.light.text,
  },
  bodyText: {
    marginVertical: 10,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
});

export default getToKnow;
