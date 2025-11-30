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
import ItemCard from '@components/ItemCard';
import GridSkeleton from '@components/GridSkeleton';
import timelineServices from '@services/features/timeline-service/timelineServices';
import identityServices from '@services/features/identity-service/loginService';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import { useToast } from 'react-native-toast-notifications';
import VerifiedIcon from '../assets/images/svg/verified.svg';
import { useI18n } from '../hooks/use-i18n';

const ItemDetailsUpd = () => {
  const {
    itemId,
    itemData,
    username: passedUsername,
    userId: passedUserId,
  } = useLocalSearchParams();
  console.log(passedUserId)
  const { profile, token } = useAppSelector((state) => state?.userProfileSlice);
  const toast = useToast();
  const { t } = useI18n();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userItems, setUserItems] = useState<any[]>([]);
  const [loadingUserItems, setLoadingUserItems] = useState(false);
  const [storedUsername, setStoredUsername] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

      // First, try to use the item data passed from navigation params
      if (itemData) {
        try {
          const itemDataString = Array.isArray(itemData) ? itemData[0] : itemData;
          const parsedItemData = JSON.parse(itemDataString);

          setItem(parsedItemData);
          setIsLiked((parsedItemData as any)?.isFavourite || false);
          setLikeCount((parsedItemData as any)?.favouriteCount || 0);

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

          // Fetch other items by this user using the new endpoint
          const itemUserId =
            (Array.isArray(passedUserId) ? passedUserId[0] : passedUserId) ||
            (parsedItemData as any)?.userId ||
            (parsedItemData as any)?.sellerId;

          if (itemUserId) {
            fetchUserItems(itemUserId);
          }

          setLoading(false);
          return;
        } catch (parseError) {
          console.error('Error parsing item data:', parseError);
        }
      }

      // If no item data in params, we need userId from passed params or fetch current user
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

      // Fetch wardrobe assets to find the specific item
      const response = await timelineServices.getWardrobeAssets(
        token,
        ownerUserId,
        'WardrobeItem',
      );

      if (response.responseCode === '0' && response.data?.dataset) {
        // Find the specific item by ID
        const foundItem = response.data.dataset.find(
          (asset: any) => asset.id === id,
        );

        if (foundItem) {
          // Transform the asset data to match the expected format
          const transformedItem = {
            id: foundItem.id,
            name: foundItem.name,
            description: foundItem.description,
            defaultImageUrl: foundItem.imageUrl,
            imageUrl: foundItem.imageUrl,
            assetType: foundItem.assetType,
            datePosted: foundItem.datePosted,
            username: storedUsername || 'User',
            // Add default values for fields that might not be in the response
            isFavourite: false,
            favouriteCount: 0,
          };

          setItem(transformedItem);
          setIsLiked(false);
          setLikeCount(0);

          // Fetch other items by this user
          if (ownerUserId) {
            fetchUserItems(ownerUserId);
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
      } else {
        setError('Failed to load item details');
        setLoading(false);
        toast.show('Failed to load item details', {
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

  const fetchUserItems = async (userId: string) => {
    if (!token) return;

    try {
      setLoadingUserItems(true);

      // Use the new wardrobe assets endpoint
      const response = await timelineServices.getWardrobeAssets(
        token,
        userId,
        'WardrobeItem',
      );

      if (response.responseCode === '0' && response.data?.dataset) {
        const currentItemId = Array.isArray(itemId) ? itemId[0] : itemId;
        const usernameToUse = storedUsername || item?.username || 'User';

        // Transform the assets to match ItemCard expectations and exclude current item
        const otherUserItems = response.data.dataset
          .filter((asset: any) => asset.id !== currentItemId)
          .map((asset: any) => ({
            id: asset.id,
            name: asset.name,
            description: asset.description,
            brand: asset.name || 'Brand',
            size: 'Size',
            amount: '0',
            defaultImageUrl: asset.imageUrl,
            imageUrl: asset.imageUrl,
            username: usernameToUse,
            isFavourite: false,
            favouriteCount: 0,
            assetType: asset.assetType,
            datePosted: asset.datePosted,
          }));

        setUserItems(otherUserItems);
      } else {
        setUserItems([]);
      }

      setLoadingUserItems(false);
    } catch (error) {
      setLoadingUserItems(false);
      setUserItems([]);
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

  const handleItemLike = async (itemId: string, currentLikedState: boolean) => {
    if (!token || !itemId) return;

    try {
      const newLikedState = !currentLikedState;

      setUserItems((prevItems) =>
        prevItems.map((userItem) =>
          userItem.id === itemId
            ? {
                ...userItem,
                isFavourite: newLikedState,
                favouriteCount: newLikedState
                  ? (userItem.favouriteCount || 0) + 1
                  : Math.max((userItem.favouriteCount || 0) - 1, 0),
              }
            : userItem,
        ),
      );

      if (newLikedState) {
        await wardrobeServices.favouriteItem({ itemId }, token);
        toast.show('Added to favorites', { type: 'success', duration: 2000 });
      } else {
        await wardrobeServices.removeFavouriteItem({ itemId }, token);
        toast.show('Removed from favorites', {
          type: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      // Revert on error
      setUserItems((prevItems) =>
        prevItems.map((userItem) =>
          userItem.id === itemId
            ? {
                ...userItem,
                isFavourite: currentLikedState,
                favouriteCount: currentLikedState
                  ? (userItem.favouriteCount || 0) + 1
                  : Math.max((userItem.favouriteCount || 0) - 1, 0),
              }
            : userItem,
        ),
      );
      toast.show('Failed to update favorites', {
        type: 'danger',
        duration: 2000,
      });
    }
  };

  const handleItemPress = (selectedItem: any) => {
    const essentialData = {
      ...selectedItem,
      username: selectedItem.username || storedUsername || item?.username,
      userImageUrl: selectedItem.userImageUrl || item?.userImageUrl,
      userId: selectedItem.userId || selectedItem.sellerId || currentUserId,
    };

    router.push({
      pathname: '/itemDetailsUpd',
      params: {
        itemId: selectedItem.id,
        itemData: JSON.stringify(essentialData),
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
            onPress={() => {
              fetchItemDetails(Array.isArray(itemId) ? itemId[0] : itemId);
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
      <StackHeader
        title={`${item?.username || 'User'}'s wardrobe`}
        onPress={handleGoBack}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Large Item Image */}
        <View style={styles.imageContainer}>
          {item?.defaultImageUrl || item?.imageUrl ? (
            <Image
              source={{ uri: item.defaultImageUrl || item.imageUrl }}
              style={styles.itemImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>

        {/* Item Name and Description */}
        {item?.name && (
          <View style={styles.itemInfoContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item?.description && (
              <Text style={styles.itemDescription}>{item.description}</Text>
            )}
          </View>
        )}

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

            {/* Username and Verified Badge */}
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>
                {item?.username || 'Unknown User'}
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

        {/* Other Items by User Section */}
        <View style={styles.otherItemsSection}>
          <Text style={styles.otherItemsTitle}>
            Other items by{' '}
            <Text style={styles.usernameHighlight}>
              {item?.username || 'this user'}
            </Text>
          </Text>

          {loadingUserItems ? (
            <GridSkeleton />
          ) : userItems.length > 0 ? (
            <View style={styles.itemsGrid}>
              {userItems.map((userItem, index) => (
                <View key={userItem.id || index} style={styles.gridItem}>
                  <ItemCard
                    item={userItem}
                    onPress={() => handleItemPress(userItem)}
                    onLike={() =>
                      handleItemLike(
                        userItem.id,
                        userItem?.isFavourite || false,
                      )
                    }
                    isLiked={userItem?.isFavourite || false}
                    likeCount={userItem?.favouriteCount || 0}
                    userName={item?.username}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No other items found</Text>
            </View>
          )}
        </View>
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
  itemInfoContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212C3D',
    marginBottom: 8,
    fontFamily: 'DMSansBold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
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
  otherItemsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  otherItemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'DMSansMedium',
  },
  usernameHighlight: {
    fontWeight: 'bold',
    fontFamily: 'DMSansBold',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'DMSansRegular',
  },
});

export default ItemDetailsUpd;

