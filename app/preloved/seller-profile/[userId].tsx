import React, { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setSellerId } from '../../../redux/slice/filters/filterSlice';
import { useAuth } from '../../../hooks/use-auth';
import { View, ActivityIndicator, Text } from 'react-native';

export default function SellerProfileDeepLinkHandler() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const dispatch = useDispatch();
  const { isAuthenticated, isCheckingAuth } = useAuth();

  useEffect(() => {
    if (isCheckingAuth) return;

    if (!userId) {
      router.replace('/(authenticated)/(tabs)/home' as any);
      return;
    }

    if (isAuthenticated) {
      dispatch(setSellerId(userId));
      router.replace('/SellerProfile' as any);
    } else {
      router.replace('/Onboarding' as any);
    }
  }, [isCheckingAuth]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16 }}>Loading...</Text>
    </View>
  );
}


