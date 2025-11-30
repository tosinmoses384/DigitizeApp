import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import ImagePreviewModal from '@modals/ImagePreviewModal';
import VerifiedIcon from '../assets/images/svg/verified.svg';
import { Image } from 'expo-image';

interface ItemCardProps {
  item: any;
  onPress?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
  likeCount?: number;
  userName?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onPress,
  onLike,
  isLiked = false,
  likeCount,
  userName,
}) => {
  const itemImage = item?.defaultImageUrl;
  const userProfileImage = item?.userImageUrl;

  const getDisplayName = () => {
    // Check if it's an item (has brandName/brand/itemBrand)
    if (item?.brandName || item?.brand || item?.itemBrand) {
      return item?.brandName || item?.brand || item?.itemBrand || 'Item';
    }
    // Check if it's an outfit (has description)
    if (item?.description) {
      return item?.description || item?.name || item?.title || 'Outfit';
    }
    // Fallback to username if neither
    return userName || item?.username || 'Unknown User';
  };

  const displayUserName = getDisplayName();
  const isVerified = item?.hasTag;

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [didLongPress, setDidLongPress] = useState(false);

  const handleClosePreview = useCallback(() => {
    setIsPreviewVisible(false);
    setDidLongPress(false);
  }, []);

  const handleLongPress = useCallback(() => {
    if (itemImage) {
      setDidLongPress(true);
      setIsPreviewVisible(true);
    }
  }, [itemImage]);

  const handlePress = useCallback(() => {
    if (didLongPress) {
      setDidLongPress(false);
      return;
    }
    if (onPress) onPress();
  }, [didLongPress, onPress]);

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={300}
      accessibilityRole="button"
      accessibilityLabel="Open item details"
      accessibilityHint="Long press to preview image"
    >
      {/* Item Image */}
      <View style={styles.imageContainer}>
        {itemImage ? (
          <Image
            source={{ uri: itemImage }}
            style={styles.itemImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            recyclingKey={item?.id || itemImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

      {/* User Info and Like */}
      <View style={styles.bottomSection}>
        <View style={styles.userInfo}>
          {/* Profile Picture */}
          <View style={styles.profileImageContainer}>
            {userProfileImage ? (
              <Image
                source={{ uri: userProfileImage }}
                style={styles.profileImage}
                contentFit="cover"
                transition={150}
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={styles.defaultProfile}>
                <Text style={styles.defaultProfileText}>
                  {displayUserName
                    ? displayUserName.charAt(0).toUpperCase()
                    : 'U'}
                </Text>
              </View>
            )}
          </View>

          {/* Username and Verified Badge */}
          <View style={styles.userNameContainer}>
            <Text style={styles.userName} numberOfLines={1}>
              {displayUserName}
            </Text>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <VerifiedIcon width={12} height={12} />
              </View>
            )}
          </View>
        </View>

        {/* Like Button and Count */}
        <Pressable
          style={styles.likeSection}
          onPress={onLike}
          accessibilityRole="button"
          accessibilityLabel={isLiked ? 'Unlike item' : 'Like item'}
          accessibilityState={{ selected: isLiked }}
        >
          <Image
            source={
              isLiked
                ? require('../assets/images/svg/like2.png')
                : require('../assets/images/svg/like.png')
            }
            style={styles.detailIcon}
            contentFit="contain"
            cachePolicy="memory"
          />
          <Text style={styles.likeCount}>{likeCount}</Text>
        </Pressable>
      </View>
      <ImagePreviewModal
        isVisible={isPreviewVisible}
        onClose={handleClosePreview}
        uri={itemImage || ''}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 8, // Add margin around the card for spacing
  },
  imageContainer: {
    borderRadius: 8,
    width: '100%',
    aspectRatio: 3 / 4, // Instagram-style 3:4 ratio
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
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
    fontSize: 12,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12, // Add horizontal padding inside the card
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    marginRight: 8,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  defaultProfile: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF5C68',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
    marginRight: 4,
  },
  verifiedBadge: {
    marginLeft: 2,
  },
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  detailIcon: {
    width: 29,
    height: 29,
    resizeMode: 'contain',
  },
});

export default React.memo(ItemCard);
