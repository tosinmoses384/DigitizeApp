import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { useAppTrackingTransparency } from '@hooks/useAppTrackingTransparency';
import { useAppSelector } from '@redux/store';

interface AppTrackingTransparencyWrapperProps {
  children: React.ReactNode;
}

const AppTrackingTransparencyWrapper: React.FC<AppTrackingTransparencyWrapperProps> = ({ children }) => {
  const { trackingStatus, requestTrackingPermission, canTrack } = useAppTrackingTransparency();
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  useEffect(() => {
    // Only request tracking permission when user is logged in and we haven't requested yet
    if (token && Platform.OS === 'ios' && !hasRequestedPermission && trackingStatus === 'undetermined') {
      requestTrackingPermissionWithDelay();
    }
  }, [token, trackingStatus, hasRequestedPermission]);

  const requestTrackingPermissionWithDelay = async () => {
    // Add a small delay to ensure the app is fully loaded
    setTimeout(async () => {
      try {
        setHasRequestedPermission(true);
        const result = await requestTrackingPermission();
        
        if (__DEV__) {
          // Optional: You can track this result for analytics
          console.log('ATT Permission Result:', result);
        }
      } catch (error) {
        console.error('Error requesting tracking permission:', error);
      }
    }, 2000); // 2-second delay after app launch
  };

  useEffect(() => {
    // No analytics gating here; ATT is used only for ads attribution.
  }, [canTrack]);

  // Render children regardless of tracking status
  return <>{children}</>;
};

export default AppTrackingTransparencyWrapper;
