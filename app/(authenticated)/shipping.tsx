import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { defaultStyles } from "../../constants/Styles";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import { Colors, SIZES } from "../../constants/Colors";
import { useI18n } from "@hooks/use-i18n";

const Shipping = () => {
  const { t } = useI18n();
  
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          marginHorizontal: 10,
        }}
      >
        <StackHeader title={t('shipping.howDigitizeAppWorks')} onPress={() => router.back()} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={defaultStyles.header}>{t('shipping.whoPaysShipping')}</Text>
        <Text style={defaultStyles.descriptionText}>
          {t('shipping.shippingDescription')}
        </Text>
        <Text style={defaultStyles.descriptionText}>
          {t('shipping.shippingDescription')}
        </Text>
      </ScrollView>
    </View>
  );
};

export default Shipping;

const styles = StyleSheet.create({});
