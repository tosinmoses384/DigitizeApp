import React from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import { Colors, SIZES } from "../../constants/Colors";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import AppTabWrapper from "@components/AppTabWrapper";
import { useI18n } from "@hooks/use-i18n";

const PlatformPage = () => {
  const { t } = useI18n();
  
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
        <StackHeader title={t('platform.ourPlatform')} onPress={() => router.back()} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text
            style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}
          >
            {t('platform.generalInformation')}
          </Text>
          <Text style={{ marginVertical: 10 }}>
            {t('platform.shippingInfo')}
          </Text>
          <Text style={{ marginVertical: 10 }}>
            {t('platform.shippingInfo')}
          </Text>

          {/* Repeat: What is DigitizeApp Section */}
          <Text
            style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}
          >
            {t('platform.whoAreWe')}
          </Text>
          <Text style={{ marginVertical: 10 }}>
            {t('platform.cookiesInfo')}
          </Text>
          {/* Repeat: What is DigitizeApp Section */}
          <Text
            style={{ fontSize: 18, fontWeight: "bold", marginVertical: 10 }}
          >
            {t('platform.whatIsDigitizeApp')}
          </Text>
          <Text style={{ marginVertical: 10 }}>
            {t('platform.cookiesInfo')}
          </Text>

          <Text style={{ marginVertical: 10 }}>
            {t('platform.cookiesInfo')}
          </Text>
          <Text style={{ marginVertical: 10 }}>
            {t('platform.cookiesInfo')}
          </Text>
          <Text style={{ marginVertical: 10 }}>
            {t('platform.cookiesInfo')}
          </Text>
        </ScrollView>
      </View>
    </AppTabWrapper>
  );
};

export default PlatformPage;
