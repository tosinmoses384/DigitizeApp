import React, { useCallback } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StackHeader from "@components/StackHeader";
import ShippingProviderForm, { ShippingProviderValues } from "@components/ShippingProviderForm";
import { router, useLocalSearchParams } from "expo-router";
import { useI18n } from "@hooks/use-i18n";

const ShippingProviderScreen: React.FC = () => {
  const { t } = useI18n();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleSubmit = useCallback((val: ShippingProviderValues) => {
    // Store handles the submission via Zustand
    // Navigation back to previous screen
    router.back();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <StackHeader title={t('shipping.shippingProvider')} onPress={handleBack} />
      <View style={styles.content}>
        <ShippingProviderForm 
          orderId={orderId}
          onSubmit={handleSubmit} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },
  content: {
    flex: 1,
  },
});

export default ShippingProviderScreen;


