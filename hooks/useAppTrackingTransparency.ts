import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as TrackingTransparency from 'expo-tracking-transparency';

export const useAppTrackingTransparency = () => {
  const [trackingStatus, setTrackingStatus] = useState<string>('unknown');
  const [hasRequested, setHasRequested] = useState(false);

  const requestTrackingPermission = async () => {
    if (Platform.OS !== 'ios') {
      // Android doesn't require ATT
      setTrackingStatus('granted');
      return 'granted';
    }

    try {
      // Get current status first
      const status = await TrackingTransparency.getTrackingPermissionsAsync();
      
      if (status.status === 'granted' || status.status === 'denied') {
        setTrackingStatus(status.status);
        return status.status;
      }

      // If status is 'undetermined', request permission
      if (status.status === 'undetermined') {
        const requestResult = await TrackingTransparency.requestTrackingPermissionsAsync();
        setTrackingStatus(requestResult.status);
        setHasRequested(true);
        return requestResult.status;
      }

      setTrackingStatus(status.status);
      return status.status;
    } catch (error) {
      console.error('Error requesting tracking permission:', error);
      setTrackingStatus('denied');
      return 'denied';
    }
  };

  const checkTrackingStatus = async () => {
    if (Platform.OS !== 'ios') {
      setTrackingStatus('granted');
      return 'granted';
    }

    try {
      const status = await TrackingTransparency.getTrackingPermissionsAsync();
      setTrackingStatus(status.status);
      return status.status;
    } catch (error) {
      console.error('Error checking tracking status:', error);
      setTrackingStatus('denied');
      return 'denied';
    }
  };

  useEffect(() => {
    checkTrackingStatus();
  }, []);

  return {
    trackingStatus,
    hasRequested,
    requestTrackingPermission,
    checkTrackingStatus,
    canTrack: trackingStatus === 'granted',
  };
};
