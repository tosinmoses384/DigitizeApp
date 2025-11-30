import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Platform, Text, View } from "react-native";
import MyResponsiveGrid from "@components/MyResponsiveGrid";
import { useI18n } from "@hooks/use-i18n";
import { useConfigurationData } from "@hooks/use-configuration-data";
import AppTabWrapper from "@components/AppTabWrapper";

const HelpScreen = () => {
  const { t } = useI18n();
  const configData = useConfigurationData();
  const helpCenterCategoryData = configData.data?.helpCenterCategories;
  // Ensure it's always an array
  const helpCenterCategory = Array.isArray(helpCenterCategoryData) 
    ? helpCenterCategoryData 
    : [];
  const [cardWidth, setCardWidth] = useState(172);

  const template = helpCenterCategory.map((list: any) => {
    return (
      <Pressable
        key={list?.id}
        style={({ pressed }) => [
          styles.card,
          { width: cardWidth, ...(pressed ? { opacity: 0.5 } : null) },
        ]}
        onPress={() => {
          router.push(`/helpCenter/${list?.id}`);
        }}
      >
        <View style={styles.icon}>
          <Image
            source={{ uri: list?.imageUrl }}
            style={{ width: 84, height: 64, objectFit: "contain" }}
          />
        </View>
        <Text style={styles.title}>{list?.name}</Text>
      </Pressable>
    );
  });

  return (
    <AppTabWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        }}
      >
        <StackHeader
          title={t('helpCenter.helpCentre')}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
        <ScrollView style={styles.wrapper}>
          <View style={{ paddingBottom: 20 }}>
            {configData.queries.helpCenterCategories.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primaryBase} />
              </View>
            ) : helpCenterCategory.length > 0 ? (
              <MyResponsiveGrid
                template={template}
                getNumberOfRows={(data: any) => setCardWidth(data)}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {t('helpCenter.noCategoriesAvailable') || 'No help categories available'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </AppTabWrapper>
  );
};

export default HelpScreen;

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
    flex: 1,
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 1)",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  icon: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    color: "rgba(144, 149, 158, 1)",
    textAlign: "center",
    textTransform: "capitalize",
    fontFamily: "DMSansMedium",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(144, 149, 158, 1)",
    textAlign: "center",
    fontFamily: "DMSansRegular",
  },
});
