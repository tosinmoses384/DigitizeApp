import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, SIZES } from '../../constants/Colors';
import { fontSz } from '../../constants';
import StackHeader from '../../components/StackHeader';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import { useAppSelector } from '../../redux/store';
import wardrobeServices from '../../services/features/wardrobe-service/wardrobeServices';
import SelectItemBrandModal from '../../modals/SelectItemBrandModal';
import SelectItemColorModal from '../../modals/SelectItemColorModal';
import SelectItemSizeModal from '../../modals/SelectItemSizeModal';
import SelectItemCategoryModal from '../../modals/SelectItemCategoryModal';

const { width: screenWidth } = Dimensions.get('window');

interface UploadedImage {
  imageUri: string;
  type: string;
  clientRequestId: string;
  uploaded: boolean;
  uploadResult?: any;
}

interface ItemMetadata {
  brandId?: string;
  selectedBrandId?: string;
  sizeId?: string;
  selectedSizeId?: string;
  colourId?: string;
  selectedcolorId?: string;
  categoryId?: string;
  selectedCategoryId?: string;
  title?: string;
  description?: string;
  price?: string;
  condition?: string;
}

const EditMultipleItems = () => {
  const toast = useToast();
  const params = useLocalSearchParams();
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  
  // Parse uploaded images from params
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [itemsMetadata, setItemsMetadata] = useState<ItemMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerType, setDrawerType] = useState<string | null>(null);

  useEffect(() => {
    if (params.uploadedImages) {
      try {
        const images = JSON.parse(params.uploadedImages as string);
        setUploadedImages(images);
        // Initialize metadata for each image
        setItemsMetadata(images.map(() => ({})));
      } catch (error) {
        console.error('Error parsing uploaded images:', error);
        toast.show('Error loading images', { type: 'danger', duration: 3000 });
        router.back();
      }
    }
  }, [params.uploadedImages]);

  const currentImage = uploadedImages[currentImageIndex];
  const currentMetadata = itemsMetadata[currentImageIndex] || {};
  const totalImages = uploadedImages.length;

  const updateCurrentItemMetadata = (field: string, value: string, id?: string) => {
    const updatedMetadata = [...itemsMetadata];
    updatedMetadata[currentImageIndex] = {
      ...updatedMetadata[currentImageIndex],
      [field]: value,
    };
    
    // Store the ID with the correct field name
    if (id) {
      if (field === 'brandId') {
        updatedMetadata[currentImageIndex].selectedBrandId = id;
      } else if (field === 'colourId') {
        updatedMetadata[currentImageIndex].selectedcolorId = id; // Note: lowercase 'c' to match API
      } else if (field === 'sizeId') {
        updatedMetadata[currentImageIndex].selectedSizeId = id;
      } else if (field === 'categoryId') {
        updatedMetadata[currentImageIndex].selectedCategoryId = id;
      }
    }
    
    console.log(`Updated metadata for ${field}:`, updatedMetadata[currentImageIndex]);
    setItemsMetadata(updatedMetadata);
  };

  const navigateToImage = (index: number) => {
    if (index >= 0 && index < totalImages) {
      setCurrentImageIndex(index);
    }
  };

  const handleSkipForLater = () => {
    // Navigate back to items page, abandoning the process
    router.replace('/(authenticated)/(tabs)/add');
  };

  const handleSaveItem = async () => {
    setLoading(true);
    
    try {
      // Submit metadata for the current item
      const metadata = currentMetadata;
      
console.log("metadata ======::::", metadata);

      // if (!metadata.selectedBrandId || !metadata.selectedSizeId || !metadata.selectedcolorId || !metadata.selectedCategoryId) {
      //   toast.show('Please fill in all required fields', { type: 'danger', duration: 3000 });
      //   setLoading(false);
      //   return;
      // }

      const itemData = {
        requestId: currentImage.clientRequestId,
        brandId: metadata.selectedBrandId,
        sizeId: metadata.selectedSizeId,
        colourIds: [metadata.selectedcolorId],
        categoryId: metadata.selectedCategoryId,
        title: metadata.title || '',
        description: metadata.description || '',
        price: metadata.price || '',
        condition: metadata.condition || '',
      };

      console.log("metadata itemData ======::::", itemData);




     
      // const response = await wardrobeServices.updateItem(
        
      //   item.requestId,
      //          metadata.selectedBrandId,
      //          metadata.selectedSizeId,
      //          [metadata.selectedcolorId],
      //          token,
      //          item.id
       
    
      //  itemData, token);




      const response = await wardrobeServices.additemToWardrobe(itemData, token);
      
      if (response?.status === 200) {
        toast.show('Item saved successfully!', { type: 'success', duration: 3000 });
        
        // If this is the last item, navigate to wardrobe
        if (currentImageIndex === totalImages - 1) {
          router.replace('/wardrobe');
        } else {
          // Move to next item
          navigateToImage(currentImageIndex + 1);
        }
      } else {
        toast.show(response?.detail || 'Failed to save item', { type: 'danger', duration: 3000 });
      }
    } catch (error) {
      console.error('Error saving item:', error);
      toast.show('An error occurred while saving', { type: 'danger', duration: 3000 });
    }
    
    setLoading(false);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {uploadedImages.map((_, index) => (
        <React.Fragment key={index}>
          <TouchableOpacity
            style={[
              styles.stepCircle,
              index === currentImageIndex && styles.activeStepCircle,
              index < currentImageIndex && styles.completedStepCircle,
            ]}
            onPress={() => navigateToImage(index)}
          >
            {index < currentImageIndex ? (
              // Show checkmark for completed steps
              <Ionicons name="checkmark" size={20} color="#fff" />
            ) : (
              // Show number for current and future steps
              <Text style={[
                styles.stepText,
                index === currentImageIndex && styles.activeStepText,
              ]}>
                {index + 1}
              </Text>
            )}
          </TouchableOpacity>
          
          {/* Connecting line between steps */}
          {index < uploadedImages.length - 1 && (
            <View style={[
              styles.stepConnector,
              index < currentImageIndex && styles.completedConnector,
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderImageCarousel = () => (
    <View style={styles.imageContainer}>
      <TouchableOpacity
        style={[styles.navButton, styles.leftButton]}
        onPress={() => navigateToImage(currentImageIndex - 1)}
        disabled={currentImageIndex === 0}
      >
        <Ionicons 
          name="chevron-back" 
          size={24} 
          color={currentImageIndex === 0 ? '#ccc' : '#fff'} 
        />
      </TouchableOpacity>
      
      {currentImage && (
        <Image source={{ uri: currentImage.imageUri }} style={styles.itemImage} />
      )}
      
      <TouchableOpacity
        style={[styles.navButton, styles.rightButton]}
        onPress={() => navigateToImage(currentImageIndex + 1)}
        disabled={currentImageIndex === totalImages - 1}
      >
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={currentImageIndex === totalImages - 1 ? '#ccc' : '#fff'} 
        />
      </TouchableOpacity>
    </View>
  );

  const renderFormField = (label: string, value: string, onPress: () => void) => (
    <TouchableOpacity style={styles.formField} onPress={onPress}>
      {/* <Text style={styles.fieldLabel}>{label}</Text> */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldValue, !value && styles.placeholder]}>
          {value || `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  if (uploadedImages.length === 0) {
    return (
      <View style={styles.container}>
        <StackHeader title="Edit Items" onPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text>Loading images...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StackHeader title="Edit Item" onPress={() => router.back()} />
      
      {renderStepIndicator()}
      {renderImageCarousel()}
      
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {renderFormField(
          'Brand',
          currentMetadata.brandId || '',
          () => setDrawerType('brand')
        )}
        
        {renderFormField(
          'Colour',
          currentMetadata.colourId || '',
          () => setDrawerType('color')
        )}
        
        {renderFormField(
          'Size',
          currentMetadata.sizeId || '',
          () => setDrawerType('size')
        )}
        
        {renderFormField(
          'Category',
          currentMetadata.categoryId || '',
          () => setDrawerType('category')
        )}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkipForLater}>
          <Text style={styles.skipButtonText}>Skip for Later</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]} 
          onPress={handleSaveItem}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Item'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selection Modals */}
      {drawerType === 'brand' && (
        <SelectItemBrandModal
          isShow={true}
          onClose={() => setDrawerType(null)}
          name="brandId"
          onSelect={(e) => {
            updateCurrentItemMetadata('brandId', e?.target?.value, e?.target?.id);
            setDrawerType(null);
          }}
        />
      )}

      {drawerType === 'color' && (
        <SelectItemColorModal
          isShow={true}
          onClose={() => setDrawerType(null)}
          name="colourId"
          onSelect={(e) => {
            updateCurrentItemMetadata('colourId', e?.target?.value, e?.target?.id);
            setDrawerType(null);
          }}
        />
      )}

      {drawerType === 'size' && (
        <SelectItemSizeModal
          isShow={true}
          onClose={() => setDrawerType(null)}
          name="sizeId"
          onSelect={(e) => {
            updateCurrentItemMetadata('sizeId', e?.target?.value, e?.target?.id);
            setDrawerType(null);
          }}
        />
      )}

      {drawerType === 'category' && (
        <SelectItemCategoryModal
          isShow={true}
          onClose={() => setDrawerType(null)}
          name="categoryId"
          onSelect={(e) => {
            updateCurrentItemMetadata('categoryId', e?.target?.value, e?.target?.id);
            setDrawerType(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'ios' ? SIZES.height / 22 : SIZES.padding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepCircle: {
    backgroundColor: '#AA2731',
  },
  completedStepCircle: {
    backgroundColor: '#077903',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 8,
  },
  completedConnector: {
    backgroundColor: '#4CAF50',
  },
  stepText: {
    fontSize: fontSz(16),
    fontFamily: 'DMSansMedium',
    color: '#666',
  },
  activeStepText: {
    color: '#fff',
  },
  imageContainer: {
    position: 'relative',
    height: 372,
    marginHorizontal: 20,
    marginBottom: 20,
    // borderRadius: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,

    backgroundColor:
   "#FF3B4A",
    // backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  leftButton: {
    left: 10,
  },
  rightButton: {
    right: 10,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: fontSz(14),
    fontFamily: 'Figtree',
    color: '#212C3D',
    marginBottom: 8,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(145, 158, 171, 0.08)', // ✅ fixed
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  fieldValue: {
    fontSize: fontSz(14),
    fontFamily: 'DMSansRegular',
    color: '#212C3D',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: fontSz(16),
    fontFamily: 'DMSansMedium',
    color: '#FF6B6B',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: fontSz(16),
    fontFamily: 'DMSansMedium',
    color: '#fff',
  },
});

export default EditMultipleItems;
