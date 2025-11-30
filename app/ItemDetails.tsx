import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@redux/store';
import StackHeader from '@components/StackHeader';
import marketplaceServices from '@services/features/marketplace/marketplaceServices';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import timelineServices from '@services/features/timeline-service/timelineServices';
import { useToast } from 'react-native-toast-notifications';
import VerifiedIcon from '../assets/images/svg/verified.svg';
import { useI18n } from '../hooks/use-i18n';
import ProfileAssetDetails from '@components/ProfileAssetDetails';

const ItemDetails = () => {
  const {
    itemId,
    itemData,
    username: passedUsername,
    userId: passedUserId,
  } = useLocalSearchParams();
  const { profile, token } = useAppSelector((state) => state?.userProfileSlice);
  const { countryId } = useAppSelector((state) => state?.userCountryId);
  const toast = useToast();
  const { t } = useI18n();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [storedUsername, setStoredUsername] = useState<string>(''); // Store username from navigation

  useEffect(() => {
    if (itemId) {
      fetchItemDetails(Array.isArray(itemId) ? itemId[0] : itemId);
    } else {
      setError('No item ID provided');
      setLoading(false);
    }
  }, [itemId]);

  const fetchItemDetails = async (id: string) => {
    try {
      setLoading(true);

      // First, try to use the real item data passed from navigation params (grid navigation)
      if (itemData) {
        // Debugging for when item?.username is not present
        try {
          const itemDataString = Array.isArray(itemData) ? itemData[0] : itemData;
          const parsedItemData = JSON.parse(itemDataString);
          // since the parsedItemdata is not containing the username please can you include it from the parent component

          setItem(parsedItemData);
          setIsLiked((parsedItemData as any)?.isFavourite || false);
          setLikeCount((parsedItemData as any)?.favouriteCount || 0);

          // STORE THE USERNAME - prioritize passed params, then item data
          const passedUsernameValue = Array.isArray(passedUsername)
            ? passedUsername[0]
            : passedUsername;

          const clickedItemUsername =
            passedUsernameValue ||
            parsedItemData?.username ||
            parsedItemData?.sellerUsername ||
            parsedItemData?.posterUsername ||
            parsedItemData?.userDisplayName ||
            parsedItemData?.sellerName ||
            'User';
          

          setStoredUsername(clickedItemUsername);

          // Fetch other items by this user
          setLoading(false);
          return;
        } catch (parseError) {}
      }

      // If no item data in params, fetch from API
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
     
      const response = await marketplaceServices.getItemDetails(
        token,
        countryId || profile?.countryId,
        id,
      );
      if (response.responseCode === '0' && response.data) {

        setItem(response.data);
        setIsLiked((response.data as any)?.isFavourite || false);
        setLikeCount((response.data as any)?.favouriteCount || 0);

        // ALSO STORE USERNAME FROM API RESPONSE IF NOT ALREADY STORED
        if (!storedUsername) {
         
          const apiItemUsername =
            (response.data as any)?.username ||
            (response.data as any)?.sellerUsername ||
            (response.data as any)?.posterUsername ||
            (response.data as any)?.userDisplayName ||
            (response.data as any)?.sellerName ||
            (response.data as any)?.sellerInfo?.name ||
            'User';

          setStoredUsername(apiItemUsername);
        } else {
         
        }

        setLoading(false);
      } else {
        setError('Item not found');
        setLoading(false);

        toast.show('Item not found', {
          type: 'danger',
          duration: 3000,
        });
      }
    } catch (error) {
      setError('Failed to load item details');
      setLoading(false);

      toast.show('Failed to load item details', {
        type: 'danger',
        duration: 3000,
      });
    }
  };


  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(authenticated)/(tabs)/home');
    }
  };

  const handleLike = async () => {
    if (!token || !item?.id) return;

    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));

      if (newLikedState) {
        await wardrobeServices.favouriteItem({ itemId: item.id }, token);
        toast.show('Added to favorites', { type: 'success', duration: 2000 });
      } else {
        await wardrobeServices.removeFavouriteItem({ itemId: item.id }, token);
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
        <StackHeader title={t('common.item')} onPress={handleGoBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B4A" />
          <Text style={styles.loadingText}>Loading item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.container}>
        <StackHeader title={t('common.item')} onPress={handleGoBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Item not found'}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => fetchItemDetails(Array.isArray(itemId) ? itemId[0] : itemId)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Debug logging before render to see final state

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader
        title={`${item?.username || 'User'}'s wardrobe`}
        onPress={handleGoBack}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Large Item Image */}
        <View style={styles.imageContainer}>
          {item?.defaultImageUrl ? (
            <Image
              source={{ uri: item.defaultImageUrl }}
              style={styles.itemImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>

        {/* User Info and Like Section */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            {/* Profile Picture */}
            <View style={styles.profileImageContainer}>
              {item?.userImageUrl ? (
                <Image
                  source={{ uri: item.userImageUrl }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>
                    {getInitials(item?.username || 'U')}
                  </Text>
                </View>
              )}
            </View>

            {/* Item Name and Verified Badge */}
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>
                {item?.brandName || item?.brand || item?.itemBrand || 'Item'}
              </Text>
              {item?.hasTag && (
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

        {/* Item Details Section */}
        {item && <ProfileAssetDetails asset={item} />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#F5F5F5',
    marginHorizontal: 14,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    aspectRatio: 1,
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
    paddingHorizontal: 24,
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
    color: '#FFFFFF',
    fontSize: 16,
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
});

export default ItemDetails;
