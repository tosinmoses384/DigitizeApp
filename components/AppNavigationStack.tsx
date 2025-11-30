import React from 'react';
import { Stack } from 'expo-router';
import { linkingConfig } from '../config/linking';

export const AppNavigationStack: React.FC = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="SplashScreen" />
      <Stack.Screen name="index" />
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="Onboarding" />
      <Stack.Screen name="Login" />
      <Stack.Screen name="Signup" />
      <Stack.Screen name="Otp" />
      <Stack.Screen name="SetPassword" />
      <Stack.Screen name="SetPassword2" />
      <Stack.Screen name="chats/[id]" />
      <Stack.Screen name="BuildBundle/[id]" />
      <Stack.Screen name="ItemPurchase/[itemId]" />
      <Stack.Screen name="BundlePurchase/[itemId]" />
      <Stack.Screen name="ItemDetails/[itemId]" />
      <Stack.Screen name="BuyerAddressLocation" />
      <Stack.Screen name="DeliveryTimeOption" />
      <Stack.Screen
        name="OnboardingMain"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="ForgotPassword" />
      <Stack.Screen name="ForgotPassword2" />
      <Stack.Screen name="Country" />
      <Stack.Screen name="Search" />
      <Stack.Screen name="MakePurchase" />
      <Stack.Screen name="SellerFollowing/[id]" />
      <Stack.Screen name="SellerFollowers/[id]" />
      <Stack.Screen name="SellerProfile" />
      <Stack.Screen name="BuyerProtection" />
      <Stack.Screen 
        name="PostDetails" 
        options={{ gestureEnabled: false }}
      />
      {/* Ensure authenticated routes (like /outfit) are registered */}
      <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
    </Stack>
  );
};
