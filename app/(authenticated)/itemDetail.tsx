import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useToast } from 'react-native-toast-notifications';
import { fontSz } from '../../constants';
import CustomButton from '../../components/CustomButton';
import wardrobeServices from '../../services/features/wardrobe-service/wardrobeServices';
import {
  setTemporaryAddItemToOutfit,
  setRefNumber,
} from '../../redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice';
import { generateGUID } from '../../helper/guid-number';
import { useNavigation } from '@react-navigation/native';
import DeleteItemModal from '../../modals/DeleteItemModal';
import BottomModal from '../../components/BottomModal';
import EditIconComponent from '@assets/images/svg_components/edit_icon';
import DeleteIconComponent from '@assets/images/svg_components/delete_icon';
import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { useRef } from 'react';
import { useI18n } from '../../hooks/use-i18n';
import { processSingleItemBackgroundRemoval } from '../../utils/planItemBackgroundProcessor';

const ItemDetail = () => {
  const { t } = useI18n();
  const params = useLocalSearchParams();
  const item = params.item ? JSON.parse(params.item as string) : null;

  const dispatch = useAppDispatch();
  const navigation: any = useNavigation();
  const toast = useToast();

  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const { temporaryAddItemToOutfitSlice } = useAppSelector(
    (state) => state?.temporaryAddItemToOutfitSlice,
  );

  const [deleteLoader, setDeleteLoader] = useState(false);
  const [addToOutfitLoader, setAddToOutfitLoader] = useState(false);
  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
  const [isShowMenuModal, setIsShowMenuModal] = useState(false);
  const [fullItemData, setFullItemData] = useState<any>(null);
  const [loadingItemDetails, setLoadingItemDetails] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const watermarkViewRef = useRef(null);

  // Fetch complete item details on component mount
  useEffect(() => {
    const abortController = new AbortController();
    let timeoutId: NodeJS.Timeout;

    const fetchItemDetails = async () => {
      if (!item?.id || !token) return;

      setLoadingItemDetails(true);
      try {
        // comment above and use the endpoint below
        const response = await wardrobeServices.getItemByIdUpdated(
          token,
          item.id,
        );
        // structure of response
        

        if (response?.data) {
          setFullItemData(response.data);
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error?.name === 'AbortError') return;

        // Classify and handle different error types
        if (
          error?.code === 'NETWORK_ERROR' ||
          error?.message?.includes('Network')
        ) {
          toast.show(
            t('wardrobe.networkError'),
            {
              type: 'danger',
              duration: 4000,
            },
          );
        }
        // Authentication errors
        else if (error?.status === 401 || error?.responseCode === '401') {
          toast.show(t('wardrobe.sessionExpired'), {
            type: 'danger',
            duration: 4000,
          });
          router.push('/Onboarding');
        }
        // Item not found errors
        else if (error?.status === 404 || error?.responseCode === '404') {
          toast.show(t('wardrobe.itemNotFoundError'), {
            type: 'danger',
            duration: 4000,
          });
          // Optionally navigate back after a delay
          timeoutId = setTimeout(() => {
            router.back();
          }, 2000);
        }
        // Server errors
        else if (error?.status >= 500 || error?.responseCode >= '500') {
          toast.show(t('wardrobe.serverError'), {
            type: 'danger',
            duration: 4000,
          });
        }
        // Rate limiting
        else if (error?.status === 429 || error?.responseCode === '429') {
          toast.show(t('wardrobe.tooManyRequests'), {
            type: 'warning',
            duration: 4000,
          });
        }
        // Generic error fallback
        else {
          toast.show(t('wardrobe.failedToLoadItemDetails'), {
            type: 'danger',
            duration: 4000,
          });
        }
      } finally {
        setLoadingItemDetails(false);
      }
    };

    fetchItemDetails();

    // Cleanup function
    return () => {
      abortController.abort();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [item?.id, token]);

  // Use full item data if available, otherwise fall back to basic item data
  const displayItem = fullItemData || item;

  const handleDeleteItem = () => {
    setIsShowDeleteModal(true);
  };

  const performDelete = () => {
    setDeleteLoader(true);

    wardrobeServices
      .deleteUserItem(token, item?.id)
      .then((res) => {
        setDeleteLoader(false);
        if (res?.status === 200) {
          toast.show(`${res?.message || res?.detail}`, {
            type: 'success',
            duration: 4000,
          });
          router.back();
          return;
        }
        if (res?.responseCode === '401' || res?.responseCode === 401) {
          return router.push('/Onboarding');
        }
        return toast.show(`${res?.message || res?.detail}`, {
          type: 'danger',
          duration: 4000,
        });
      })
      .catch((error) => {
        setDeleteLoader(false);
        return toast.show(t('wardrobe.errorOccurredTryAgain'), {
          type: 'danger',
          duration: 4000,
        });
      });
  };

  const handleAddToOutfit = async () => {
    if (addToOutfitLoader) {
      return;
    }

    const checkIfItemExist = temporaryAddItemToOutfitSlice?.find(
      (itemDetails: any) => itemDetails?.id === item?.id,
    );

    if (checkIfItemExist) {
      toast.show(t('wardrobe.itemAlreadyAdded'), {
        type: 'info',
        duration: 3000,
      });
      return;
    }

    setAddToOutfitLoader(true);

    try {
      const result = await processSingleItemBackgroundRemoval(displayItem, token);

      if (!result) {
        setAddToOutfitLoader(false);
        toast.show(t('wardrobe.noImageAvailable'), {
          type: 'danger',
          duration: 3000,
        });
        return;
      }

      const updatedItems = [...temporaryAddItemToOutfitSlice, result];
      dispatch(setTemporaryAddItemToOutfit(updatedItems));
      dispatch(setRefNumber(generateGUID()));

      if (result.processingStatus === 'original') {
        toast.show(t('wardrobe.addedWithOriginalImage'), {
          type: 'info',
          duration: 3000,
        });
      }

      setTimeout(() => {
        setAddToOutfitLoader(false);
        router.push('/collage');
      }, 500);

    } catch (err: any) {
      setAddToOutfitLoader(false);
      toast.show(t('wardrobe.failedToAddItemToOutfit'), {
        type: 'danger',
        duration: 4000,
      });
    }
  };

  const handleSellNow = () => {
    router.push({
      pathname: '/add',
      params: { existingItemId: item?.id },
    });
  };

  const handleDownloadItem = async () => {
    // Use the same image source logic as the UI display
    const imageUri =
      displayItem?.itemDefaultImageUrl ||
      displayItem?.itemImageUrls?.[0] ||
      item?.itemDefaultImageUrl ||
      item?.itemImageUrls?.[0];

    if (!imageUri) {
      toast.show(t('wardrobe.noImageToDownload'), { type: 'danger', duration: 2000 });
      return;
    }

    try {
      setDownloadLoading(true);
      setDownloadProgress(0);

      // Request MediaLibrary permissions first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        toast.show(t('wardrobe.unableToSave'), {
          type: 'warning',
          duration: 3000,
        });
        setDownloadLoading(false);
        return;
      }

      // Progress: 20% - Starting capture
      setDownloadProgress(20);
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Progress: 40% - Capturing image
      setDownloadProgress(40);
      const uri = await captureRef(watermarkViewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      // Progress: 70% - Processing watermark
      setDownloadProgress(70);
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Progress: 90% - Saving to device
      setDownloadProgress(90);

      // Save directly to media library
      await MediaLibrary.saveToLibraryAsync(uri);

      // Progress: 100% - Complete
      setDownloadProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Show success message
      toast.show(t('wardrobe.itemSavedToPhotos'), {
        type: 'success',
        duration: 3000,
      });

      // Close modal and reset states
      setIsShowMenuModal(false);
      setDownloadLoading(false);
      setDownloadProgress(0);
    } catch (error) {
      setIsShowMenuModal(false);
      setDownloadLoading(false);
      toast.show(t('wardrobe.failedToDownloadItem'), { type: 'danger', duration: 3000 });
    }
  };

  if (!item && !displayItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('wardrobe.itemNotFound')}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>{t('wardrobe.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('wardrobe.itemDetails')}</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsShowMenuModal(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                displayItem?.itemDefaultImageUrl ||
                displayItem?.itemImageUrls?.[0] ||
                item?.itemDefaultImageUrl ||
                item?.itemImageUrls?.[0],
            }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        </View>

        {/* Item Details */}
        <View style={styles.detailsContainer}>
          {/* Brand */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('wardrobe.brand')}</Text>
            <Text style={styles.detailValue}>
              {displayItem?.brandName || displayItem?.brand || 'N/A'}
            </Text>
          </View>

          {/* Size */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('wardrobe.size')}</Text>
            <Text style={styles.detailValue}>
              {displayItem?.sizeName || displayItem?.size || 'N/A'}
            </Text>
          </View>

          {/* Season */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('wardrobe.season')}</Text>
            <Text style={styles.detailValue}>
              {displayItem?.seasonName || displayItem?.season || 'N/A'}
            </Text>
          </View>

          {/* Title */}
          {displayItem?.title && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('wardrobe.title')}</Text>
              <Text style={styles.detailValue}>{displayItem.title}</Text>
            </View>
          )}

          {/* Description */}
          {displayItem?.description && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('wardrobe.description')}</Text>
              <Text style={styles.detailValue}>{displayItem.description}</Text>
            </View>
          )}

          {/* Price */}
          {displayItem?.price && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('wardrobe.price')}</Text>
              <Text style={styles.detailValue}>£{displayItem.price}</Text>
            </View>
          )}

          {/* Status */}
          {displayItem?.status && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('wardrobe.status')}</Text>
              <Text style={styles.detailValue}>
                {displayItem.status}
              </Text>
            </View>
          )}

          {/* Color */}
          {displayItem?.itemColours && displayItem?.itemColours?.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('wardrobe.color')}</Text>
              <Text style={styles.detailValue}>
                {displayItem.itemColours
                  .map((color: any) => color?.itemColour || color)
                  .join(', ')}
              </Text>
            </View>
          )}
        </View>


      </ScrollView>

      {/* Hidden Watermarked View for Capture */}
      <View style={styles.hiddenWatermarkContainer}>
        <View
          ref={watermarkViewRef}
          style={styles.watermarkView}
          collapsable={false}
        >
          {/* Base item image */}
          {(displayItem?.itemDefaultImageUrl ||
            displayItem?.itemImageUrls?.[0] ||
            item?.itemDefaultImageUrl ||
            item?.itemImageUrls?.[0]) && (
            <Image
              source={{
                uri:
                  displayItem?.itemDefaultImageUrl ||
                  displayItem?.itemImageUrls?.[0] ||
                  item?.itemDefaultImageUrl ||
                  item?.itemImageUrls?.[0],
              }}
              style={styles.watermarkImage}
            />
          )}

          {/* Watermark overlay */}
          <View style={styles.watermarkOverlay}>
            <Image
              source={require('../../assets/images/watermark.png')}
              style={styles.watermarkLogo}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* Menu Bottom Sheet */}
      <BottomModal
        isShow={isShowMenuModal}
        onClose={() => setIsShowMenuModal(false)}
        modalHeight={300}
      >
        <View style={styles.menuModalContent}>
          <Text style={styles.menuModalTitle}>{t('wardrobe.whatDoYouWantToDo')}</Text>

          {/* Download Item */}
          {!downloadLoading && (
            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleDownloadItem}
              disabled={downloadLoading}
            >
              <View style={styles.menuOptionIcon}>
                <Ionicons name="download-outline" size={24} color="#FF5C68" />
              </View>
              <Text style={styles.menuOptionText}>{t('wardrobe.downloadToYourDevice')}</Text>
            </TouchableOpacity>
          )}

          {/* Download Progress */}
          {downloadLoading && (
            <View style={styles.downloadProgressContainer}>
              <Text style={styles.downloadProgressText}>
                {t('wardrobe.downloadingProgress', { progress: downloadProgress })}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${downloadProgress}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Edit Item */}
          <TouchableOpacity
            style={styles.menuOption}
            onPress={() => {
              setIsShowMenuModal(false);
              // Navigate to edit page with item data
              const imageUrl =
                displayItem?.itemDefaultImageUrl ||
                displayItem?.itemImageUrls?.[0] ||
                '';
              router.push({
                pathname: '/(authenticated)/editItem',
                params: {
                  itemData: JSON.stringify(displayItem),
                  imageUrl:
                    displayItem?.itemDefaultImageUrl ||
                    displayItem?.itemImageUrls?.[0] ||
                    '',
                },
              });
            }}
          >
            <View style={styles.menuOptionIcon}>
              <EditIconComponent />
            </View>
            <Text style={styles.menuOptionText}>{t('wardrobe.editItem')}</Text>
          </TouchableOpacity>

          {/* Delete Item */}
          <TouchableOpacity
            style={styles.menuOption}
            onPress={() => {
              setIsShowMenuModal(false);
              handleDeleteItem();
            }}
          >
            <View style={styles.menuOptionIcon}>
              <DeleteIconComponent />
            </View>
            <Text style={[styles.menuOptionText, styles.deleteOptionText]}>
              {t('wardrobe.deleteItem')}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomModal>

      {/* Delete Modal */}
      {isShowDeleteModal && (
        <DeleteItemModal
          deleteDetail={item}
          onClose={() => setIsShowDeleteModal(false)}
          refetch={() => {
            // Navigate back after successful delete
            router.back();
          }}
          loader={deleteLoader}
          handleDelete={performDelete}
        />
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <CustomButton
          title={t('wardrobe.addToOutfit')}
          buttonStyle={[styles.actionButton, styles.outfitButton]}
          textStyle={styles.outfitButtonText}
          onPress={handleAddToOutfit}
          loader={addToOutfitLoader}
        />

        {!item?.isForSale && (
          <CustomButton
            title={t('wardrobe.sellNow')}
            buttonStyle={[styles.actionButton, styles.sellButton]}
            textStyle={styles.sellButtonText}
            onPress={handleSellNow}
          />
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteItem}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B4A" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 5 : 35,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: fontSz(18),
    fontFamily: 'DMSansMedium',
    color: '#000',
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 350,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 30,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 20,
  },
  detailRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: fontSz(12),
    fontFamily: 'DMSansMedium',
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: fontSz(12),
    fontFamily: 'DMSansRegular',
    color: '#000',
    flex: 2,
    textAlign: 'right',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellButton: {
    backgroundColor: '#FF3B4A',
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  sellButtonText: {
    color: '#fff',
    fontSize: fontSz(16),
    fontFamily: 'DMSansMedium',
  },
  outfitButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B4A',
    marginLeft: 12,
  },
  deleteButton: {
    backgroundColor: '#FFD8DB',
    borderWidth: 1,
    borderColor: '#FF3B4A',
    maxWidth: 50,
  },
  outfitButtonText: {
    color: '#FF3B4A',
    fontSize: fontSz(16),
    fontFamily: 'DMSansMedium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSz(18),
    fontFamily: 'DMSansMedium',
    color: '#666',
    marginBottom: 20,
  },
  backText: {
    fontSize: fontSz(16),
    fontFamily: 'DMSansRegular',
    color: '#FF3B4A',
  },
  menuModalContent: {
    paddingVertical: 10,
  },
  menuModalTitle: {
    fontSize: fontSz(18),
    fontFamily: 'DMSansMedium',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  menuOptionIcon: {
    width: 40,
    height: 40,
    marginEnd: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuOptionText: {
    fontSize: fontSz(14),
    fontFamily: 'DMSansRegular',
    color: '#000',
    flex: 1,
  },
  deleteOptionText: {
    color: '#FF3B4A',
  },
  hiddenWatermarkContainer: {
    position: 'absolute',
    top: -1000, // Hide off-screen but not too far
    left: 0,
    opacity: 0,
    zIndex: -1,
  },
  watermarkView: {
    width: 400,
    height: 400,
    position: 'relative',
  },
  watermarkImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  watermarkOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 80,
    height: 40,
  },
  watermarkLogo: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  downloadProgressContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  downloadProgressText: {
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#FF5C68',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF5C68',
    borderRadius: 2,
  },
});

export default ItemDetail;
