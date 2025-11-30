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
import ItemCard from '@components/ItemCard';
import GridSkeleton from '@components/GridSkeleton';
import timelineServices from '@services/features/timeline-service/timelineServices';
import identityServices from '@services/features/identity-service/loginService';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import { useToast } from 'react-native-toast-notifications';
import VerifiedIcon from '../assets/images/svg/verified.svg';
import CancelIcon from '../assets/images/svg/cancel-icon.svg';
import DownloadIconSvg from '@assets/images/svg_components/download_icon_svg';
import NewBottomModal from '@components/NewBottomModal';
import SuccessCheckIcon from '@assets/images/svg_components/sucess_check_icon';
import { useI18n } from '@hooks/use-i18n';

const { width: screenWidth } = Dimensions.get('window');

const OutfitDetailsUpdated = () => {
  const { t } = useI18n();
  const {
    outfitId,
    outfitData,
    username: passedUsername,
    userId: passedUserId,
  } = useLocalSearchParams();
  const { profile, token } = useAppSelector((state) => state?.userProfileSlice);
  const toast = useToast();

  const [outfit, setOutfit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userOutfits, setUserOutfits] = useState<any[]>([]);
  const [loadingUserOutfits, setLoadingUserOutfits] = useState(false);
  const [storedUsername, setStoredUsername] = useState<string>('');
  const [isShowMenuModal, setIsShowMenuModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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

      // First, try to use the outfit data passed from navigation params
      if (outfitData) {
        try {
          const outfitDataString = Array.isArray(outfitData)
            ? outfitData[0]
            : outfitData;
          const parsedOutfitData = JSON.parse(outfitDataString);
          setOutfit(parsedOutfitData);
          setIsLiked((parsedOutfitData as any)?.isFavourite || false);
          setLikeCount((parsedOutfitData as any)?.favouriteCount || 0);

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

          // Fetch other outfits by this user using the new endpoint
          const outfitUserId =
            (Array.isArray(passedUserId) ? passedUserId[0] : passedUserId) ||
            (parsedOutfitData as any)?.userId ||
            (parsedOutfitData as any)?.sellerId;

          if (outfitUserId) {
            fetchUserOutfits(outfitUserId);
          }

          setLoading(false);
          return;
        } catch (parseError) {
          console.error('Error parsing outfit data:', parseError);
        }
      }

      // If no outfit data in params, we need userId from passed params or fetch current user
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      // Get userId - first try from passed params, otherwise get current user's ID
      let ownerUserId = (Array.isArray(passedUserId) ? passedUserId[0] : passedUserId);
      
      if (!ownerUserId) {
        // Fetch current user ID from identity endpoint as fallback
        try {
          const identityResponse = await identityServices.getUserProfile(token);
          if (identityResponse.responseCode === '0' && identityResponse.data) {
            ownerUserId = identityResponse.data.id;
            setCurrentUserId(ownerUserId);
          } else {
            setError('Failed to get user information');
            setLoading(false);
            return;
          }
        } catch (error) {
          setError('Failed to get user information');
          setLoading(false);
          return;
        }
      }

      // Fetch wardrobe assets to find the specific outfit
      const response = await timelineServices.getWardrobeAssets(
        token,
        ownerUserId,
        'WardrobeOutfit',
      );

      if (response.responseCode === '0' && response.data?.dataset) {
        // Find the specific outfit by ID
        const foundOutfit = response.data.dataset.find(
          (asset: any) => asset.id === id,
        );

        if (foundOutfit) {
          // Transform the asset data to match the expected format
          const transformedOutfit = {
            id: foundOutfit.id,
            name: foundOutfit.name,
            description: foundOutfit.description,
            defaultImageUrl: foundOutfit.imageUrl,
            imageUrl: foundOutfit.imageUrl,
            assetType: foundOutfit.assetType,
            datePosted: foundOutfit.datePosted,
            username: storedUsername || 'User',
            // Add default values for fields that might not be in the response
            isFavourite: false,
            favouriteCount: 0,
          };

          setOutfit(transformedOutfit);
          setIsLiked(false);
          setLikeCount(0);

          // Fetch other outfits by this user
          if (ownerUserId) {
            fetchUserOutfits(ownerUserId);
          }

          setLoading(false);
        } else {
          setError('Outfit not found');
          setLoading(false);
          toast.show('Outfit not found', {
            type: 'danger',
            duration: 3000,
          });
        }
      } else {
        setError('Failed to load outfit details');
        setLoading(false);
        toast.show('Failed to load outfit details', {
          type: 'danger',
          duration: 3000,
        });
      }
    } catch (error) {
      setError('Failed to load outfit details');
      setLoading(false);
      toast.show('Failed to load outfit details', {
        type: 'danger',
        duration: 3000,
      });
    }
  };

  const fetchUserOutfits = async (userId: string) => {
    if (!token) return;

    try {
      setLoadingUserOutfits(true);

      // Use the new wardrobe assets endpoint
      const response = await timelineServices.getWardrobeAssets(
        token,
        userId,
        'WardrobeOutfit',
      );

      if (response.responseCode === '0' && response.data?.dataset) {
        const currentOutfitId = Array.isArray(outfitId) ? outfitId[0] : outfitId;
        const usernameToUse = storedUsername || outfit?.username || 'User';

        // Transform the assets to match ItemCard expectations and exclude current outfit
        const otherUserOutfits = response.data.dataset
          .filter((asset: any) => asset.id !== currentOutfitId)
          .map((asset: any) => ({
            id: asset.id,
            name: asset.name,
            description: asset.description,
            brand: asset.name || 'Outfit',
            size: '',
            amount: '0',
            defaultImageUrl: asset.imageUrl,
            imageUrl: asset.imageUrl,
            username: usernameToUse,
            isFavourite: false,
            favouriteCount: 0,
            assetType: asset.assetType,
            datePosted: asset.datePosted,
          }));

        setUserOutfits(otherUserOutfits);
      } else {
        setUserOutfits([]);
      }

      setLoadingUserOutfits(false);
    } catch (error) {
      setLoadingUserOutfits(false);
      setUserOutfits([]);
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
    if (!outfit?.defaultImageUrl && !outfit?.imageUrl) {
      toast.show(t('wardrobe.noImage'), { type: 'danger', duration: 2000 });
      return;
    }

    try {
      setDownloadLoading(true);
      setDownloadProgress(0);

      setDownloadProgress(20);
      await new Promise((resolve) => setTimeout(resolve, 400));

      setDownloadProgress(40);
      const uri = await captureRef(watermarkViewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      setDownloadProgress(70);
      await new Promise((resolve) => setTimeout(resolve, 200));

      setDownloadProgress(90);

      const timestamp = new Date().getTime();
      const filename = `digitizeapp_outfit_${timestamp}.png`;
      const permanentUri = FileSystem.documentDirectory + filename;
      await FileSystem.copyAsync({ from: uri, to: permanentUri });

      setDownloadProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setIsShowMenuModal(false);
      setDownloadLoading(false);
      setDownloadProgress(0);

      toast.show('Outfit captured! Opening save options...', {
        type: 'success',
        duration: 2000,
      });

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
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
      toast.show('Failed to update favorites', {
        type: 'danger',
        duration: 2000,
      });
    }
  };

  const handleOutfitLike = async (
    outfitId: string,
    currentLikedState: boolean,
  ) => {
    if (!token || !outfitId) return;

    try {
      const newLikedState = !currentLikedState;

      setUserOutfits((prevOutfits) =>
        prevOutfits.map((userOutfit) =>
          userOutfit.id === outfitId
            ? {
                ...userOutfit,
                isFavourite: newLikedState,
                favouriteCount: newLikedState
                  ? (userOutfit.favouriteCount || 0) + 1
                  : Math.max((userOutfit.favouriteCount || 0) - 1, 0),
              }
            : userOutfit,
        ),
      );

      if (newLikedState) {
        await wardrobeServices.favouriteItem({ itemId: outfitId }, token);
        toast.show('Added to favorites', { type: 'success', duration: 2000 });
      } else {
        await wardrobeServices.removeFavouriteItem({ itemId: outfitId }, token);
        toast.show('Removed from favorites', {
          type: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      setUserOutfits((prevOutfits) =>
        prevOutfits.map((userOutfit) =>
          userOutfit.id === outfitId
            ? {
                ...userOutfit,
                isFavourite: currentLikedState,
                favouriteCount: currentLikedState
                  ? (userOutfit.favouriteCount || 0) + 1
                  : Math.max((userOutfit.favouriteCount || 0) - 1, 0),
              }
            : userOutfit,
        ),
      );
      toast.show('Failed to update favorites', {
        type: 'danger',
        duration: 2000,
      });
    }
  };

  const handleOutfitPress = (selectedOutfit: any) => {
    const essentialData = {
      ...selectedOutfit,
      username: selectedOutfit.username || storedUsername || outfit?.username,
      userImageUrl: selectedOutfit.userImageUrl || outfit?.userImageUrl,
      userId: selectedOutfit.userId || selectedOutfit.sellerId || currentUserId,
    };

    router.push({
      pathname: '/outfitDetailsUpdated',
      params: {
        outfitId: selectedOutfit.id,
        outfitData: JSON.stringify(essentialData),
        username: essentialData.username,
        userId: essentialData.userId,
      },
    });
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
          <Text style={styles.loadingText}>
            {t('wardrobe.loadingOutfitDetails')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !outfit) {
    return (
      <SafeAreaView style={styles.container}>
        <StackHeader title={t('wardrobe.outfit')} onPress={handleGoBack} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            {error || t('wardrobe.outfitNotFound')}
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              fetchOutfitDetails(Array.isArray(outfitId) ? outfitId[0] : outfitId);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <StackHeader
          title={t('wardrobe.outfitDetails')}
          onPress={handleGoBack}
        />
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
          {outfit?.defaultImageUrl || outfit?.imageUrl ? (
            <Image
              source={{ uri: outfit.defaultImageUrl || outfit.imageUrl }}
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
            {(outfit?.defaultImageUrl || outfit?.imageUrl) && (
              <Image
                source={{ uri: outfit.defaultImageUrl || outfit.imageUrl }}
                style={styles.watermarkImage}
              />
            )}

            <View style={styles.watermarkOverlay}>
              <Image
                source={require('../assets/images/watermark.png')}
                style={styles.watermarkLogo}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Outfit Name and Description */}
        {outfit?.name && (
          <View style={styles.outfitInfoContainer}>
            <Text style={styles.outfitName}>{outfit.name}</Text>
            {outfit?.description && (
              <Text style={styles.outfitDescription}>{outfit.description}</Text>
            )}
          </View>
        )}

        {/* User Info and Like Section */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
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

            <View style={styles.usernameContainer}>
              <Text style={styles.username}>
                {outfit?.username || 'Unknown User'}
              </Text>
              {outfit?.hasTag && (
                <View style={styles.verifiedBadge}>
                  <VerifiedIcon width={16} height={16} />
                </View>
              )}
            </View>
          </View>

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

        {/* Other Outfits by User Section */}
        <View style={styles.otherOutfitsSection}>
          <Text style={styles.otherOutfitsTitle}>
            {t('wardrobe.otherOutfitsBy')}{' '}
            <Text style={styles.usernameHighlight}>
              {outfit?.username || t('wardrobe.thisUser')}
            </Text>
          </Text>

          {loadingUserOutfits ? (
            <GridSkeleton />
          ) : userOutfits.length > 0 ? (
            <View style={styles.outfitsGrid}>
              {userOutfits.map((userOutfit, index) => (
                <View key={userOutfit.id || index} style={styles.gridItem}>
                  <ItemCard
                    item={userOutfit}
                    onPress={() => handleOutfitPress(userOutfit)}
                    onLike={() =>
                      handleOutfitLike(
                        userOutfit.id,
                        userOutfit?.isFavourite || false,
                      )
                    }
                    isLiked={userOutfit?.isFavourite || false}
                    likeCount={userOutfit?.favouriteCount || 0}
                    userName={outfit?.username}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {t('wardrobe.noOtherOutfitsFound')}
              </Text>
            </View>
          )}
        </View>
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

          <Text style={styles.menuTitle}>
            {t('wardrobe.whatDoYouWantToDo')}
          </Text>
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
                  <Text style={styles.menuOptionText}>
                    {t('wardrobe.downloading')}
                  </Text>
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
    paddingHorizontal: 32,
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
    marginBottom: 24,
    fontFamily: 'DMSansRegular',
  },
  retryButton: {
    backgroundColor: '#FF3B4A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSansMedium',
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
  outfitInfoContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  outfitName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212C3D',
    marginBottom: 8,
    fontFamily: 'DMSansBold',
  },
  outfitDescription: {
    fontSize: 14,
    color: '#666',
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
  otherOutfitsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  otherOutfitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'DMSansMedium',
  },
  usernameHighlight: {
    color: '#333',
    fontWeight: '700',
  },
  outfitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'DMSansRegular',
  },
  menuContainer: {
    paddingVertical: 16,
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
    top: -1000,
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

export default OutfitDetailsUpdated;

