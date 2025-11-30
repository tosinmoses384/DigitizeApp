import React, { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/use-auth';
import { View, ActivityIndicator, Text } from 'react-native';

/**
 * Simple deep link handler for post URLs (e.g., digitize-app://post/123)
 * 
 * Simplified version to prevent infinite loops while maintaining functionality:
 * - If user is authenticated: navigates directly to PostDetails
 * - If user is not authenticated: redirects to login
 */
export default function PostDeepLinkHandler() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { isAuthenticated, isCheckingAuth } = useAuth();

  useEffect(() => {
    // Only run once when auth check is complete
    if (isCheckingAuth) return;

    if (!postId) {
      console.log('❌ No postId provided, redirecting to home');
      router.replace('/(authenticated)/(tabs)/home' as any);
      return;
    }

    if (isAuthenticated) {
      console.log('✅ User authenticated, navigating to post:', postId);
      router.replace(`/PostDetails?postId=${postId}` as any);
    } else {
      console.log('🚫 User not authenticated, redirecting to login');
      router.replace('/Onboarding' as any);
    }
  }, [isCheckingAuth]); // Only depend on isCheckingAuth to prevent loops

  // Show loading while processing
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16 }}>Loading...</Text>
    </View>
  );
}
