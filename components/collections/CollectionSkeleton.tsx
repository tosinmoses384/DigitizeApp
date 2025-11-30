import React, { useRef, useEffect } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const WIDTH = Dimensions.get('window').width;

interface CollectionSkeletonProps {
  count?: number;
}

const CollectionSkeleton: React.FC<CollectionSkeletonProps> = ({ count = 3 }) => {
  const shimmerAnimation = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnimation]);

  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: [-WIDTH, WIDTH],
  });

  const ShimmerOverlay = (
    <Animated.View
      style={[
        styles.shimmerOverlay,
        { transform: [{ translateX: shimmerTranslate }] },
      ]}
    >
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.6)',
          'rgba(52, 50, 50, 0.2)',
          'rgba(255, 255, 255, 0)',
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      />
    </Animated.View>
  );

  const CollectionItemSkeleton = () => (
    <View style={styles.collectionContainer}>
      {/* Collection Header Skeleton */}
      <View style={styles.collectionHeader}>
        <View style={styles.collectionTitleContainer}>
          <View style={styles.skeletonTitle}>
            {ShimmerOverlay}
          </View>
          <View style={styles.skeletonDescription}>
            {ShimmerOverlay}
          </View>
        </View>
        <View style={styles.skeletonViewAllButton}>
          {ShimmerOverlay}
        </View>
      </View>

      {/* Outfit Preview Skeleton */}
      <View style={styles.previewContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.previewCard}>
            <View style={styles.skeletonOutfitImage}>
              {ShimmerOverlay}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <CollectionItemSkeleton key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  collectionContainer: {
    marginBottom: 24,
    marginTop: 10,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  collectionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  skeletonDescription: {
    height: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    width: '70%',
    overflow: 'hidden',
  },
  skeletonViewAllButton: {
    height: 16,
    width: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  previewContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  previewCard: {
    width: 110,
  },
  skeletonOutfitImage: {
    height: 150,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
});

export default CollectionSkeleton;
