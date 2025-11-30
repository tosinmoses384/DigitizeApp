import React from "react";
import { View, Platform } from "react-native";
import { Colors, SIZES } from "../../constants/Colors";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import { useI18n } from "@hooks/use-i18n";
import AuthenticatedWebView from "../../components/AuthenticatedWebView";

const OurBlog = () => {
  const { t } = useI18n();
  const pageTitle = t('about.ourBlog') || t('aboutPages.ourBlog') || "Our Blog";

  const baseUrl = process.env.EXPO_PUBLIC_WEB_BASE_URL || process.env.EXPO_PUBLIC_WEB_BASE_URL ;
  const webViewUrl = `${baseUrl}/blog?layout=none`;

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

export default OurBlog;
