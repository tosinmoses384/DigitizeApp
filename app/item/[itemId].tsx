import React, { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/use-auth';

export default function ItemDeepLinkHandler() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { isAuthenticated, isCheckingAuth } = useAuth();

  useEffect(() => {
    if (isCheckingAuth) return;

    if (!itemId) {
      router.replace('/(authenticated)/(tabs)/home' as any);
      return;
    }

    if (isAuthenticated) {
      router.replace(`/ItemDetails/${itemId}` as any);
    } else {
      router.replace('/Onboarding' as any);
    }
  }, [isCheckingAuth]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16 }}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});


