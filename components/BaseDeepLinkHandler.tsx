import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/use-auth';

interface BaseDeepLinkHandlerProps {
  id: string | undefined;
  type: 'post' | 'user' | 'item' | 'chat';
  onAuthenticatedNavigation: (id: string) => void;
  entityName?: string; // e.g., 'postId', 'userId', 'itemId'
}

/**
 * Reusable base component for authentication-aware deep link handling
 * 
 * This component provides a consistent structure for all deep link handlers:
 * 1. Waits for authentication check to complete
 * 2. If authenticated: calls onAuthenticatedNavigation callback
 * 3. If not authenticated: redirects to login (custom hook handles saving deep link)
 * 4. Shows loading UI while processing
 * 
 * Usage:
 * - Extend this component for specific deep link types
 * - Pass the entity ID, type, and navigation callback
 * - The custom hook (useAuthAwareDeepLink) handles saving/processing for unauthenticated users
 */
export const BaseDeepLinkHandler: React.FC<BaseDeepLinkHandlerProps> = ({
  id,
  type,
  onAuthenticatedNavigation,
  entityName = 'id'
}) => {
  const { isAuthenticated, isCheckingAuth } = useAuth();

  useEffect(() => {
    console.log(`🔗 ${type.charAt(0).toUpperCase() + type.slice(1)} deep link handler activated with ${entityName}:`, id);
    console.log('🔐 Authentication status - isCheckingAuth:', isCheckingAuth, 'isAuthenticated:', isAuthenticated);
    
    // Wait for auth check to complete
    if (isCheckingAuth) return;

    if (!id) {
      console.log(`❌ No ${entityName} provided, redirecting to home`);
      router.replace('/home' as any);
      return;
    }

    if (isAuthenticated) {
      // User is authenticated, navigate directly using callback
      console.log(`✅ User authenticated, navigating to ${type} destination`);
      onAuthenticatedNavigation(id);
    } else {
      // User not authenticated, redirect to login
      // The useAuthAwareDeepLink hook will handle storing and processing this deep link
      console.log('🚫 User not authenticated, redirecting to login');
      router.replace('/Onboarding' as any);
    }
  }, [id, isAuthenticated, isCheckingAuth, onAuthenticatedNavigation, type, entityName]);

  // Show loading while processing
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16 }}>Loading...</Text>
    </View>
  );
};

export default BaseDeepLinkHandler;
