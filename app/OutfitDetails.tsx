import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@redux/store';
import StackHeader from '@components/StackHeader';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import BottomModal from '@components/BottomModal';
import marketplaceServices from '@services/features/marketplace/marketplaceServices';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import timelineServices from '@services/features/timeline-service/timelineServices';
import { useToast } from 'react-native-toast-notifications';
import VerifiedIcon from '../assets/images/svg/verified.svg';
import CancelIcon from '../assets/images/svg/cancel-icon.svg';
import DownloadIconSvg from '@assets/images/svg_components/download_icon_svg';
import NewBottomModal from '@components/NewBottomModal';
import SuccessCheckIcon from '@assets/images/svg_components/sucess_check_icon';
import { useI18n } from '@hooks/use-i18n';
import ProfileAssetDetails from '@components/ProfileAssetDetails';

const { width: screenWidth } = Dimensions.get('window');

const OutfitDetails = () => {
  const { t } = useI18n();
  const {
    outfitId,
    outfitData,
    username: passedUsername,
    userId: passedUserId,
  } = useLocalSearchParams();
  const { profile, token } = useAppSelector((state) => state?.userProfileSlice);
  const { countryId } = useAppSelector((state) => state?.userCountryId);
  const toast = useToast();

  const [outfit, setOutfit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [storedUsername, setStoredUsername] = useState<string>(''); // Store username from navigation
  const [isShowMenuModal, setIsShowMenuModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const watermarkViewRef = useRef(null);

  useEffect(() => {
    if (outfitId) {
      fetchOutfitDetails(Array.isArray(outfitId) ? outfitId[0] : outfitId);
    } else {
      setError('No outfit ID provided');
      setLoading(false);
    }
  }, [outfitId]);

  const fetchOutfitDetails = async (id: string) => {
    try {
      setLoading(true);

      // First, try to use the real outfit data passed from navigation params (grid navigation)
      if (outfitData) {
        try {
          const outfitDataString = Array.isArray(outfitData)
            ? outfitData[0]
            : outfitData;
          const parsedOutfitData = JSON.parse(outfitDataString);
          setOutfit(parsedOutfitData);
          setIsLiked((parsedOutfitData as any)?.isFavourite || false);
          setLikeCount((parsedOutfitData as any)?.favouriteCount || 0);

          // STORE THE USERNAME - prioritize passed params, then outfit data
          const clickedOutfitUsername =
            (Array.isArray(passedUsername)
              ? passedUsername[0]
              : passedUsername) ||
            parsedOutfitData?.username ||
            parsedOutfitData?.sellerUsername ||
            parsedOutfitData?.posterUsername ||
            parsedOutfitData?.userDisplayName ||
            parsedOutfitData?.sellerName ||
            'User';
          setStoredUsername(clickedOutfitUsername);

          setLoading(false);
          return;
        } catch (parseError) {}
      }

      // If no outfit data in params or parsing failed, fetch from API
      if (!outfitId) {
        setError('No outfit ID provided');
        setLoading(false);
        return;
      }
      // Note: Replace with actual outfit details API when available
      const response = await marketplaceServices.getItemDetails(
        token,
        countryId || profile?.countryId,
        id,
      );
      if (response.responseCode === '0' && response.data) {
        setOutfit(response.data);
        setIsLiked((response.data as any)?.isFavourite || false);
        setLikeCount((response.data as any)?.favouriteCount || 0);

        // ALSO STORE USERNAME FROM API RESPONSE IF NOT ALREADY STORED
        if (!storedUsername) {
          const apiOutfitUsername =
            (response.data as any)?.username ||
            (response.data as any)?.sellerUsername ||
            (response.data as any)?.posterUsername ||
            (response.data as any)?.userDisplayName ||
            (response.data as any)?.sellerName ||
            'User';
          setStoredUsername(apiOutfitUsername);
        }

        setLoading(false);
      } else {
        setError('Outfit not found');
        setLoading(false);

        // Navigate back if outfit not found
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(authenticated)/(tabs)/home');
        }
      }
    } catch (error) {
      setError('Failed to load outfit details');
      setLoading(false);

      // Navigate back on error
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(authenticated)/(tabs)/home');
      }
    }
  };


  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(authenticated)/(tabs)/home');
    }
  };

  const handleDownloadOutfit = async () => {
    if (!outfit?.defaultImageUrl) {
      toast.show(t('wardrobe.noImage'), { type: 'danger', duration: 2000 });
      return;
    }

    try {
      setDownloadLoading(true);
      setDownloadProgress(0);

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

      // Progress: 90% - Preparing to save
      setDownloadProgress(90);

      // Save to app directory with timestamp
      const timestamp = new Date().getTime();
      const filename = `digitizeapp_outfit_${timestamp}.png`;
      const permanentUri = FileSystem.documentDirectory + filename;
      await FileSystem.copyAsync({ from: uri, to: permanentUri });

      // Progress: 100% - Complete
      setDownloadProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Close modal and reset states
      setIsShowMenuModal(false);
      setDownloadLoading(false);
      setDownloadProgress(0);

      // Show success message and offer sharing
      toast.show('Outfit captured! Opening save options...', {
        type: 'success',
        duration: 2000,
      });

      // Small delay then open sharing dialog
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(permanentUri, {
          mimeType: 'image/png',
          dialogTitle: 'Save Outfit to Photos',
        });
      }
    } catch (error) {
      setIsShowMenuModal(false);
      setDownloadLoading(false);
      toast.show(t('wardrobe.downloadFailed'), {
        type: 'danger',
        duration: 3000,
      });
    }
  };

  const handleLike = async () => {
    if (!token || !outfit?.id) return;

    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));

      if (newLikedState) {
        await wardrobeServices.favouriteItem({ itemId: outfit.id }, token);
        toast.show('Added to favorites', { type: 'success', duration: 2000 });
      } else {
        await wardrobeServices.removeFavouriteItem(
          { itemId: outfit.id },
          token,
        );
        toast.show('Removed from favorites', {
          type: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
      toast.show('Failed to update favorites', {
        type: 'danger',
        duration: 2000,
      });
    }
  };


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StackHeader title={t('wardrobe.outfit')} onPress={handleGoBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B4A" />
          <Text style={styles.loadingText}>{t('wardrobe.loadingOutfitDetails')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !outfit) {
    return (
      <SafeAreaView style={styles.container}>
        <StackHeader title={t('wardrobe.outfit')} onPress={handleGoBack} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error || t('wardrobe.outfitNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <StackHeader title={t('wardrobe.outfitDetails')} onPress={handleGoBack} />
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsShowMenuModal(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Outfit Image */}
        <View style={styles.imageContainer}>
          {outfit?.defaultImageUrl ? (
            <Image
              source={{ uri: outfit.defaultImageUrl }}
              style={styles.outfitImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>

        {/* Hidden Watermarked View for Capture */}
        <View style={styles.hiddenWatermarkContainer}>
          <View
            ref={watermarkViewRef}
            style={styles.watermarkView}
            collapsable={false}
          >
            {/* Base outfit image */}
            {outfit?.defaultImageUrl && (
              <Image
                source={{ uri: outfit.defaultImageUrl }}
                style={styles.watermarkImage}
              />
            )}

            {/* Watermark overlay */}
            <View style={styles.watermarkOverlay}>
              <Image
                source={require('../assets/images/watermark.png')}
                style={styles.watermarkLogo}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* User Info and Like Section */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            {/* Profile Picture */}
            <View style={styles.profileImageContainer}>
              {outfit?.userImageUrl ? (
                <Image
                  source={{ uri: outfit.userImageUrl }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>
                    {getInitials(outfit?.username || 'U')}
                  </Text>
                </View>
              )}
            </View>

            {/* Outfit Name and Verified Badge */}
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>
                {outfit?.description || outfit?.name || outfit?.title || 'Outfit'}
              </Text>
              {outfit?.hasTag && (
                <View style={styles.verifiedBadge}>
                  <VerifiedIcon width={16} height={16} />
                </View>
              )}
            </View>
          </View>

          {/* Like Button */}
          <Pressable style={styles.likeButton} onPress={handleLike}>
            <Image
              source={
                isLiked
                  ? require('../assets/images/svg/like2.png')
                  : require('../assets/images/svg/like.png')
              }
              style={styles.likeIcon}
            />
            <Text style={styles.likeCount}>{likeCount} Likes</Text>
          </Pressable>
        </View>

        {/* Outfit Details Section */}
        {outfit && <ProfileAssetDetails asset={outfit} />}
      </ScrollView>

      {/* Menu Bottom Modal */}
      <NewBottomModal
        maxHeight={170}
        isShow={isShowMenuModal}
        onClose={() => setIsShowMenuModal(false)}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={() => setIsShowMenuModal(false)}>
            <CancelIcon
              width={19}
              height={19}
              style={{ alignSelf: 'flex-end' }}
            />
          </TouchableOpacity>

          <Text style={styles.menuTitle}>{t('wardrobe.whatDoYouWantToDo')}</Text>
          {!downloadLoading && (
            <TouchableOpacity
              style={styles.menuOptionIcon}
              onPress={handleDownloadOutfit}
              disabled={downloadLoading}
            >
              <DownloadIconSvg color="#FF5C68" />
              <Text style={styles.menuOptionText}>
                {' '}
                Download to your Device
              </Text>
            </TouchableOpacity>
          )}
          {downloadLoading && (
            <View>
              <Text style={styles.DownloadText}>
                {downloadProgress === 100 ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.menuOptionText}>
                      {t('wardrobe.downloadCompleted')}
                    </Text>
                    <SuccessCheckIcon style={{ marginLeft: 6 }} />
                  </View>
                ) : (
                  <Text style={styles.menuOptionText}>{t('wardrobe.downloading')}</Text>
                )}
              </Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${downloadProgress}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </NewBottomModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'DMSansRegular',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B4A',
    textAlign: 'center',
    fontFamily: 'DMSansRegular',
  },
  imageContainer: {
    width: screenWidth,
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
  },
  outfitImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
    fontFamily: 'DMSansRegular',
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  profileImagePlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#FF5C68',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'DMSansBold',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212C3D',
    fontFamily: 'DMSans',
  },
  verifiedBadge: {
    // height: 20,
    width: 40,
    marginLeft: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    width: 45,
    height: 45,
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'DMSansRegular',
  },
  menuContainer: {
    paddingVertical: 16,
  },
  menuOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuOptionIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuOptionText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#333',
    fontFamily: 'DMSansRegular',
  },
  DownloadText: {
    paddingLeft: 25,
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    fontFamily: 'DMSansRegular',
  },
  menuTitle: {
    fontSize: 16,
    color: '#1E2226',
    fontFamily: 'DMSansRegular',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    width: '80%',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '80%',
    height: 4,
    backgroundColor: '#FFD8DB',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF5C68',
    borderRadius: 2,
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
});

export default OutfitDetails;
