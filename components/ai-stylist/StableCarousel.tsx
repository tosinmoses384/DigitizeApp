import React, { useCallback, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Animated } from 'react-native';
import { Image } from 'expo-image';
import {
  CAROUSEL_CONFIG,
  CAROUSEL_WIDTH,
  CAROUSEL_IMAGES,
  ACCESSIBILITY_CONFIG,
  ACTIVE_ITEM_STYLE,
} from './constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StableCarouselProps {
  onIndexChange?: (index: number) => void;
}

interface CarouselItemProps {
  item: any;
  index: number;
  isActive: boolean;
}

// Simple, stable carousel item component
const StableCarouselItem: React.FC<CarouselItemProps> = React.memo(
  ({ item, index, isActive }) => {
    const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.9)).current;
    
    useEffect(() => {
      Animated.timing(scaleAnim, {
        toValue: isActive ? 1 : 0.9,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [isActive, scaleAnim]);
    
    return (
      <View style={styles.itemContainer}>
        <Animated.View 
          style={[
            styles.imageContainer,
            isActive && styles.activeImageContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
          accessibilityRole={ACCESSIBILITY_CONFIG.ITEM_ROLE}
          accessibilityLabel={`Outfit suggestion ${index + 1}`}
        >
          <Image
            style={styles.image}
            contentFit="cover"
            source={item}
            cachePolicy="memory-disk"
            transition={200}
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
      </View>
    );
  }
);

StableCarouselItem.displayName = 'StableCarouselItem';

/**
 * StableCarousel - Rock-solid carousel using only React Native Animated API
 * No react-native-reanimated dependencies to avoid crashes
 * Smooth animations with native driver
 */
const StableCarousel: React.FC<StableCarouselProps> = React.memo(
  ({ onIndexChange }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    
    const itemWidth = CAROUSEL_CONFIG.ITEM_WIDTH + CAROUSEL_CONFIG.ITEM_SPACING;
    
    // Handle index change
    const handleIndexChange = useCallback((index: number) => {
      setCurrentIndex(index);
      onIndexChange?.(index);
    }, [onIndexChange]);
    
    // Auto-scroll functionality
    useEffect(() => {
      const startAutoScroll = () => {
        intervalRef.current = setInterval(() => {
          setCurrentIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % CAROUSEL_IMAGES.TOP_CAROUSEL.length;
            
            flatListRef.current?.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
            
            return nextIndex;
          });
        }, CAROUSEL_CONFIG.AUTO_PLAY_INTERVAL);
      };
      
      const timer = setTimeout(startAutoScroll, 1000);
      
      return () => {
        clearTimeout(timer);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);
    
    // Handle index change callback
    useEffect(() => {
      handleIndexChange(currentIndex);
    }, [currentIndex, handleIndexChange]);
    
    // Render item function
    const renderItem = useCallback(
      ({ item, index }: { item: any; index: number }) => {
        const isActive = index === currentIndex;
        
        return (
          <StableCarouselItem
            item={item}
            index={index}
            isActive={isActive}
          />
        );
      },
      [currentIndex]
    );
    
    // Key extractor
    const keyExtractor = useCallback(
      (item: any, index: number) => `stable-carousel-item-${index}`,
      []
    );
    
    // Get item layout for performance
    const getItemLayout = useCallback(
      (data: any, index: number) => ({
        length: itemWidth,
        offset: itemWidth * index,
        index,
      }),
      [itemWidth]
    );
    
    // Handle scroll to item
    const handleScrollToIndexFailed = useCallback(
      (info: any) => {
        const wait = new Promise(resolve => setTimeout(resolve, 500));
        wait.then(() => {
          flatListRef.current?.scrollToIndex({ 
            index: info.index, 
            animated: true 
          });
        });
      },
      []
    );
    
    return (
      <View 
        style={styles.container}
        accessibilityLabel={ACCESSIBILITY_CONFIG.CAROUSEL_LABEL}
        accessibilityHint={ACCESSIBILITY_CONFIG.CAROUSEL_HINT}
      >
        <FlatList
          ref={flatListRef}
          data={CAROUSEL_IMAGES.TOP_CAROUSEL}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
          scrollEnabled={true}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          contentContainerStyle={styles.flatListContent}
          style={styles.flatList}
          decelerationRate="fast"
          snapToInterval={itemWidth}
          snapToAlignment="center"
          initialScrollIndex={0}
          removeClippedSubviews={false}
          maxToRenderPerBatch={5}
          windowSize={5}
          updateCellsBatchingPeriod={50}
        />
      </View>
    );
  }
);

StableCarousel.displayName = 'StableCarousel';

const styles = StyleSheet.create({
  container: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_CONFIG.ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatList: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_CONFIG.ITEM_HEIGHT,
  },
  flatListContent: {
    alignItems: 'center',
    paddingHorizontal: (CAROUSEL_WIDTH - CAROUSEL_CONFIG.ITEM_WIDTH) / 2,
  },
  itemContainer: {
    width: CAROUSEL_CONFIG.ITEM_WIDTH,
    height: CAROUSEL_CONFIG.ITEM_HEIGHT,
    marginHorizontal: CAROUSEL_CONFIG.ITEM_SPACING / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: CAROUSEL_CONFIG.ITEM_WIDTH,
    height: CAROUSEL_CONFIG.ITEM_HEIGHT,
    borderRadius: ACTIVE_ITEM_STYLE.borderRadius,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  activeImageContainer: {
    borderWidth: ACTIVE_ITEM_STYLE.borderWidth,
    borderColor: ACTIVE_ITEM_STYLE.borderColor,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default StableCarousel;
