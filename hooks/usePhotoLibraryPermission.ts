import { useState, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface UsePhotoLibraryPermissionReturn {
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  openImagePicker: () => Promise<ImagePicker.ImagePickerResult | null>;
  checkPermissionStatus: () => Promise<boolean>;
}

export const usePhotoLibraryPermission = (): UsePhotoLibraryPermissionReturn => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const checkPermissionStatus = useCallback(async (): Promise<boolean> => {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    return granted;
  }, []);

  const showSettingsAlert = useCallback(() => {
    Alert.alert(
      "Photo Library Access Required",
      "DigitizeApp uses your photo library to let you upload images of your clothes and outfits to your digital wardrobe. Please enable photo library access in Settings.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Open Settings",
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      // First check current status
      const currentStatus = await checkPermissionStatus();
      if (currentStatus) {
        return true;
      }

      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status === 'granted') {
        setHasPermission(true);
        return true;
      } else if (status === 'denied') {
        // User denied - show alert to go to settings
        showSettingsAlert();
        return false;
      } else {
        // Permission was not granted for other reasons
        setHasPermission(false);
        return false;
      }
    } catch (error) {
      console.error('Error requesting photo library permission:', error);
      return false;
    }
  }, [checkPermissionStatus, showSettingsAlert]);

  const openImagePicker = useCallback(async (): Promise<ImagePicker.ImagePickerResult | null> => {
    const hasAccess = await requestPermission();
    
    if (!hasAccess) {
      return null;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      return result;
    } catch (error) {
      console.error('Error opening image picker:', error);
      return null;
    }
  }, [requestPermission]);

  return {
    hasPermission,
    requestPermission,
    openImagePicker,
    checkPermissionStatus,
  };
};

export default usePhotoLibraryPermission;
