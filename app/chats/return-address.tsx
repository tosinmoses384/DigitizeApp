import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StackHeader from "@components/StackHeader";
import ReturnAddressForm from "@components/ReturnAddressForm";
import type { ReturnAddressValues } from "@stores/types";
import { router, useLocalSearchParams } from "expo-router";
import { useAppSelector } from "@redux/store";
import configurationServices from "@services/features/configuration-service/configurationService";
import { capitalizeFirstLetter } from "@helper/capitalize-first-letter";
import { useI18n } from "@hooks/use-i18n";
import { useConfigurationData } from "@hooks/use-configuration-data";

const ReturnAddressScreen: React.FC = () => {
  const { t } = useI18n();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;

  const { token, profile } = useAppSelector((state) => state.userProfileSlice);
  const { data } = useConfigurationData();
  const countries = data.countries;
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [stateOptions, setStateOptions] = useState<Array<{ key: string | number; value: string }>>([]);
  const [loadingStates, setLoadingStates] = useState<boolean>(false);

  // choose default country: user's profile country or first in list
  useEffect(() => {
    if (!selectedCountryId) {
      const defaultId = (profile as any)?.countryId || countries?.[0]?.value;
      if (defaultId) setSelectedCountryId(String(defaultId));
    }
  }, [profile, countries, selectedCountryId]);

  // fetch locations (states) for selected country using existing app pattern
  useEffect(() => {
    if (!selectedCountryId || !token) return;
    setLoadingStates(true);
    configurationServices
      ?.countryLocation(token, selectedCountryId)
      .then((res: any) => {
        const mapped = res?.data?.map((loc: any) => ({
          key: loc?.id,
          value: capitalizeFirstLetter(loc?.location || ""),
        }));
        setStateOptions(mapped || []);
        setLoadingStates(false);
      })
      .catch(() => setLoadingStates(false));
  }, [selectedCountryId, token]);
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleSubmit = useCallback((val: ReturnAddressValues) => {
    // Store handles the submission via Zustand
    // Navigation back to previous screen
    router.back();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <StackHeader title={t('shipping.returnAddress')} onPress={handleBack} />
      <View style={styles.content}>
        <ReturnAddressForm
          orderId={orderId}
          onSubmit={handleSubmit}
          stateOptions={stateOptions}
          loadingStates={loadingStates}
          userCountryId={selectedCountryId || (profile as any)?.countryId}
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

export default ReturnAddressScreen;
