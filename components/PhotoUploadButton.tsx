import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { usePhotoLibraryPermission } from '@hooks/usePhotoLibraryPermission';

interface PhotoUploadButtonProps {
  onImageSelected: (imageUri: string) => void;
  title?: string;
}

export const PhotoUploadButton: React.FC<PhotoUploadButtonProps> = ({ 
  onImageSelected, 
  title = "Upload Photo" 
}) => {
  const { openImagePicker } = usePhotoLibraryPermission();

  const handleUpload = async () => {
    try {
      const result = await openImagePicker();
      
      if (result && !result.canceled && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        onImageSelected(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleUpload}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF3B4A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PhotoUploadButton;
