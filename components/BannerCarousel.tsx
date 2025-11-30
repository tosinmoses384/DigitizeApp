import React from 'react';
import {
  View,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  Linking,
} from 'react-native';
import {WIDTH} from '../constants';
import {IBanner} from '@services/features/banner-service/models';

interface BannerCarouselProps {
  banners: IBanner[];
  loading?: boolean;
  error?: string | null;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  loading = false,
  error = null,
}) => {
  const handleBannerPress = async (banner: IBanner) => {
    if (banner.actionUrl) {
      try {
        const canOpen = await Linking.canOpenURL(banner.actionUrl);
        if (canOpen) {
          await Linking.openURL(banner.actionUrl);
        } else {
          console.warn('Cannot open URL:', banner.actionUrl);
        }
      } catch (err) {
        console.error('Error opening banner URL:', err);
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#FF3B4A" />
        <Text style={styles.loadingText}>...Loading banners</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load banners</Text>
      </View>
    );
  }

  // Don't render anything if no banners
  if (!banners || banners.length === 0) {
    return null;
  }

  // Single banner
  if (banners.length === 1) {
    const banner = banners[0];
    return (
      <View style={styles.container}>
        <Pressable
          style={styles.bannerContainer}
          // onPress={() => handleBannerPress(banner)}
          >
          <Image
            source={{uri: banner?.imageUrl}}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </Pressable>
      </View>
    );
  }

  // Multiple banners - horizontal scroll
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        style={styles.scrollView}>
        {banners.map(banner => (
          <Pressable
            key={banner.id}
            style={styles.bannerContainer}
            // onPress={() => handleBannerPress(banner)}
            >
            <Image
              source={{uri: banner?.imageUrl}}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  scrollView: {
    flexDirection: 'row',
  },
  bannerContainer: {
    marginRight: 10,
  },
  bannerImage: {
    height: 150,
    width: WIDTH - 30,
    borderRadius: 12,
  },
  loadingContainer: {
    height: 150,
    width: WIDTH - 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginRight: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    height: 150,
    width: WIDTH - 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginRight: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#999',
  },
});

export default BannerCarousel;
