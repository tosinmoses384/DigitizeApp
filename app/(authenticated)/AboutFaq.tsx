import React from "react";
import { View, Platform } from "react-native";
import { Colors, SIZES } from "../../constants/Colors";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import { useI18n } from "@hooks/use-i18n";
import AuthenticatedWebView from "../../components/AuthenticatedWebView";

const AboutFaq = () => {
  const { t } = useI18n();
  const pageTitle = t('about.faq') || t('aboutPages.faq') || "FAQ";

  const baseUrl = process.env.EXPO_PUBLIC_WEB_BASE_URL || 'https://staging.digitizeapp.com';
  const webViewUrl = `${baseUrl}/faq?layout=none`;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
      }}
    >
      <StackHeader
        title={pageTitle}
        onPress={() => router.back()}
      />

      <AuthenticatedWebView url={webViewUrl} />
    </View>
  );
};

export default AboutFaq;
