import React, { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAuth } from '@hooks/use-auth';

/**
 * Simple deep link handler for post URLs (e.g., digitize-app://post/123)
 * 
 * Simplified version to prevent infinite loops while maintaining functionality:
 * - If user is authenticated: navigates directly to PostDetails
 * - If user is not authenticated: redirects to login
 */
export default function PrelovedItemDeepLinkHandler() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { isAuthenticated, isCheckingAuth } = useAuth();

  useEffect(() => {
    // Only run once when auth check is complete
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
  }, [isCheckingAuth]); // Only depend on isCheckingAuth to prevent loops

  // Show loading while processing
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