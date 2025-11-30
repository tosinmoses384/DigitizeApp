import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, SIZES } from '../../constants/Colors';
import { fontSz } from '../../constants';
import StackHeader from '../../components/StackHeader';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import { useAppSelector } from '../../redux/store';
import wardrobeServices from '../../services/features/wardrobe-service/wardrobeServices';
import { useI18n } from '../../hooks/use-i18n';
import SelectItemBrandModal from '../../modals/SelectItemBrandModal';
import SelectItemColorModal from '../../modals/SelectItemColorModal';
import SelectItemSizeModal from '../../modals/SelectItemSizeModal';
import SelectSeasonModal from '../../modals/SelectSeasonModal';

interface ItemMetadata {
  // Display labels (what user sees in form fields)
  brandLabel?: string;
  sizeLabel?: string;
  colourLabel?: string;
  seasonLabel?: string;

  // IDs for API calls (what gets saved)
  brandId: string;
  sizeId: string;
  colourIds: string[];
  seasonId: string;
}

const EditItem = () => {
  const toast = useToast();
  const params = useLocalSearchParams();
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const { t } = useI18n();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [drawerType, setDrawerType] = useState<string | null>(null);
  const [itemMetadata, setItemMetadata] = useState<ItemMetadata>({
    brandId: '',
    sizeId: '',
    colourIds: [],
    seasonId: '',
  });
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (params.itemData) {
      try {
        // Validate that itemData is a string and not empty
        const itemDataString = params.itemData as string;
        if (!itemDataString || typeof itemDataString !== 'string') {
          throw new Error(t('common.error'));
        }

        // Parse JSON with additional validation
        let itemData;
        try {
          itemData = JSON.parse(itemDataString);
        } catch (parseError) {
          throw new Error(t('common.error'));
        }

        // Validate that parsed data is an object
        if (
          !itemData ||
          typeof itemData !== 'object' ||
          Array.isArray(itemData)
        ) {
          toast.show(t('common.error'), { type: 'danger', duration: 4000 });
        }

        // Validate that item has required fields for editing
        if (!itemData.id && !itemData.requestId) {
          toast.show(t('common.error'), { type: 'danger', duration: 4000 });
        }
        setItem(itemData);
        
        // First try the directly passed image URL, then fallback to item data
        const imageUrl = (params.imageUrl as string) || 
                        itemData.itemDefaultImageUrl || 
                        itemData.itemImageUrls?.[0] || 
                        itemData.defaultImageUrl || 
                        itemData.imageUrls?.[0] || 
                        '';
        setImageUrl(imageUrl);
        
        // Initialize metadata with item data (show previous values)
        // Handle different possible color data structures
        let colorName = '';
        let colorIds = [];
        
        // Handle itemColours array structure (from itemDetail response)
        if (itemData.itemColours && Array.isArray(itemData.itemColours) && itemData.itemColours.length > 0) {
          colorName = itemData.itemColours[0].itemColour || '';
          colorIds = [itemData.itemColours[0].itemColourId];
        } else {
          // Fallback to other possible structures
          colorName = itemData.colourName || itemData.colorName || itemData.colours?.[0] || itemData.colors?.[0] || '';
          colorIds = itemData.colourIds || itemData.colorIds || (itemData.colourId ? [itemData.colourId] : []) || (itemData.colorId ? [itemData.colorId] : []);
        }
        
        setItemMetadata({
          brandLabel: itemData.brandName || itemData.brand || '',
          sizeLabel: itemData.sizeName || itemData.size || '',
          colourLabel: colorName,
          seasonLabel: itemData.seasonName || itemData.season || '',
          brandId: itemData.brandId || '',
          sizeId: itemData.sizeId || '',
          //always use the first element in the array and if the array is empty use empty string ("")
          colourIds: colorIds.length > 0 ? [colorIds[0]] : [""],
          seasonId: itemData.seasonId || '',
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('common.error');
        toast.show(errorMessage, { type: 'danger', duration: 4000 });

        // Navigate back after a short delay to allow user to see the error message
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    }
  }, [params.itemData]);

  const updateItemMetadata = (field: string, value: string, id?: string) => {
    const updatedMetadata = {
      ...itemMetadata,
      [field]: value,
    };
    
    // Store the ID with the correct field name
    if (id) {
      if (field === 'brandLabel') {
        updatedMetadata.brandId = id;
      } else if (field === 'colourLabel') {
        updatedMetadata.colourIds = [id]; // Array for colourIds
      } else if (field === 'sizeLabel') {
        updatedMetadata.sizeId = id;
      } else if (field === 'seasonLabel') {
        updatedMetadata.seasonId = id;
      }
    }
    setItemMetadata(updatedMetadata);
  };

  const handleSaveItem = async () => {
    setLoading(true);
    const metadata = itemMetadata;

    try {
      
      const response = await wardrobeServices.updateItem(
        item.requestId,
        metadata.brandId,
        metadata.sizeId,
        metadata.colourIds,
        token,
        item.id,
        metadata.seasonId
      );

        if (response?.data) {
          toast.show(t('common.success'), {
            type: 'success',
            duration: 3000,
          });
          router.replace('/(authenticated)/(tabs)/wardrobe');
        } else {
          toast.show(t('common.error'), { type: 'danger', duration: 3000 });
        }
      } catch (error) {
        toast.show(t('common.error'), {
          type: 'danger',
          duration: 3000,
        });
      }

    setLoading(false);
  };

  const renderFormField = (label: string, value: string, onPress: () => void) => (
    <TouchableOpacity style={styles.formField} onPress={onPress}>
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.fieldValueContainer}>
          <Text style={[styles.fieldValue, !value && styles.placeholder]}>
            {value || `Select ${label}`}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!item) {
    return (
      <View style={styles.container}>
        <StackHeader title={t('common.editItem')} onPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <StackHeader title={t('common.editItem')} onPress={() => router.back()} />

      {/* Item Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={50} color="#ccc" />
            <Text style={styles.placeholderText}>No image available</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderFormField(t('common.brand'), itemMetadata.brandLabel || '', () =>
          setDrawerType('brand'),
        )}

        {renderFormField(t('common.colour'), itemMetadata.colourLabel || '', () =>
          setDrawerType('color'),
        )}

        {renderFormField(t('common.size'), itemMetadata.sizeLabel || '', () =>
          setDrawerType('size'),
        )}

        {renderFormField(t('common.season'), itemMetadata.seasonLabel || '', () =>
          setDrawerType('season'),
        )}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]} 
          onPress={handleSaveItem}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? t('common.loading') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selection Modals */}
      {drawerType === 'brand' && (
        <SelectItemBrandModal
          isShow={true}
          onClose={() => setDrawerType(null)}
          name="brandLabel"
          onSelect={(e: any) => {
            updateItemMetadata('brandLabel', e?.target?.value, e?.target?.id);
            setDrawerType(null);
          }}
        />
      )}

      {drawerType === 'color' && (
        <SelectItemColorModal
          isShow={true}
          onClose={() => setDrawerType(null)}
          name="colourLabel"
          onSelect={(e: any) => {
            updateItemMetadata('colourLabel', e?.target?.value, e?.target?.id);
            setDrawerType(null);
          }}
        />
      )}

      {drawerType === 'size' && (
        <SelectItemSizeModal
          isShow={true}
          onClose={() => setDrawerType(null)}
          name="sizeLabel"
          onSelect={(e: any) => {
            updateItemMetadata('sizeLabel', e?.target?.value, e?.target?.id);
            setDrawerType(null);
          }}
        />
      )}


      {drawerType === 'season' && (
        <SelectSeasonModal
          isShow={true}
          onClose={() => setDrawerType(null)}
          name="seasonLabel"
          onSelect={(e) => {
            updateItemMetadata('seasonLabel', e?.target?.value, e?.target?.id);
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
  imageContainer: {
    position: 'relative',
    height: 350,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: fontSz(14),
    fontFamily: 'DMSansRegular',
    color: '#999',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formField: {
    marginBottom: 16,
  },
  fieldContainer: {
    backgroundColor: 'rgba(145, 158, 171, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  fieldLabel: {
    fontSize: fontSz(10),
    fontFamily: 'DMSansMedium',
    color: '#666',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  saveButton: {
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

export default EditItem;
